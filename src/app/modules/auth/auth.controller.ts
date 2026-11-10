import { Request, Response } from "express";
import { catchAsync } from "../../lib/catchAsync";
import { authServices } from "./auth.services";
import { sendResponse } from "../../lib/sendResponse";
import httpStatus from "http-status";
import envConfig from "../../configs/envConfig";
import { RequestUser } from "../../middleware/authCheck";

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

// ------signin controller
const signInController = catchAsync(async (req: Request, res: Response) => {
	const result = await authServices.signInServices(req.body);

	const { accessToken, refreshToken } = result;

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
		statusCode: httpStatus.OK,
		success: true,
		message: "User login successfull",
	});
});

// -------forget password controller
const forgetPasswordController = catchAsync(
	async (req: Request, res: Response) => {
		await authServices.forgetPasswordServices(req.body);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "OTP sent. Check your email",
		});
	},
);

// ------password reset controller
const resetPasswordController = catchAsync(
	async (req: Request, res: Response) => {
		const result = await authServices.resetPasswordServices(req.body);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Password updated successfully",
			data: result,
		});
	},
);

// ----get logged in user profile controller
const userProfileController = catchAsync(
	async (req: Request, res: Response) => {
		const user = await authServices.userProfileServices(
			req.user as RequestUser,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "User data get successfully",
			data: user,
		});
	},
);

// ----access token generate with refresh token controller
const refreshTokenController = catchAsync(
	async (req: Request, res: Response) => {
		const result = await authServices.refreshTokenServices(
			req.cookies.refreshToken,
		);

		res.cookie("accessToken", result.accessToken, {
			httpOnly: true,
			secure: envConfig.node_env === "production",
			sameSite: envConfig.node_env === "production" ? "none" : "lax",
			path: "/",
			maxAge: 1000 * 60 * 60 * 24, // 24 hour or 1 day
		});

		res.cookie("refreshToken", result.refreshToken, {
			httpOnly: true,
			secure: envConfig.node_env === "production",
			sameSite: envConfig.node_env === "production" ? "none" : "lax",
			path: "/",
			maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
		});

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "New tokens generated successfully",
		});
	},
);

// -----logout controller
const logoutController = catchAsync(async (req: Request, res: Response) => {
	res.clearCookie("accessToken", {
		httpOnly: true,
		secure: envConfig.node_env === "production",
		sameSite: envConfig.node_env === "production" ? "none" : "lax",
		path: "/",
	});

	res.clearCookie("refreshToken", {
		httpOnly: true,
		secure: envConfig.node_env === "production",
		sameSite: envConfig.node_env === "production" ? "none" : "lax",
		path: "/",
	});

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "User logged out successfully",
	});
});

// -----resend otp controller
const resendOtpController = catchAsync(async (req: Request, res: Response) => {
	await authServices.resendOtpServices(req.body);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "New OTP sent. Check your email",
	});
});

// -----change password controller
const changePasswordController = catchAsync(
	async (req: Request, res: Response) => {
		await authServices.changePasswordServices(
			req.body,
			req.user as RequestUser,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Password changed successfully",
		});
	},
);

// -----update profile controller (name)
const updateProfileController = catchAsync(
	async (req: Request, res: Response) => {
		const result = await authServices.updateProfileServices(
			req.body,
			req.user as RequestUser,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Profile updated successfully",
			data: result,
		});
	},
);

// -----update avatar controller
const updateAvatarController = catchAsync(
	async (req: Request, res: Response) => {
		const result = await authServices.updateAvatarServices(
			req.file,
			req.user as RequestUser,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Avatar updated successfully",
			data: result,
		});
	},
);

export const authControllers = {
	signupContorller,
	otpVerifyController,
	signInController,
	forgetPasswordController,
	resetPasswordController,
	userProfileController,
	refreshTokenController,
	logoutController,
	resendOtpController,
	changePasswordController,
	updateProfileController,
	updateAvatarController,
};
