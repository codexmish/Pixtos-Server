import { Request, Response } from "express";
import { catchAsync } from "../../lib/catchAsync";
import { authServices } from "./auth.services";
import { sendResponse } from "../../lib/sendResponse";
import httpStatus from "http-status";
import envConfig from "../../configs/envConfig";

// ------register controller
const signupContorller = catchAsync(async (req: Request, res: Response) => {
	const result = await authServices.signupServices(req.body);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Check your email",
	});
});

// -------otp verify and create user controller
const otpVerifyController = catchAsync(async (req: Request, res: Response) => {
	const result = await authServices.otpVerifyServices(req.body);

	const { accessToken, refreshToken, createdUser } = result;

	res.cookie("accessToken", accessToken, {
		httpOnly: true,
		secure: envConfig.node_env === "production",
		sameSite: envConfig.node_env === "production" ? "none" : "lax",
		path: "/",
		maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
	});

	res.cookie("refreshToken", refreshToken, {
		httpOnly: true,
		secure: envConfig.node_env === "production",
		sameSite: envConfig.node_env === "production" ? "none" : "lax",
		path: "/",
		maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
	});

	sendResponse(res, {
		statusCode: httpStatus.CREATED,
		success: true,
		message: "Otp verified and user registered Successfuly",
	});
});

export const authControllers = { signupContorller, otpVerifyController };
