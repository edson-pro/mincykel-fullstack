// entities/Booking.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { User } from "./User";
import { Bike } from "./Bike";

export enum BookingStatus {
  PENDING = "pending",
  CONFIRMED = "confirmed",
  ACTIVE = "active",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
}

export enum PaymentStatus {
  PENDING = "pending",
  PAID = "paid",
  FAILED = "failed",
  REFUNDED = "refunded",
  EXPIRED = "expired",
}

@Entity()
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User)
  user: User;

  @Column()
  userId: number;

  @ManyToOne(() => Bike)
  @JoinColumn({ name: "bikeId" })
  bike: Bike;

  @Column()
  bikeId: number;

  @Column("timestamp")
  startTime: Date;

  @Column("timestamp")
  endTime: Date;

  @Column("decimal", { precision: 10, scale: 2 })
  totalAmount: number;

  // days
  @Column("decimal", { precision: 10, scale: 2, nullable: true })
  days: number;

  //pickup time
  @Column("varchar", { nullable: true })
  pickupTime: string;

  //return time
  @Column("varchar", { nullable: true })
  returnTime: string;

  //  discount
  @Column("decimal", { precision: 10, scale: 2 })
  discountAmount: number;

  @Column({ type: "enum", enum: BookingStatus, default: BookingStatus.PENDING })
  status: BookingStatus;

  @Column({ type: "enum", enum: PaymentStatus, default: PaymentStatus.PENDING })
  paymentStatus: PaymentStatus;

  // stripe payment
  @Column({ nullable: true })
  stripePaymentId: string;

  @Column("timestamp", { nullable: true })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
