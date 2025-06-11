import { MigrationInterface, QueryRunner } from "typeorm";

export class Sh1749599680343 implements MigrationInterface {
    name = 'Sh1749599680343'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "refresh_token" ("id" SERIAL NOT NULL, "token" character varying NOT NULL, "expiresAt" TIMESTAMP NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_b575dd3c21fb0831013c909e7fe" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_address" ("id" SERIAL NOT NULL, "zipCode" character varying NOT NULL, "country" character varying NOT NULL, "city" character varying NOT NULL, "street" character varying NOT NULL, "firstName" character varying, "lastName" character varying, "phone" character varying, "isPrimary" boolean NOT NULL DEFAULT false, "latitude" numeric(10,8) NOT NULL DEFAULT '0', "longitude" numeric(11,8) NOT NULL DEFAULT '0', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "userId" integer, CONSTRAINT "PK_302d96673413455481d5ff4022a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('user', 'admin')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "firstName" character varying, "lastName" character varying, "bio" character varying, "referralCode" character varying, "points" integer NOT NULL DEFAULT '0', "hasMadePurchase" boolean NOT NULL DEFAULT false, "gender" character varying, "dateOfBirth" TIMESTAMP, "phone" character varying, "email" character varying NOT NULL, "password" character varying, "status" character varying NOT NULL DEFAULT 'active', "profileUrl" character varying, "provider" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL DEFAULT 'user', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "referred_by_id" integer, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."settings_type_enum" AS ENUM('string', 'number', 'boolean', 'json')`);
        await queryRunner.query(`CREATE TABLE "settings" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" character varying NOT NULL, "value" character varying NOT NULL, "type" "public"."settings_type_enum" NOT NULL, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_0669fe20e252eb692bf4d344975" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "review" ("id" SERIAL NOT NULL, "content" text NOT NULL, "rating" integer NOT NULL, "photos" jsonb NOT NULL DEFAULT '[]', "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "bikeId" integer, "userId" integer, CONSTRAINT "PK_2e4299a343a81574217255c00ca" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."bike_status_enum" AS ENUM('available', 'rented', 'maintenance', 'reserved', 'unavailable')`);
        await queryRunner.query(`CREATE TABLE "bike" ("id" SERIAL NOT NULL, "brand" character varying(100) NOT NULL, "model" character varying(100) NOT NULL, "description" text, "category" character varying(100) NOT NULL, "subCategory" character varying(100), "accessories" jsonb, "images" jsonb, "dailyRate" numeric(10,2) NOT NULL, "dailyDiscount" numeric(10,2), "size" character varying(50) NOT NULL, "weeklyDiscount" numeric(10,2), "monthlyDiscount" numeric(10,2), "status" "public"."bike_status_enum" NOT NULL DEFAULT 'available', "directBooking" boolean NOT NULL DEFAULT false, "requireDeposit" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), "addressId" integer, "ownerId" integer, CONSTRAINT "PK_e4a433f76768045f7a2efca66e2" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."booking_status_enum" AS ENUM('pending', 'confirmed', 'active', 'completed', 'cancelled', 'expired')`);
        await queryRunner.query(`CREATE TYPE "public"."booking_paymentstatus_enum" AS ENUM('pending', 'paid', 'failed', 'refunded', 'expired')`);
        await queryRunner.query(`CREATE TABLE "booking" ("id" SERIAL NOT NULL, "userId" integer NOT NULL, "bikeId" integer NOT NULL, "startTime" TIMESTAMP NOT NULL, "endTime" TIMESTAMP NOT NULL, "totalAmount" numeric(10,2) NOT NULL, "days" numeric(10,2), "pickupTime" character varying, "returnTime" character varying, "discountAmount" numeric(10,2) NOT NULL, "status" "public"."booking_status_enum" NOT NULL DEFAULT 'pending', "paymentStatus" "public"."booking_paymentstatus_enum" NOT NULL DEFAULT 'pending', "stripePaymentId" character varying, "expiresAt" TIMESTAMP, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_49171efc69702ed84c812f33540" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "refresh_token" ADD CONSTRAINT "FK_8e913e288156c133999341156ad" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_address" ADD CONSTRAINT "FK_1abd8badc4a127b0f357d9ecbc2" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_9445c728f1ce0a8b9cd92bfa75f" FOREIGN KEY ("referred_by_id") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "review" ADD CONSTRAINT "FK_2bb5b3a940cad4ab5e0b555c139" FOREIGN KEY ("bikeId") REFERENCES "bike"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "review" ADD CONSTRAINT "FK_1337f93918c70837d3cea105d39" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bike" ADD CONSTRAINT "FK_7a0992883d8d111e444d6ed277f" FOREIGN KEY ("addressId") REFERENCES "user_address"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "bike" ADD CONSTRAINT "FK_8839175bc27166f26a0e3d81d71" FOREIGN KEY ("ownerId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking" ADD CONSTRAINT "FK_336b3f4a235460dc93645fbf222" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "booking" ADD CONSTRAINT "FK_d62ffe67c3f7b204e274c151d28" FOREIGN KEY ("bikeId") REFERENCES "bike"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "booking" DROP CONSTRAINT "FK_d62ffe67c3f7b204e274c151d28"`);
        await queryRunner.query(`ALTER TABLE "booking" DROP CONSTRAINT "FK_336b3f4a235460dc93645fbf222"`);
        await queryRunner.query(`ALTER TABLE "bike" DROP CONSTRAINT "FK_8839175bc27166f26a0e3d81d71"`);
        await queryRunner.query(`ALTER TABLE "bike" DROP CONSTRAINT "FK_7a0992883d8d111e444d6ed277f"`);
        await queryRunner.query(`ALTER TABLE "review" DROP CONSTRAINT "FK_1337f93918c70837d3cea105d39"`);
        await queryRunner.query(`ALTER TABLE "review" DROP CONSTRAINT "FK_2bb5b3a940cad4ab5e0b555c139"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_9445c728f1ce0a8b9cd92bfa75f"`);
        await queryRunner.query(`ALTER TABLE "user_address" DROP CONSTRAINT "FK_1abd8badc4a127b0f357d9ecbc2"`);
        await queryRunner.query(`ALTER TABLE "refresh_token" DROP CONSTRAINT "FK_8e913e288156c133999341156ad"`);
        await queryRunner.query(`DROP TABLE "booking"`);
        await queryRunner.query(`DROP TYPE "public"."booking_paymentstatus_enum"`);
        await queryRunner.query(`DROP TYPE "public"."booking_status_enum"`);
        await queryRunner.query(`DROP TABLE "bike"`);
        await queryRunner.query(`DROP TYPE "public"."bike_status_enum"`);
        await queryRunner.query(`DROP TABLE "review"`);
        await queryRunner.query(`DROP TABLE "settings"`);
        await queryRunner.query(`DROP TYPE "public"."settings_type_enum"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
        await queryRunner.query(`DROP TABLE "user_address"`);
        await queryRunner.query(`DROP TABLE "refresh_token"`);
    }

}
