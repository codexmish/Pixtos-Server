import { NextFunction, Request, Response } from "express";
import { JwtPayload } from "jsonwebtoken";
import httpStatus from "http-status";
import { catchAsync } from "../lib/catchAsync";
import { AppError } from "../lib/AppError";
import { jwtUtils } from "../lib/jwt";
import envConfig from "../configs/envConfig";
import { userSchema } from "../models/userSchema";

// -----roles a user can have (same as the role enum in userSchema)
export type TUserRole = "user" | "admin";

// -----logged in user data, authCheck puts this on req.user
export interface RequestUser {
	userId: string;
	name: string;
	email: string;
	role: TUserRole;
}

declare global {
	namespace Express {
		interface Request {
			user?: RequestUser;
		}
	}
}

// -----only logged in users can pass, optionally only some roles: authCheck("admin")
export const authCheck = (...requiredRoles: TUserRole[]) => {
	return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
		// ----getting access token
		const token = req.cookies.accessToken;

		if (!token) {
			throw new AppError(
				httpStatus.UNAUTHORIZED,
				"You are not logged in. Please log in to access this resource.",
			);
		}

		// -------verify token
		const verifiedToken = jwtUtils.verifyToken(
			token,
			envConfig.JWT_ACCESS_SECRET,
		);

		if (!verifiedToken.success) {
			throw new AppError(
				httpStatus.UNAUTHORIZED,
				envConfig.node_env === "development"
					? verifiedToken.message
					: "Invalid or expired token. Please log in again.",
			);
		}

		const { userId } = verifiedToken.data as JwtPayload;

		// ------checking user exist or not
		const user = await userSchema.findById(userId);

		if (!user) {
			throw new AppError(
				httpStatus.UNAUTHORIZED,
				"User not found. Please log in again.",
			);
		}

		// ------checking if role permitted
		if (
			requiredRoles.length &&
			!requiredRoles.includes(user.role as TUserRole)
		) {
			throw new AppError(
				httpStatus.FORBIDDEN,
				"Forbidden. You don't have permission to access this resource.",
			);
		}

		// ------setting logged in user data on req
		req.user = {
			userId: user.id,
			name: user.name,
			email: user.email,
			role: user.role as TUserRole,
		};

		next();
	});
};
