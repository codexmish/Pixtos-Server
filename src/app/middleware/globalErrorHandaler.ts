import { NextFunction, Request, Response } from "express";
import httpStatus from "http-status";
import mongoose from "mongoose";
import multer from "multer";
import envConfig from "../configs/envConfig";
import { AppError } from "../lib/AppError";
import { sendResponse } from "../lib/sendResponse";
import { ZodError } from "zod";

export const globalErrorHandaler = (
	err: any,
	req: Request,
	res: Response,
	next: NextFunction,
) => {
	// -----initial error res data
	let statusCode: number = httpStatus.INTERNAL_SERVER_ERROR;
	let errMessage =
		envConfig.node_env === "development" ? err.message : "Something went wrong";
	let errorDetails = null;

	// -----err set error
	if (err instanceof AppError) {
		statusCode = err.statusCode;
		errMessage = err.message;
	} else if (err instanceof mongoose.Error.ValidationError) {
		// -----schema rule failed (required, min, enum ...)
		statusCode = httpStatus.BAD_REQUEST;
		errMessage = "Validation failed";
		errorDetails = Object.values(err.errors).map((e) => ({
			field: e.path,
			message: e.message,
		}));
	} else if (err instanceof mongoose.Error.CastError) {
		// -----wrong type for a field, e.g. invalid ObjectId in /orders/:id
		statusCode = httpStatus.BAD_REQUEST;
		errMessage = `Invalid ${err.path}`;
		errorDetails = [{ field: err.path, message: errMessage }];
	} else if (err.code === 11000) {
		// -----unique index violated (email, slug, sku, coupon code)
		const field = Object.keys(err.keyValue ?? {})[0];
		statusCode = httpStatus.CONFLICT;
		errMessage = field ? `${field} already exists` : "Duplicate value";
		if (field) errorDetails = [{ field, message: errMessage }];
	} else if (err instanceof multer.MulterError) {
		// -----file upload rule failed (file too large, too many files ...)
		statusCode = httpStatus.BAD_REQUEST;
		errMessage =
			err.code === "LIMIT_FILE_SIZE" ? "File is too large" : err.message;
	} else if (err instanceof ZodError) {
		statusCode = httpStatus.BAD_REQUEST;
		errMessage = "Validation failed";
		errorDetails = err.issues.map((issue) => ({
			field: issue.path.join("."),
			message: issue.message,
		}));
	} else {
		console.error(err);
	}

	// ------final err response send to client
	sendResponse(res, {
		statusCode,
		success: false,
		message: errMessage,
	});
};
