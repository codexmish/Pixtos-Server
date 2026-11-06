import { Request, Response } from "express";
import { catchAsync } from "../../lib/catchAsync";


// ------register controller
const signupContorller = catchAsync(async(req:Request, res: Response)=>{

})


export const authControllers = {signupContorller}