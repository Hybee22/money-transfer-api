import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../entities/User"; // Assuming you have a User type defined

/**
 * Extends the Express Request interface to include a user property.
 */
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

/**
 * Middleware to authenticate a user token.
 * 
 * @param req - The Express request object
 * @param res - The Express response object
 * @param next - The Express next function
 * @returns A Promise that resolves when authentication is complete
 */
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (token == null) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const user = await new Promise<User>((resolve, reject) => {
      jwt.verify(
        token,
        process.env.JWT_SECRET as string,
        (err: any, decoded: any) => {
          if (err) reject(new Error(err.message));
          else resolve(decoded as User);
        }
      );
    });

    req.user = user;
    next();
  } catch (err) {
    res.status(403).json({ error: "Forbidden" });
  }
};

/**
 * Middleware to authenticate an admin token.
 * 
 * @param req - The Express request object
 * @param res - The Express response object
 * @param next - The Express next function
 * @returns A Promise that resolves when authentication is complete
 */
export const authenticateAdminToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers["authorization"];
  const token = authHeader?.split(" ")[1];

  if (token == null) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  try {
    const user = await new Promise<User>((resolve, reject) => {
      jwt.verify(
        token,
        process.env.JWT_SECRET as string,
        (err: any, decoded: any) => {
          if (err) reject(new Error(err.message));
          else resolve(decoded as User);
        }
      );
    });

    if (user.role !== "admin" && user.role !== "superAdmin") {
      res.status(403).json({ error: "Forbidden: Admin access required" });
      return;
    }

    req.user = user;
    req.user.id = user.id;
    next();
  } catch (err) {
    res.status(403).json({ error: "Forbidden" });
  }
};
