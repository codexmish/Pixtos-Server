import { AppError } from "../../lib/AppError";
import { userSchema } from "../../models/userSchema";
import { ISignup } from "./auth.interface"
import httpStatus from "http-status";
import bcrypt from "bcrypt"
import envConfig from "../../configs/envConfig";
import crypto from "crypto";
import { setRedis } from "../../lib/redisHelpers";
import { mailSender } from "../../lib/mailService";
import { OTPMailTemp } from "../../emailTemplates/OTPMailTemp";


// -------signup services
const signupServices = async(payload: ISignup)=>{
    const { name, email, password } = payload;
    // -----checking if user already exist with same email
    const userExist = await userSchema.findOne({email})

    if(userExist){
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
    await setRedis(otpKey, otp, expirationSecound)


	// ---sugnup data set on redis
	const signupDataKey = `user-signup-data:${email}`;

	const userDataPayload = JSON.stringify({
		name,
		email,
		password: hashedPassword,
	});

    await setRedis(signupDataKey, userDataPayload, expirationSecound)

	// ------sending mail
	await mailSender({
		email,
		subject: "verify your email",
		mailTemp: OTPMailTemp(otp, 5),
	});

	return;





}


export const authServices = {signupServices}