import { Router } from "express";
import { authControllers } from "./auth.controller";
import { zodValidation } from "../../middleware/zodValidation";
import {
	changePasswordSchema,
	forgetPasswordSchema,
	otpVerifySchema,
	resendOtpSchema,
	resetPasswordSchema,
	userSignInSchema,
	userSignupSchema,
} from "./auth.validation";
import { authCheck } from "../../middleware/authCheck";

const router = Router();

// -----signup router
router.post(
	"/signup",
	zodValidation(userSignupSchema),
	authControllers.signupContorller,
);

// -------otp verify and create user router
router.post(
	"/otp-verify",
	zodValidation(otpVerifySchema),
	authControllers.otpVerifyController,
);

// ------sign in router
router.post(
	"/signin",
	zodValidation(userSignInSchema),
	authControllers.signInController,
);

// -------forget password router
router.post(
	"/forget-password",
	zodValidation(forgetPasswordSchema),
	authControllers.forgetPasswordController,
);

// -------reset password router
router.post(
	"/reset-password",
	zodValidation(resetPasswordSchema),
	authControllers.resetPasswordController,
);

// ------get logged in user profile router
router.get("/me", authCheck(), authControllers.userProfileController);

// ----access token generate with refresh token router
router.post("/refresh-token", authControllers.refreshTokenController);

// ----logout router
router.post("/logout", authControllers.logoutController);

// -----resend otp router
router.post(
	"/resend-otp",
	zodValidation(resendOtpSchema),
	authControllers.resendOtpController,
);

// -----change password router
router.patch(
	"/change-password",
	authCheck(),
	zodValidation(changePasswordSchema),
	authControllers.changePasswordController,
);

export const authRouter = router;
