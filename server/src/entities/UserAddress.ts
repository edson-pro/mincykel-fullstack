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
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  street: string;

  @Column()
  district: string;

  @Column()
  sector: string;

  @Column()
  cell: string;

  @Column()
  village: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ default: false })
  isPrimary: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
