import z from "zod";
import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import { catchAsync } from "../lib/catchAsync";
import { AppError } from "../lib/AppError";


export const zodValidation = (zodSchema: z.ZodObject) => {
	return catchAsync((req: Request, res: Response, next: NextFunction) => {
		const payload = req.body ?? {};

		// -----checking data
		const result = zodSchema.safeParse(payload);
		if (!result.success) {
			throw new AppError(
				httpStatus.BAD_REQUEST,
				result.error.issues[0].message,
			);
		}

		// ----setting verified data to body
		req.body = result.data;
		next();
	});
};