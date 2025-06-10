import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from "typeorm";
import { UserAddress } from "./UserAddress";
import { User } from "./User";

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

  // requireDeposit
  @Column({ type: "boolean", default: false })
  requireDeposit: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
