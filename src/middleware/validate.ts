import { Request, Response, NextFunction } from "express";
import { validationResult } from "express-validator";

export const validate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    next();
    return;
  }
  const extractedErrors: { [key: string]: string }[] = [];
  errors.array().forEach((err) => {
    if ("path" in err) {
      extractedErrors.push({ [err.path]: err.msg });
    }
  });

  res.status(422).json({
    errors: extractedErrors,
  });
};
