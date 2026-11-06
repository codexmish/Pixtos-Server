import { AppError } from "../../lib/AppError";
import { userSchema } from "../../models/userSchema";
import { IOtpVerify, ISignup } from "./auth.interface";
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

export const authServices = { signupServices, otpVerifyServices };
