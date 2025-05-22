import { NextFunction, Request, Response } from "express";
import { User } from "../entities/User";
import jwt from "jsonwebtoken";
import { BadRequestError, NotFoundError } from "../errors/http.errors";
import * as bcrypt from "bcryptjs";
import { RefreshToken } from "../entities/RefreshToken";
import { AppDataSource } from "../data-source";
import { asyncHandler } from "../utils/async-handler";
import { randomBytes } from "crypto";
import { PasswordReset } from "../entities/PasswordReset";
import emailTransporter from "../lib/emailTransporter";

const formatUser = (user: any) => {
  return {
    id: user.id,
    name: user.name,
    status: user.status,
    phone: user.phone,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    provider: user.provider,
    isNew: user?.isNew,
    profileUrl: user?.profileUrl,
    gender: user?.gender,
    dateOfBirth: user?.dateOfBirth,
    referralCode: user?.referralCode,
    points: user?.points,
    role: user?.role,
    ...(user?.isAdmin && {
      isAdmin: true,
    }),
  };
};

const generateUniqueReferralCode = async (): Promise<string> => {
  let code: string;
  let isUnique = false;

  while (!isUnique) {
    code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const existingUser = await AppDataSource.getRepository(User).findOne({
      where: { referralCode: code },
    });
    if (!existingUser) isUnique = true;
  }

  return code;
};

export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const user = req.user;

    const foundUser = await User.findOne({
      where: {
        id: user.id,
      },
    });

    if (!foundUser) throw new NotFoundError("User not found");

    res.json(formatUser(foundUser));
  }
);

export const googleLogin = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { token, platform } = req.body;

    if (!platform) {
      throw new BadRequestError("Platform is required");
    }

    // check if platform is android or ios
    if (platform !== "web") {
      throw new BadRequestError("Invalid platform");
    }

    // fetch user info from google https://www.googleapis.com/oauth2/v3/userinfo
    const payload = await fetch(
      `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${token}`
    ).then((res) => res.json());

    if (!payload) throw new BadRequestError("Invalid Google token");

    console.log(payload, "HELLO WORLD");

    const userInfo = {
      email: payload["email"],
      name: payload["name"],
      picture: payload["picture"],
      firstName: payload["name"].split(" ")[0],
      lastName: payload["name"].split(" ")[1],
    };

    let user = await AppDataSource.getRepository(User).findOneBy({
      email: userInfo.email,
    });

    let isNew = false;

    if (!user) {
      const referredBy = req?.body?.referralCode
        ? await User.findOne({
            where: { referralCode: req.body.referralCode },
          })
        : null;

      user = await User.save({
        email: userInfo.email,
        name: userInfo.name,
        profileUrl: userInfo.picture,
        provider: "google",
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        referralCode: await generateUniqueReferralCode(),
        points: 0,
        referredBy,
      });
      isNew = true;
    }

    const access_token = jwt.sign({ ...user }, process.env.JWT_SECRET!, {
      expiresIn: "1d",
    });

    const refresh_token = jwt.sign({ ...user }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

    // Save refresh token to database
    const newRefreshToken = new RefreshToken();
    newRefreshToken.token = refresh_token;
    newRefreshToken.user = user;
    newRefreshToken.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await refreshTokenRepository.save(newRefreshToken);

    // Set refresh token in HTTP-only cookie
    res.cookie("refreshToken", refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      ...formatUser(user),
      access_token,
      refresh_token,
      isNew,
    });
  }
);

export const login = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Validate request body
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({
      where: { email: email },
      select: [
        "id",
        "name",
        "firstName",
        "lastName",
        "provider",
        "profileUrl",
        "email",
        "gender",
        "dateOfBirth",
        "password",
        "referralCode",
        "role",
      ],
    });

    if (!user) {
      throw new BadRequestError("Invalid credentials", {
        errors: {
          email: "User with email is not found",
        },
      });
    }

    if (user.provider !== "email") {
      throw new BadRequestError("Invalid credentials", {
        errors: {
          email: `Please use ${user.provider} to login.`,
        },
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      throw new BadRequestError("Invalid credentials", {
        errors: {
          password: "Password is incorrect.",
        },
      });
    }

    const userObj = {
      id: user.id,
      email: user.email,
      name: user.name,
      firstName: user.firstName,
      lastName: user.lastName,
      profileUrl: user.profileUrl,
      provider: user.provider,
      role: user.role,
    };

    console.log(userObj);

    // Generate JWT token
    const access_token = jwt.sign(userObj, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const refresh_token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

    // Save refresh token to database
    const newRefreshToken = new RefreshToken();
    newRefreshToken.token = refresh_token;
    newRefreshToken.user = user;
    newRefreshToken.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await refreshTokenRepository.save(newRefreshToken);

    // Set refresh token in HTTP-only cookie
    res.cookie("refreshToken", refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      ...formatUser(user),
      access_token,
      refresh_token,
      isNew: false,
    });
  }
);

export const forgotPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body;

    // Find user
    const user = await User.findOne({
      where: { email },
    });

    if (!user) {
      throw new BadRequestError("Invalid email", {
        errors: {
          email: "User with email does not exist",
        },
      });
    }

    // Generate reset token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    // Save reset token
    const passwordReset = new PasswordReset();
    passwordReset.token = token;
    passwordReset.user = user;
    passwordReset.expiresAt = expiresAt;

    const passwordResetRepository = AppDataSource.getRepository(PasswordReset);
    passwordResetRepository.save(passwordReset);

    // Send email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await emailTransporter.sendMail({
      from: process.env.SMTP_FROM,
      to: user.email,
      subject: "Password Reset Request",
      html: `
                    <h1>Password Reset Request</h1>
                    <p>You requested to reset your password. Click the link below to reset it:</p>
                    <a href="${resetLink}">Reset Password</a>
                    <p>This link will expire in 1 hour.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                `,
    });

    return res.status(200).json({
      status: "success",
      message:
        "If an account exists with this email, a reset link will be sent",
    });
  }
);

export const resetPassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const passwordResetRepository = AppDataSource.getRepository(PasswordReset);
    const userRepository = AppDataSource.getRepository(User);
    const { token, password: newPassword } = req.body;

    if (!token || !newPassword) {
      throw new BadRequestError("Token and new password are required");
    }

    // Find valid reset token
    const passwordReset = await passwordResetRepository.findOne({
      where: { token },
      relations: ["user"],
    });

    if (!passwordReset || passwordReset.expiresAt < new Date()) {
      throw new BadRequestError("Invalid or expired reset token");
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    const user = passwordReset.user;
    user.password = hashedPassword;
    await userRepository.save(user);

    // Delete used reset token
    await passwordResetRepository.remove(passwordReset);

    // Optionally, invalidate all refresh tokens for this user
    await passwordResetRepository
      .createQueryBuilder()
      .delete()
      .from(PasswordReset)
      .where("userId = :userId", { userId: user.id })
      .execute();

    return res.status(200).json({
      status: "success",
      message: "Password has been reset successfully",
    });
  }
);

export const register = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    // Validate request body
    const { email, password, firstName, lastName } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email: email },
    });

    if (existingUser) {
      throw new BadRequestError("Registration failed", {
        errors: {
          email: "User with this email already exists",
        },
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const referedBy = req?.body?.referralCode
      ? await User.findOne({ where: { referralCode: req.body.referralCode } })
      : null;

    // Create new user
    const user = new User();
    user.email = email;
    user.password = hashedPassword;
    user.firstName = firstName;
    user.lastName = lastName;
    user.name = `${firstName} ${lastName}`; // Create a full name from first and last name
    user.provider = "email";
    user.referralCode = await generateUniqueReferralCode();
    user.points = 0;
    user.referredBy = referedBy;

    await User.save(user);

    const userObj = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      name: user.name,
      profileUrl: user.profileUrl,
      provider: user.provider,
      referralCode: user.referralCode,
      points: user.points,
      role: user.role,
    };

    // Generate JWT token
    const access_token = jwt.sign(userObj, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    const refresh_token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

    // Save refresh token to database
    const newRefreshToken = new RefreshToken();
    newRefreshToken.token = refresh_token;
    newRefreshToken.user = user;
    newRefreshToken.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await refreshTokenRepository.save(newRefreshToken);

    // Set refresh token in HTTP-only cookie
    res.cookie("refreshToken", refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({
      ...formatUser(user),
      access_token,
      refresh_token,
      isNew: true,
    });
  }
);

export const updateProfile = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const data = req.body;
    const user = req.user;

    const foundUser = await User.findOne({
      where: {
        id: user.id,
      },
    });

    if (!foundUser) throw new NotFoundError("User not found");

    foundUser.name = `${data.firstName} ${data.lastName}`;
    foundUser.firstName = data.firstName;
    foundUser.lastName = data.lastName;
    foundUser.phone = data.phone;
    foundUser.profileUrl = data.profileUrl;
    foundUser.gender = data.gender;
    foundUser.dateOfBirth = data.dateOfBirth;

    const updatedUser = await foundUser.save();

    res.json(formatUser(updatedUser));
  }
);

export const changePassword = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { currentPassword, newPassword } = req.body;
    const user = req.user;

    const foundUser = await User.findOne({
      where: {
        id: user.id,
      },
      select: ["id", "password"],
    });

    if (!foundUser) throw new NotFoundError("User not found");

    const isValidPassword = await bcrypt.compare(
      currentPassword,
      foundUser.password
    );
    if (!isValidPassword) {
      throw new BadRequestError("Invalid credentials", {
        errors: {
          currentPassword: "Password is incorrect.",
        },
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    foundUser.password = hashedPassword;
    await foundUser.save();

    res.json(formatUser(foundUser));
  }
);

export const refreshToken = asyncHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken = req?.body?.refreshToken;

    if (!refreshToken) {
      throw new BadRequestError("Refresh token is required");
    }

    const refreshTokenRepository = AppDataSource.getRepository(RefreshToken);

    // Find refresh token in database
    const token = await refreshTokenRepository.findOne({
      where: { token: refreshToken },
      relations: ["user"],
    });

    if (!token) {
      throw new BadRequestError("Invalid refresh token");
    }

    // Check if refresh token is expired
    if (token.expiresAt < new Date()) {
      throw new BadRequestError("Refresh token has expired");
    }

    // Generate new access and refresh tokens
    const user = token.user;
    const access_token = jwt.sign({ ...user }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    const newRefresh_token = jwt.sign({ ...user }, process.env.JWT_SECRET!, {
      expiresIn: "7d",
    });

    // Update refresh token in database
    token.token = newRefresh_token;
    token.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await refreshTokenRepository.save(token);

    // Set new refresh token in HTTP-only cookie
    res.cookie("refreshToken", newRefresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      ...formatUser(user),
      access_token,
      refresh_token: newRefresh_token,
    });
  }
);
