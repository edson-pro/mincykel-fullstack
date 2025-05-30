import { DataSource } from "typeorm";
import dotenv from "dotenv";
import { User } from "./entities/User";
import { RefreshToken } from "./entities/RefreshToken";
import { Setting } from "./entities/Setting";
import { UserAddress } from "./entities/UserAddress";
import { Bike } from "./entities/Bike";
dotenv.config();

export const MIGRATION_FILES =
  process.env.NODE_ENV === "development"
    ? ["./src/database/migrations/**/*.ts"]
    : ["./dist/database/migrations/**/*.js"];

export const AppDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL,
  entities: [User, RefreshToken, Setting, UserAddress, Bike],
  migrations: MIGRATION_FILES,
  migrationsRun: false,
  logging: false,
  synchronize: process.env.NODE_ENV === "development" ? true : false,
});
