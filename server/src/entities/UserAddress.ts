import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  BaseEntity,
} from "typeorm";
import { User } from "./User";

@Entity()
export class UserAddress extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.addresses)
  user: User;

  @Column()
  zipCode: string;

  @Column()
  country: string;

  @Column()
  city: string;

  @Column()
  street: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ default: false })
  isPrimary: boolean;

  @Column("decimal", { precision: 10, scale: 8, default: 0 })
  latitude: number;

  @Column("decimal", { precision: 11, scale: 8, default: 0 })
  longitude: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
