import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from "typeorm";
import { UserAddress } from "./UserAddress";
import { User } from "./User";
import { Review } from "./Review";

export enum BikeStatus {
  AVAILABLE = "available",
  RENTED = "rented",
  MAINTENANCE = "maintenance",
  RESERVED = "reserved",
  UNAVAILABLE = "unavailable",
}

@Entity()
export class Bike {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: "varchar", length: 100 })
  brand: string;

  @Column({ type: "varchar", length: 100 })
  model: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "varchar", length: 100 })
  category: string;

  // subcategory
  @Column({ type: "varchar", length: 100, nullable: true })
  subCategory: string;

  // accessories
  @Column({ type: "jsonb", nullable: true })
  accessories: string[];

  @Column({ type: "jsonb", nullable: true })
  images: string[];

  @ManyToOne(() => UserAddress)
  address: UserAddress;

  @ManyToOne(() => User)
  owner: User;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  dailyRate: number;

  // daily discount
  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  dailyDiscount: number;

  @Column({ type: "varchar", length: 50 })
  size: string; // e.g., 'S', 'M', 'L', 'XL'

  // weekly discount
  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  weeklyDiscount: number;

  // monthly discount
  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  monthlyDiscount: number;

  @Column({ type: "enum", enum: BikeStatus, default: BikeStatus.AVAILABLE })
  status: BikeStatus;

  // directBooking
  @Column({ type: "boolean", default: false })
  directBooking: boolean;

  // reviews
  @OneToMany(() => Review, (review) => review.bike)
  reviews: Review[];

  // requireDeposit
  @Column({ type: "boolean", default: false })
  requireDeposit: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
