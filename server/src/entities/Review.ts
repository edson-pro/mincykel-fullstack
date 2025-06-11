// entities/Review.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from "typeorm";
import { Bike } from "./Bike";
import { User } from "./User"; // Assuming you have a User entity

@Entity()
export class Review {
  @PrimaryGeneratedColumn()
  id: number;

  @Column("text")
  content: string;

  @Column("int")
  rating: number; // e.g., 1-5 stars

  @ManyToOne(() => Bike, (bike) => bike.reviews, {
    onDelete: "CASCADE",
  })
  bike: Bike;

  @ManyToOne(() => User)
  user: User;

  @Column({
    nullable: false,
    type: "jsonb",
    array: false,
    default: () => "'[]'",
  })
  photos: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
