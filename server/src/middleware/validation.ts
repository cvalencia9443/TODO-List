import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { AppError } from "./errorHandler";

export const validate = (
  schema: Joi.ObjectSchema,
  property: "body" | "params" | "query" = "body"
) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(", ");

      throw new AppError(errorMessage, 400);
    }

    // Replace the original data with validated and sanitized data
    req[property] = value;
    next();
  };
};


