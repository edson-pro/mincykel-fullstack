import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import {
  Repository,
  In,
  Like,
  MoreThan,
  IsNull,
  LessThanOrEqual,
  Between,
} from "typeorm";
import { QueryParams } from "../types/QueryParams";
import { QueryBuilder } from "../utils/QueryBuilder";
import { asyncHandler } from "../utils/async-handler";
import { BadRequestError, NotFoundError } from "../errors/http.errors";
import { Bike } from "../entities/Bike";
import { UserAddress } from "../entities/UserAddress";
import { User } from "../entities/User";
import { BikeStatus } from "../entities/Bike";

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

  private format = (data: Bike) => {
    return {
      ...data,
      owner: {
        id: data.owner?.id,
        name: data.owner?.name,
        email: data.owner?.email,
        profileUrl: data.owner?.profileUrl,
      },
      address: {
        id: data.address?.id,
        street: data.address?.street,
        city: data.address?.city,
        zipCode: data.address?.zipCode,
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
      relations: ["owner", "address"],
    });

    if (!bike) {
      throw new NotFoundError("Bike not found");
    }

    return res.json({
      status: "success",
      data: this.format(bike),
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
      address = "",
      categories = [],
      sizes = [],
      brands = [],
      minPrice,
      maxPrice,
      sortBy = "createdAt",
      sortOrder = "DESC",
    } = searchParams;

    // Dynamic WHERE clause (only applies filters if values exist)
    const where: Record<string, any> = {};

    // Full-text search (case-insensitive)
    if (address) {
      where.address = Like(`%${address}%`);
    }

    // Array filters (only if non-empty)
    if (categories.length) where.category = In(categories);
    if (sizes.length) where.size = In(sizes);
    if (brands.length) where.brand = In(brands);

    // Price range filter
    if (minPrice !== undefined || maxPrice !== undefined) {
      where.price = Between(
        minPrice ?? 0, // Default to 0 if minPrice not provided
        maxPrice ?? Number.MAX_SAFE_INTEGER // Default to max safe int if no maxPrice
      );
    }

    // Execute query with sorting (no pagination)
    const bikes = await this.repository.find({
      where,
      order: { [sortBy]: sortOrder },
      // Optional: Eager-load relations (e.g., brand, category)
      relations: ["address"],
    });

    return res.json({
      status: "success",
      data: bikes,
      meta: {
        count: bikes.length,
        filtersApplied: {
          address: address || null,
          categories: categories.length ? categories : null,
          sizes: sizes.length ? sizes : null,
          brands: brands.length ? brands : null,
          priceRange:
            minPrice || maxPrice
              ? `${minPrice ?? "Any"} - ${maxPrice ?? "Any"}`
              : null,
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

  getMine = asyncHandler(async (req: Request, res: Response) => {
    const bikes = await this.repository.find({
      where: { owner: { id: req.user.id } },
      relations: ["address", "owner"],
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
}
