import { AppDataSource } from "../data-source";
import { In, Repository } from "typeorm";
import { QueryBuilder } from "../utils/QueryBuilder";
import { Booking, BookingStatus, PaymentStatus } from "../entities/Booking";
import Stripe from "stripe";
import { asyncHandler } from "../utils/async-handler";
import { Request, Response } from "express";
import { Bike, BikeStatus } from "../entities/Bike";
import cron from "node-cron";
import getPdf from "../lib/getInvoice";
import { BadRequestError } from "../errors/http.errors";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

const getFileUrl = (file) => {
  if (!file) {
    return "";
  }
  const backendUrl = "https://mincycel-l209l.sevalla.storage";

  // remove /api
  const url = backendUrl?.replace(/\/api$/, "");
  // @ts-ignore
  return file ? (file.startsWith("/") ? `${url}${file}` : file) : undefined;
};

function dollarsToCents(dollars: number) {
  return Math.round(parseFloat(dollars.toString()) * 100);
}

export class BookingController {
  private repository: Repository<Booking> =
    AppDataSource.getRepository(Booking);
  private queryBuilder: QueryBuilder<Booking>;

  constructor() {
    this.queryBuilder = new QueryBuilder(this.repository, {
      alias: "bookings",
      defaultLimit: 25,
      maxLimit: 100,
      defaultSortBy: "createdAt",
      defaultOrder: "DESC",
      searchableFields: ["bikeId", "userId"],
      allowedSortFields: ["createdAt", "updatedAt", "startTime", "endTime"],
      filterableFields: ["status", "paymentStatus", "bikeId", "userId"],
    });
  }

  private format = (data: any) => {
    return {
      ...data,
    };
  };

  create = asyncHandler(async (request: Request, response: Response) => {
    const {
      bikeId,
      startTime,
      endTime,
      totalAmount,
      discountAmount = 0,
      days,
      pickupTime,
      returnTime,
    } = request.body;

    const userId = request?.user?.id;

    // Check if bike is available
    const bike = await AppDataSource.getRepository(Bike).findOne({
      where: { id: bikeId },
    });

    if (!bike || bike.status !== BikeStatus.AVAILABLE) {
      throw new Error("Bike is not available");
    }

    // Check for conflicting bookings
    const conflictingBooking = await AppDataSource.getRepository(Booking)
      .createQueryBuilder("booking")
      .where("booking.bikeId = :bikeId", { bikeId })
      .andWhere("booking.status IN (:...statuses)", {
        statuses: [BookingStatus.CONFIRMED, BookingStatus.ACTIVE],
      })
      .andWhere(
        "(booking.startTime < :endTime AND booking.endTime > :startTime)",
        { startTime, endTime }
      )
      .getOne();

    if (conflictingBooking) {
      throw new BadRequestError(
        "Bike is already booked for the selected time period"
      );
    }

    // Create booking
    const bookingData = this.repository.create({
      userId,
      bikeId,
      startTime,
      endTime,
      totalAmount,
      discountAmount,
      status: BookingStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      days,
      pickupTime,
      returnTime,
    });

    const booking = await this.repository.save(bookingData);

    const checkout = await this.checkout(booking, bike);

    return response.json(checkout);
  });

  checkout = async (booking: Booking, bike: Bike) => {
    const lineItems = [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: bike.brand + " | " + bike.model,
            description: bike.description,
            images: [getFileUrl(bike.images[0]["path"])],
          },
          unit_amount: dollarsToCents(booking?.totalAmount), // Amount in cents
        },
        quantity: Number(1),
      },
    ];

    const session = await stripe.checkout.sessions.create({
      success_url: `${process.env.APP_URL}/checkout_success?bookingId=${booking.id}`,
      cancel_url: `${process.env.APP_URL}/bikes/${booking?.bikeId}`,
      line_items: lineItems,
      mode: "payment",
      metadata: {
        bookingId: booking.id,
      },
    });

    return { url: session.url };
  };

  handleWebhook = asyncHandler(async (request: any, response: Response) => {
    try {
      const signature = request.headers["stripe-signature"] as string;

      let event: Stripe.Event;

      const rawBody = request?.rawBody; // Use the raw body

      try {
        event = stripe.webhooks.constructEvent(
          rawBody,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET!
        );
      } catch (err) {
        throw new Error(`Webhook signature verification failed: ${err}`);
      }

      switch (event.type) {
        case "checkout.session.completed":
          console.log("Checkout session completed");
          await this.handleCheckoutSessionCompleted(
            event.data.object as Stripe.Checkout.Session
          );
          break;
        case "checkout.session.expired":
          console.log("Checkout session expired");
          await this.handleCheckoutSessionExpired(
            event.data.object as Stripe.Checkout.Session
          );
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      response.json({ received: true });
    } catch (error) {
      console.error("Webhook error:", error);
      response.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Webhook failed",
      });
    }
  });

  private async handleCheckoutSessionCompleted(
    session: Stripe.Checkout.Session
  ): Promise<void> {
    const bookingId = parseInt(session.metadata!.bookingId);
    await this.repository.update(bookingId, {
      status: BookingStatus.CONFIRMED,
      paymentStatus: PaymentStatus.PAID,
    });
  }

  private async handleCheckoutSessionExpired(
    session: Stripe.Checkout.Session
  ): Promise<void> {
    const bookingId = parseInt(session.metadata!.bookingId);
    await this.repository.update(bookingId, {
      status: BookingStatus.CANCELLED,
      paymentStatus: PaymentStatus.FAILED,
    });
  }

  async confirmBooking(bookingId: number): Promise<Booking> {
    const booking = await this.repository.findOne({
      where: { id: bookingId },
      relations: ["bike"],
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    booking.status = BookingStatus.CONFIRMED;
    booking.paymentStatus = PaymentStatus.PAID;

    // Mark bike as unavailable during the booking period
    await AppDataSource.getRepository(Bike).update(booking.bikeId, {
      status: BikeStatus.UNAVAILABLE,
    });

    return await this.repository.save(booking);
  }

  private async expireAbandonedBookings(): Promise<number> {
    const expiredBookings = await this.repository
      .createQueryBuilder("booking")
      .where("booking.status = :status", { status: BookingStatus.PENDING })
      .andWhere("booking.paymentStatus = :paymentStatus", {
        paymentStatus: PaymentStatus.PENDING,
      })
      .andWhere("booking.expiresAt < :now", { now: new Date() })
      .getMany();

    if (expiredBookings.length === 0) {
      return 0;
    }

    // Update expired bookings
    await this.repository.update(
      { id: In(expiredBookings.map((b) => b.id)) },
      {
        status: BookingStatus.EXPIRED,
        paymentStatus: PaymentStatus.EXPIRED,
      }
    );

    return expiredBookings.length;
  }

  startCleanupScheduler(): void {
    console.log("Starting booking cleanup scheduler");
    cron.schedule("*/5 * * * *", async () => {
      try {
        console.log("Running booking cleanup job...");
        await this.expireAbandonedBookings();
      } catch (error) {
        console.error("Cleanup job failed:", error);
      }
    });

    console.log("Booking cleanup scheduler started");
  }

  runCleanup = asyncHandler(async (request: Request, response: Response) => {
    await this.expireAbandonedBookings();
    response.json({ message: "Cleanup completed successfully" });
  });

  getOne = asyncHandler(async (request: Request, response: Response) => {
    const booking = await this.repository.findOne({
      where: { id: parseInt(request.params.id) },
      relations: ["bike", "bike.address"],
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    response.json(this.format(booking));
  });

  downloadInvoice = asyncHandler(async (req: Request, res: Response) => {
    const bookingId = parseInt(req.params.id);

    const booking = await this.repository.findOne({
      where: { id: bookingId },
      relations: ["bike", "bike.address", "user"],
    });

    if (!booking) {
      throw new Error("Booking not found");
    }

    console.log("Booking found:", booking);

    const pdf = await getPdf(booking);

    res.set("Content-Type", "application/pdf");
    res.set("Content-Disposition", "attachment; filename=invoice.pdf");

    // Pipe the PDF stream to the response
    pdf.pipe(res);
    pdf.on("end", () => console.log("PDF stream finished"));
  });

  getMyBookings = asyncHandler(async (request: Request, response: Response) => {
    const bookings = await this.repository.find({
      where: {
        userId: request.user.id,
        // status is confirmed, active, completed
        status: In([
          BookingStatus.CONFIRMED,
          BookingStatus.ACTIVE,
          BookingStatus.COMPLETED,
        ]),
      },
      relations: ["bike", "bike.address"],
    });

    response.json(bookings.map(this.format));
  });
}
