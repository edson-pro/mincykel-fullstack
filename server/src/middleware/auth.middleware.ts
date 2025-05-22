import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../errors/http.errors";

export const authorization = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"] as string;
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null || !authHeader.startsWith("Bearer "))
    throw new UnauthorizedError("Unauthorized - Missing token");

  jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
    if (err) throw new UnauthorizedError("Unauthorized - Invalid token");
    // @ts-ignore
    req["user"] = user;
    next();
  });
};

export const notRequiredAuthorization = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"] as string;
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null || !authHeader.startsWith("Bearer ")) {
    next();
    return;
  }

  jwt.verify(token, process.env.JWT_SECRET as string, (err: any, user: any) => {
    if (err) {
      next();
      return;
    }
    // @ts-ignore
    req["user"] = user;
    next();
  });
};
