import Joi from "joi";

export const createOtpSchema = Joi.object({
  phone: Joi.string().required(),
});

export const verifyOtpSchema = Joi.object({
  otp: Joi.string().required(),
  phone: Joi.string().required(),
});

export const updateProfileSchema = Joi.object({
  name: Joi.string().optional().not().empty(),
});

export const googleLoginSchema = Joi.object({
  token: Joi.string().required(),
  referralCode: Joi.any().optional(),
  platform: Joi.string().required(),
});

export const emailLoginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const emailRegisterSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  referralCode: Joi.any().optional(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  password: Joi.string().min(6).required(),
  token: Joi.string().required(),
});
