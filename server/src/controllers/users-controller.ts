import { Request, Response } from "express";
import { AppDataSource } from "../data-source";
import { Repository } from "typeorm";
import { QueryParams } from "../types/QueryParams";
import { QueryBuilder } from "../utils/QueryBuilder";
import { asyncHandler } from "../utils/async-handler";
import { User } from "../entities/User";
import { BadRequestError } from "../errors/http.errors";

export class UsersController {
  private repository: Repository<User> = AppDataSource.getRepository(User);

  private queryBuilder: QueryBuilder<User>;

  constructor() {
    this.queryBuilder = new QueryBuilder(this.repository, {
      alias: "users",
      defaultLimit: 200,
      maxLimit: 100,
      defaultSortBy: "createdAt",
      defaultOrder: "DESC",
      searchableFields: ["name", "email", "phone", "firstName", "lastName"],
      allowedSortFields: ["createdAt", "updatedAt", "name", "email"],
      filterableFields: ["status", "role", "provider", "hasMadePurchase"],
    });
  }

  private format = (data: User) => {
    // Exclude sensitive fields like password
    const { password, ...rest } = data;
    return {
      ...rest,
    };
  };

  getAllCustomers = asyncHandler(async (req: Request, res: Response) => {
    //@ts-ignore
    const result = await this?.queryBuilder.buildAndExecute(
      req.query as QueryParams,
      [
        {
          where: `users."role" = :role`,
          parameters: { role: "customer" },
        },
      ],
      []
    );

    let users = result?.results;

    res.json({
      ...result,
      results: users?.map((user) => ({
        ...this.format(user),
      })),
    });
  });

  getAllSystemUsers = asyncHandler(async (req: Request, res: Response) => {
    //@ts-ignore
    const result = await this?.queryBuilder.buildAndExecute(
      req.query as QueryParams,
      [
        {
          where: `users."role" != :role`,
          parameters: { role: "customer" },
        },
      ],
      []
    );

    let users = result?.results;

    res.json({
      ...result,
      results: users?.map((user) => ({
        ...this.format(user),
      })),
    });
  });

  // update but only status
  update = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, role } = req.body;

    const user = await this.repository.findOne({ where: { id: parseInt(id) } });

    if (!user) {
      throw new Error("User not found");
    }

    user.status = status;
    user.role = role;

    await this.repository.save(user);

    res.json(this.format(user));
  });

  //create check if user exists not with role of customer then assign role if exist and not customer throw error
  create = asyncHandler(async (req: Request, res: Response) => {
    const { email, role } = req.body;

    const user = await this.repository.findOne({ where: { email } });

    if (user) {
      if (user.role !== "user") {
        throw new BadRequestError("Staff already exists");
      }

      user.role = role;
      await this.repository.save(user);
      res.json(this.format(user));
      return;
    }

    const newUser = this.repository.create({
      email,
      role,
    });

    await this.repository.save(newUser);

    res.json(this.format(newUser));
  });
}
