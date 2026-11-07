import { AppError } from "../../lib/AppError";
import { userSchema } from "../../models/userSchema";
import {
	IChangePassword,
	IForgetPass,
	IOtpVerify,
	IResendOtp,
	IResetPassword,
	ISignIn,
	ISignup,
} from "./auth.interface";
import httpStatus from "http-status";
import bcrypt from "bcrypt";
import envConfig from "../../configs/envConfig";
import crypto from "crypto";
import { deleteRedis, getRedis, setRedis } from "../../lib/redisHelpers";
import { mailSender } from "../../lib/mailService";
import { OTPMailTemp } from "../../emailTemplates/OTPMailTemp";
import { jwtUtils } from "../../lib/jwt";
import { SignOptions } from "jsonwebtoken";
import { WelcomeMailTemp } from "../../emailTemplates/weclomeMailTemp";
import { RequestUser } from "../../middleware/authCheck";

// -------signup services
const signupServices = async (payload: ISignup) => {
	const { name, email, password } = payload;

	// -----checking if user already exist with same email
	const userExist = await userSchema.findOne({ email });

	if (userExist) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"User already exist with this email",
		);
	}

	// -----password hash
	const hashedPassword = await bcrypt.hash(
		password,
		Number(envConfig.SALT_ROUNDS),
	);

	// -----otp generate
	const otp = crypto.randomInt(100000, 1000000).toString();

	// -----redis data set
	const expirationSecound = 5 * 60;
	const otpKey = `user-registration-otp:${email}`;

	// ---otp set on redis
	await setRedis(otpKey, otp, expirationSecound);

	// ---sugnup data set on redis
	const signupDataKey = `user-signup-data:${email}`;

	const userDataPayload = JSON.stringify({
		name,
		email,
		password: hashedPassword,
	});

	await setRedis(signupDataKey, userDataPayload, expirationSecound);

	// ------sending mail
	await mailSender({
		email,
		subject: "verify your email",
		mailTemp: OTPMailTemp(otp, 5),
	});

	return;
};

const otpVerifyServices = async (payload: IOtpVerify) => {
	const { email, otp } = payload;

	// -----checking if user already verified
	const userVerified = await userSchema.findOne({ email, isVerified: true });

	if (userVerified) {
		throw new AppError(httpStatus.BAD_REQUEST, "You email already verified");
	}

	// ------getting user otp from redis
	const otpKey = `user-registration-otp:${email}`;

	const redisOtp = await getRedis(otpKey);

	if (!redisOtp) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Otp expired. please try again later",
		);
	}

	// -------checkin if otp is correct or not
	if (redisOtp !== otp) {
		throw new AppError(httpStatus.BAD_REQUEST, "your otp is not correct");
	}

	// -------getting user signup data from redis
	const signupDataKey = `user-signup-data:${email}`;

	const signupData = await getRedis(signupDataKey);

	if (!signupData) {
		throw new AppError(
			httpStatus.INTERNAL_SERVER_ERROR,
			"Something bad please try again later",
		);
	}

	const signupPayload: ISignup = JSON.parse(signupData);

	// -----creating user
	const createdUser = await userSchema.create({
		name: signupPayload.name,
		email: signupPayload.email,
		password: signupPayload.password,
		isVerified: true,
	});

	// ------deleting used data from redis
	await deleteRedis([otpKey, signupDataKey]);

	// -----getting jwt data
	const jwtPayload = {
		userId: createdUser.id,
		name: createdUser.name,
		email: createdUser.email,
		role: createdUser.role,
	};

	// ------generating jwt token
	const accessToken = jwtUtils.createToken(
		jwtPayload,
		envConfig.JWT_ACCESS_SECRET as string,
		envConfig.JWT_ACCESS_EXPIRES_IN as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		envConfig.JWT_REFRESH_SECRET as string,
		envConfig.JWT_REFRESH_EXPIRES_IN as SignOptions,
	);

	// -----sending user welcome mail
	await mailSender({
		email: createdUser.email,
		subject: "Welcome to Blood For Life Community",
		mailTemp: WelcomeMailTemp(createdUser.name, `${envConfig.frontend_url}`),
	});

	return {
		createdUser,
		accessToken,
		refreshToken,
	};
};

// ------signIn services
const signInServices = async (payload: ISignIn) => {
	const { email, password } = payload;

	// -------checking user exist or not (password is select:false, so ask for it)
	const userExist = await userSchema.findOne({ email }).select("+password");

	if (!userExist) {
		throw new AppError(httpStatus.FORBIDDEN, "Invalid credentials");
	}

	if (!userExist.isVerified) {
		throw new AppError(httpStatus.BAD_REQUEST, "You email is not verified");
	}

	// -----checking if password matched or not
	const isPasswordMatched = await bcrypt.compare(password, userExist.password);

	if (!isPasswordMatched) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Invalid credentials");
	}

	// -----getting jwt data
	const jwtPayload = {
		userId: userExist.id,
		name: userExist.name,
		email: userExist.email,
		role: userExist.role,
	};

	// ------generating jwt token
	const accessToken = jwtUtils.createToken(
		jwtPayload,
		envConfig.JWT_ACCESS_SECRET as string,
		envConfig.JWT_ACCESS_EXPIRES_IN as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		envConfig.JWT_REFRESH_SECRET as string,
		envConfig.JWT_REFRESH_EXPIRES_IN as SignOptions,
	);

	return {
		accessToken,
		refreshToken,
	};
};

// ------forget password services
const forgetPasswordServices = async (payload: IForgetPass) => {
	const { email } = payload;

	// ------checking user
	const userExist = await userSchema.findOne({ email });

	if (!userExist) {
		throw new AppError(httpStatus.FORBIDDEN, "Invalid credentials");
	}

	// ----otp generate
	const otp = crypto.randomInt(100000, 1000000).toString();
	const otpKey = `forget-password-otp:${userExist.email}`;

	// ----otp set on redis
	await setRedis(otpKey, otp, 5 * 60);

	// ------sending mail
	await mailSender({
		email,
		subject: "Reset your password",
		mailTemp: OTPMailTemp(otp, 5),
	});

	return;
};

// -----reset password services
const resetPasswordServices = async (payload: IResetPassword) => {
	const { email, newPassword, otp } = payload;

	// ------checking user
	const userExist = await userSchema.findOne({ email });

	if (!userExist) {
		throw new AppError(httpStatus.FORBIDDEN, "Invalid credentials");
	}

	// ----getting otp from redis
	const otpKey = `forget-password-otp:${userExist.email}`;

	const redisOtp = await getRedis(otpKey);

	if (!redisOtp) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Otp expired. please try again later",
		);
	}

	// -------checking if otp is correct or not
	if (redisOtp !== otp) {
		throw new AppError(httpStatus.BAD_REQUEST, "Invalid or wrong Otp");
	}

	// -----new password hash
	const hashedNewPassword = await bcrypt.hash(
		newPassword,
		Number(envConfig.SALT_ROUNDS),
	);

	// -----update user pass (returns the updated user, password is still hidden)
	const updatedUser = await userSchema.findByIdAndUpdate(
		userExist._id,
		{ password: hashedNewPassword },
		{ returnDocument: "after" },
	);

	// ------deleting used otp from redis
	await deleteRedis(otpKey);

	return updatedUser;
};

// ------get logged in user profile services
const userProfileServices = async (payload: RequestUser) => {
	const { userId } = payload;

	// -----checking user
	const userData = await userSchema.findById(userId);

	if (!userData) {
		throw new AppError(httpStatus.NOT_FOUND, "user not found");
	}

	return userData;
};

// ----access token generate with refresh token
const refreshTokenServices = async (token: string) => {
	if (!token) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Refresh token is missing");
	}

	// ---validating token
	const verifyRefreshToken = jwtUtils.verifyToken(
		token,
		envConfig.JWT_REFRESH_SECRET as string,
	);

	if (!verifyRefreshToken.success || !verifyRefreshToken.data) {
		throw new AppError(
			httpStatus.UNAUTHORIZED,
			envConfig.node_env === "development"
				? verifyRefreshToken.message
				: "Invalid refresh token",
		);
	}

	const { userId } = verifyRefreshToken.data as RequestUser;

	// ---checking user
	const user = await userSchema.findById(userId);

	if (!user) {
		throw new AppError(httpStatus.UNAUTHORIZED, "User not found");
	}

	// --------jwt payload
	const jwtPayload = {
		userId: user.id,
		name: user.name,
		email: user.email,
		role: user.role,
	};

	const accessToken = jwtUtils.createToken(
		jwtPayload,
		envConfig.JWT_ACCESS_SECRET as string,
		envConfig.JWT_ACCESS_EXPIRES_IN as SignOptions,
	);

	const refreshToken = jwtUtils.createToken(
		jwtPayload,
		envConfig.JWT_REFRESH_SECRET as string,
		envConfig.JWT_REFRESH_EXPIRES_IN as SignOptions,
	);

	return {
		accessToken,
		refreshToken,
	};
};

// -----resend otp services
const resendOtpServices = async (payload: IResendOtp) => {
	const { email } = payload;

	// -----checking if user already created
	const userExist = await userSchema.findOne({ email });

	if (userExist) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"User already exist with this email",
		);
	}

	// -----signup data must be in redis (signup first)
	const signupDataKey = `user-signup-data:${email}`;
	const signupData = await getRedis(signupDataKey);

	if (!signupData) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"Signup session expired. Please signup again",
		);
	}

	// -----one resend per minute
	const cooldownKey = `resend-otp-cooldown:${email}`;
	const cooldown = await getRedis(cooldownKey);

	if (cooldown) {
		throw new AppError(
			httpStatus.TOO_MANY_REQUESTS,
			"Please wait 1 minute before requesting a new OTP",
		);
	}

	await setRedis(cooldownKey, true, 60);

	// -----new otp generate
	const otp = crypto.randomInt(100000, 1000000).toString();
	const otpKey = `user-registration-otp:${email}`;

	// ---new otp set on redis (old one is replaced)
	await setRedis(otpKey, otp, 5 * 60);

	// ---giving signup data more time too (same data, new expiry)
	await setRedis(signupDataKey, signupData, 5 * 60);

	// ------sending mail
	await mailSender({
		email,
		subject: "verify your email",
		mailTemp: OTPMailTemp(otp, 5),
	});

	return;
};

// -----change password services
const changePasswordServices = async (
	payload: IChangePassword,
	user: RequestUser,
) => {
	const { oldPassword, newPassword } = payload;

	// -----checking user (password is select:false, so ask for it)
	const userExist = await userSchema.findById(user.userId).select("+password");

	if (!userExist) {
		throw new AppError(httpStatus.NOT_FOUND, "user not found");
	}

	// -----checking old password
	const isPasswordMatched = await bcrypt.compare(
		oldPassword,
		userExist.password,
	);

	if (!isPasswordMatched) {
		throw new AppError(httpStatus.UNAUTHORIZED, "Old password is not correct");
	}

	// -----new password can't be same as old
	if (oldPassword === newPassword) {
		throw new AppError(
			httpStatus.BAD_REQUEST,
			"New password must be different from old password",
		);
	}

	// -----new password hash
	const hashedNewPassword = await bcrypt.hash(
		newPassword,
		Number(envConfig.SALT_ROUNDS),
	);

	// -----update user pass
	await userSchema.findByIdAndUpdate(userExist._id, {
		password: hashedNewPassword,
	});

	return;
};

export const authServices = {
	signupServices,
	otpVerifyServices,
	signInServices,
	forgetPasswordServices,
	resetPasswordServices,
	userProfileServices,
	refreshTokenServices,
	resendOtpServices,
	changePasswordServices,
};
