import { configDotenv } from "dotenv";
import { AppDataSource } from "../data-source";
import { Bike } from "../entities/Bike";
import { BadRequestError } from "../errors/http.errors";
import { asyncHandler } from "../utils/async-handler";
import { Request, Response } from "express";
import Stripe from "stripe";
configDotenv();

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

// Helper function to convert dollars to cents
function dollarsToCents(dollars) {
  return Math.round(parseFloat(dollars) * 100);
}

// Helper function to ensure amount is an integer in cents
function validateAmount(amount) {
  // If amount is already in cents (integer), return as is
  if (Number.isInteger(amount) && amount > 0) {
    return amount;
  }

  // If amount is a decimal (dollars), convert to cents
  if (typeof amount === "number" || typeof amount === "string") {
    const cents = dollarsToCents(amount);
    if (cents > 0) {
      return cents;
    }
  }

  throw new Error(
    `Invalid amount: ${amount}. Amount must be a positive number.`
  );
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export class RentController {
  requestPaymentCheckout = asyncHandler(
    async (request: Request, response: Response) => {
      const { bikeId, quantity, total } = request.body;

      const bike = await AppDataSource.getRepository(Bike).findOne({
        where: { id: bikeId },
      });

      if (!bike) {
        throw new BadRequestError("Bike not found");
      }

      const lineItems = [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: bike.brand + " | " + bike.model,
              description: bike.description,
              images: [getFileUrl(bike.images[0]["path"])],
            },
            unit_amount: validateAmount(total), // Amount in cents
          },
          quantity: Number(quantity),
        },
      ];

      const session = await stripe.checkout.sessions.create({
        success_url: "http://localhost:3000",
        line_items: lineItems,
        mode: "payment",
        metadata: {
          bookingId: request.body.bookingId,
        },
      });

      response.json({ url: session.url });
    }
  );
}
