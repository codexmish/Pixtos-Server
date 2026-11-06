import { AppError } from "../../lib/AppError";
import { userSchema } from "../../models/userSchema";
import { ISignup } from "./auth.interface"
import httpStatus from "http-status";
import bcrypt from "bcrypt"
import envConfig from "../../configs/envConfig";
import crypto from "crypto";


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



}


export const authServices = {signupServices}