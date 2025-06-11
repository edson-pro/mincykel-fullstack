import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  BaseEntity,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from "typeorm";
import { RefreshToken } from "./RefreshToken";
import { UserAddress } from "./UserAddress";

export enum UserRole {
  USER = "user",
  ADMIN = "admin",
}

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  // bio
  @Column({ nullable: true })
  bio: string;

  @Column({ nullable: true })
  referralCode: string;

  @Column({ default: 0 })
  points: number;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: "referred_by_id" })
  referredBy: User;

  @Column({ default: false })
  hasMadePurchase: boolean;

  @Column({ nullable: true })
  gender: string;

  //dateOfBirth
  @Column({ nullable: true })
  dateOfBirth: Date;

  @Column({ unique: false, nullable: true })
  phone: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true, select: false })
  password: string;

  @Column({ default: "active" })
  status: string;

  @Column({ nullable: true })
  profileUrl: string;

  @Column()
  provider: string;

  @Column({
    type: "enum",
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user, {
    cascade: true,
    eager: false, // Set to true if you want to automatically load refresh tokens with user
  })
  refreshTokens: RefreshToken[];

  @OneToMany(() => UserAddress, (address) => address.user, {
    cascade: true,
    eager: false,
  })
  addresses: UserAddress[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
