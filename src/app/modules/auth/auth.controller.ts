import { Request, Response } from "express";
import { catchAsync } from "../../lib/catchAsync";
import { authServices } from "./auth.services";
import { sendResponse } from "../../lib/sendResponse";
import httpStatus from "http-status";


// ------register controller
const signupContorller = catchAsync(async(req:Request, res: Response)=>{
    const result = await authServices.signupServices(req.body);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Check your email",
	});
})


export const authControllers = {signupContorller}