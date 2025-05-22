import { NextFunction, Request, Response } from "express";
import { UserAddress } from "../entities/UserAddress";
import { User } from "../entities/User";
import { AppDataSource } from "../data-source";
import { asyncHandler } from "../utils/async-handler";
import { BadRequestError, NotFoundError } from "../errors/http.errors";

export const createUserAddress = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id;
    const data = req.body;

    const user = await User.findOne({
      where: { id: userId },
      relations: ["addresses"],
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    // If setting as primary, update other addresses to not be primary
    if (data.isPrimary) {
      await AppDataSource.manager.transaction(
        async (transactionalEntityManager) => {
          await transactionalEntityManager
            .createQueryBuilder()
            .update(UserAddress)
            .set({ isPrimary: false })
            .where("userId = :userId", { userId })
            .execute();
        }
      );
    }

    const address = new UserAddress();
    address.user = user;
    address.firstName = data.firstName;
    address.lastName = data.lastName;
    address.street = data.street;
    address.district = data.district;
    address.sector = data.sector;
    address.cell = data.cell;
    address.village = data.village;
    address.phoneNumber = data.phoneNumber;
    address.isPrimary = data.isPrimary;

    await address.save();

    res.json(address);
  }
);

export const updateUserAddress = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const data = req.body;

    const address = await UserAddress.findOne({
      where: { id: parseInt(id), user: { id: userId } },
    });

    if (!address) {
      throw new NotFoundError("Address not found");
    }

    // If setting as primary, update other addresses to not be primary
    if (data.isPrimary) {
      await AppDataSource.manager.transaction(
        async (transactionalEntityManager) => {
          await transactionalEntityManager
            .createQueryBuilder()
            .update(UserAddress)
            .set({ isPrimary: false })
            .where("userId = :userId", { userId })
            .execute();
        }
      );
    }

    address.firstName = data.firstName;
    address.lastName = data.lastName;
    address.street = data.street;
    address.district = data.district;
    address.sector = data.sector;
    address.cell = data.cell;
    address.village = data.village;
    address.phoneNumber = data.phoneNumber;
    address.isPrimary = data.isPrimary;

    await address.save();

    res.json(address);
  }
);

export const deleteUserAddress = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const address = await UserAddress.findOne({
      where: { id: parseInt(id), user: { id: userId } },
    });

    if (!address) {
      throw new NotFoundError("Address not found");
    }

    await address.remove();

    res.json({ message: "Address deleted successfully" });
  }
);

export const getUserAddresses = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = (req as any).user?.id;

    const addresses = await UserAddress.find({
      where: { user: { id: userId } },
      order: { createdAt: "DESC" },
    });

    res.json(addresses);
  }
);

export const makePrimaryAddress = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;
    const userId = (req as any).user?.id;

    const address = await UserAddress.findOne({
      where: { id: parseInt(id), user: { id: userId } },
    });

    if (!address) {
      throw new NotFoundError("Address not found");
    }

    // update other addresses to not be primary
    await UserAddress.update({ user: { id: userId } }, { isPrimary: false });

    address.isPrimary = true;

    await address.save();

    res.json(address);
  }
);
