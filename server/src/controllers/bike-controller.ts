import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { In, Repository } from "typeorm";
import { QueryParams } from "../types/QueryParams";
import { QueryBuilder } from "../utils/QueryBuilder";
import { asyncHandler } from "../utils/async-handler";
import { BadRequestError, NotFoundError } from "../errors/http.errors";
import { Bike } from "../entities/Bike";
import { UserAddress } from "../entities/UserAddress";
import { User } from "../entities/User";
import { BikeStatus } from "../entities/Bike";
import { Review } from "../entities/Review";
import { Booking, BookingStatus } from "../entities/Booking";

export class BikeController {
  private repository: Repository<Bike> = AppDataSource.getRepository(Bike);
  private addressRepository: Repository<UserAddress> =
    AppDataSource.getRepository(UserAddress);
  private userRepository: Repository<User> = AppDataSource.getRepository(User);
  private queryBuilder: QueryBuilder<Bike>;

  constructor() {
    this.queryBuilder = new QueryBuilder(this.repository, {
      alias: "bikes",
      defaultLimit: 25,
      maxLimit: 100,
      defaultSortBy: "createdAt",
      defaultOrder: "DESC",
      searchableFields: ["brand", "model", "description", "category"],
      allowedSortFields: ["createdAt", "updatedAt", "dailyRate"],
      filterableFields: ["status", "category", "size", "ownerId", "addressId"],
    });
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  calculateDistance(
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLng = this.toRadians(lng2 - lng1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in kilometers
  }

  private format = (data: any) => {
    return {
      ...data,
      owner: {
        id: data.owner?.id,
        name: data.owner?.name,
        email: data.owner?.email,
        profileUrl: data.owner?.profileUrl,
        createdAt: data?.owner?.createdAt,
      },
    };
  };

  create = asyncHandler(async (req: Request, res: Response) => {
    const {
      brand,
      model,
      description,
      category,
      images,
      addressId,
      dailyRate,
      dailyDiscount,
      size,
      weeklyDiscount,
      monthlyDiscount,
      status,
      directBooking,
      subCategory,
      accessories,
    } = req.body;

    const address = await this.addressRepository.findOneBy({ id: addressId });
    if (!address) {
      throw new NotFoundError(`Address with ID ${addressId} not found`);
    }

    const bike = new Bike();
    bike.brand = brand;
    bike.model = model;
    bike.description = description;
    bike.category = category;
    bike.images = images || [];
    bike.address = address;
    bike.owner = { id: req?.user?.id } as User;
    bike.dailyRate = dailyRate;
    bike.dailyDiscount = dailyDiscount || null;
    bike.size = size;
    bike.weeklyDiscount = weeklyDiscount || null;
    bike.monthlyDiscount = monthlyDiscount || null;
    bike.status = status || BikeStatus.AVAILABLE;
    bike.directBooking = directBooking || false;
    bike.subCategory = subCategory || null;
    bike.accessories = accessories || null;

    await this.repository.save(bike);

    return res.status(201).json({
      status: "success",
      data: this.format(bike),
    });
  });

  getAll = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.queryBuilder.buildAndExecute(
      req.query as QueryParams,
      [],
      ["bikes.owner", "bikes.address"],
      [
        {
          path: "owner",
          alias: "bikeOwner",
          type: "leftJoin",
        },
        {
          path: "address",
          alias: "bikeAddress",
          type: "leftJoin",
        },
      ]
    );

    return res.json({
      status: "success",
      ...result,
      results: result.results.map(this.format),
    });
  });

  getOne = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const bike = await this.repository.findOne({
      where: { id: Number(id) },
      relations: ["owner", "address", "reviews", "reviews.user"],
    });

    if (!bike) {
      throw new NotFoundError("Bike not found");
    }

    const averageRating: number =
      bike?.reviews.reduce((total, review) => total + review.rating, 0) /
      bike?.reviews.length;

    return res.json({
      status: "success",
      data: this.format({ ...bike, averageRating }),
    });
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    const bike = await this.repository.findOne({
      where: { id: Number(id) },
      relations: ["owner", "address"],
    });

    if (!bike) {
      throw new NotFoundError("Bike not found");
    }

    // Update basic fields
    if (updates.brand) bike.brand = updates.brand;
    if (updates.model) bike.model = updates.model;
    if (updates.description) bike.description = updates.description;
    if (updates.category) bike.category = updates.category;
    if (updates.images) bike.images = updates.images;
    if (updates.dailyRate) bike.dailyRate = updates.dailyRate;
    if (updates.dailyDiscount !== undefined)
      bike.dailyDiscount = updates.dailyDiscount;
    if (updates.size) bike.size = updates.size;
    if (updates.weeklyDiscount !== undefined)
      bike.weeklyDiscount = updates.weeklyDiscount;
    if (updates.monthlyDiscount !== undefined)
      bike.monthlyDiscount = updates.monthlyDiscount;
    if (updates.status) bike.status = updates.status;
    if (updates.directBooking !== undefined)
      bike.directBooking = updates.directBooking;
    if (updates.subCategory) bike.subCategory = updates.subCategory;
    if (updates.accessories) bike.accessories = updates.accessories;

    // Update relationships if needed
    if (updates.addressId) {
      const address = await this.addressRepository.findOneBy({
        id: updates.addressId,
      });
      if (!address) {
        throw new NotFoundError(
          `Address with ID ${updates.addressId} not found`
        );
      }
      bike.address = address;
    }

    if (updates.ownerId) {
      const owner = await this.userRepository.findOneBy({
        id: updates.ownerId,
      });
      if (!owner) {
        throw new NotFoundError(`User with ID ${updates.ownerId} not found`);
      }
      bike.owner = owner;
    }

    await this.repository.save(bike);

    return res.json({
      status: "success",
      data: this.format(bike),
    });
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const bike = await this.repository.findOneBy({ id: Number(id) });

    if (!bike) {
      throw new NotFoundError("Bike not found");
    }

    await this.repository.remove(bike);

    return res.json({
      status: "success",
      message: "Bike deleted successfully",
    });
  });

  search = asyncHandler(async (req: Request, res: Response) => {
    // Validate and parse query parameters
    const searchParams: any = req.query;

    // Destructure with defaults to avoid undefined errors
    const {
      sortBy = "createdAt",
      sortOrder = "DESC",
      latitude,
      longitude,
      category,
      brand,
    } = searchParams;

    const radius = 10;

    let query = this.repository.createQueryBuilder("bikes");

    const radiusInMeters = radius * 1000;

    // join address
    query.leftJoinAndSelect("bikes.address", "address");

    query = query.andWhere(
      `(6371000 * acos(cos(radians(:lat)) * cos(radians(address.latitude)) * cos(radians(address.longitude) - radians(:lng)) + sin(radians(:lat)) * sin(radians(address.latitude)))) <= :radius`,
      { lat: latitude, lng: longitude, radius: radiusInMeters }
    );

    if (category) {
      query = query.andWhere("bikes.category = :category", { category });
    }

    if (brand) {
      query = query.andWhere("bikes.brand = :brand", { brand });
    }

    query = query.orderBy("bikes." + sortBy, sortOrder);

    const bikes = await query.getMany();

    // Calculate distances and sort by distance
    const bikesWithDistance: any[] = bikes
      .map((bike) => ({
        ...bike,
        distance: this.calculateDistance(
          latitude,
          longitude,
          bike?.address?.latitude,
          bike?.address?.longitude
        ),
      }))
      .sort((a, b) => (a.distance || 0) - (b.distance || 0));

    return res.json({
      status: "success",
      data: bikesWithDistance,
      meta: {
        count: bikes.length,
        filtersApplied: {
          sortBy,
          sortOrder,
        },
      },
    });
  });

  // get frequently booked bikes
  getFrequentlyBooked = asyncHandler(async (req: Request, res: Response) => {
    const bikes = await this.repository.find({
      where: { status: BikeStatus.AVAILABLE },
      order: { id: "DESC" },
      take: 10,
      relations: ["address", "owner"],
    });

    return res.json({
      status: "success",
      data: bikes,
    });
  });

  getRecentBooked = asyncHandler(async (req: Request, res: Response) => {
    const recentBooked = await AppDataSource.getRepository(Booking).find({
      where: {
        status: In([
          BookingStatus.CONFIRMED,
          BookingStatus.ACTIVE,
          BookingStatus.COMPLETED,
        ]),
      },
      order: { createdAt: "DESC" },
      take: 10,
      relations: ["bike", "bike.address"],
    });

    return res.json({
      status: "success",
      data: recentBooked.map((e) => this.format(e.bike)),
    });
  });

  getMine = asyncHandler(async (req: Request, res: Response) => {
    const bikes = await this.repository.find({
      where: { owner: { id: req.user.id } },
      relations: ["address", "owner"],
      order: { createdAt: "DESC" },
    });

    return res.json({
      status: "success",
      data: bikes,
    });
  });

  // Additional custom methods for bike status changes
  updateStatus = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!Object.values(BikeStatus).includes(status)) {
      throw new BadRequestError("Invalid bike status");
    }

    const bike = await this.repository.findOneBy({ id: Number(id) });
    if (!bike) {
      throw new NotFoundError("Bike not found");
    }

    bike.status = status;
    await this.repository.save(bike);

    return res.json({
      status: "success",
      data: this.format(bike),
    });
  });

  createReview = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { content, rating, photos } = req.body;
    const userId = (req as any).user?.id;

    const box = await this.repository.findOneBy({ id: Number(id) });

    if (!box) {
      throw new NotFoundError("Box not found");
    }

    // check if user has already reviewed this box
    const existingReview = await AppDataSource.getRepository(Review).findOne({
      where: {
        bike: { id: Number(id) },
        user: { id: userId },
      },
    });

    if (existingReview) {
      throw new BadRequestError("You have already reviewed this box");
    }

    const review = new Review();
    review.bike = box;
    review.user = { id: userId } as User;
    review.content = content;
    review.rating = rating;
    review.photos = photos;

    await AppDataSource.getRepository(Review).save(review);

    return res.json({
      status: "success",
      message: "Review created successfully",
    });
  });
}
