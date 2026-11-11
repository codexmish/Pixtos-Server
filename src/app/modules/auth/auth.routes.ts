import { Router } from "express";
import { authControllers } from "./auth.controller";
import { zodValidation } from "../../middleware/zodValidation";
import {
	changePasswordSchema,
	forgetPasswordSchema,
	otpVerifySchema,
	resendOtpSchema,
	resetPasswordSchema,
	updateProfileSchema,
	userSignInSchema,
	userSignupSchema,
} from "./auth.validation";
import { authCheck } from "../../middleware/authCheck";
import { avatarUpload } from "../../lib/multer";
import { limiter } from "../../lib/requestLimiter";

const router = Router();

// -----signup router
router.post(
	"/signup",
	limiter(10 * 60 * 1000, 5, false),
	zodValidation(userSignupSchema),
	authControllers.signupContorller,
);

// -------otp verify and create user router
router.post(
	"/otp-verify",
	limiter(10 * 60 * 1000, 5),
	zodValidation(otpVerifySchema),
	authControllers.otpVerifyController,
);

// ------sign in router
router.post(
	"/signin",
	limiter(10 * 60 * 1000, 5),
	zodValidation(userSignInSchema),
	authControllers.signInController,
);

// -------forget password router
router.post(
	"/forget-password",
	limiter(10 * 60 * 1000, 5, false),
	zodValidation(forgetPasswordSchema),
	authControllers.forgetPasswordController,
);

// -------reset password router
router.post(
	"/reset-password",
	limiter(10 * 60 * 1000, 5),
	zodValidation(resetPasswordSchema),
	authControllers.resetPasswordController,
);

// ------get logged in user profile router
router.get("/me", authCheck(), authControllers.userProfileController);

// ----access token generate with refresh token router
router.post(
	"/refresh-token",
	limiter(10 * 60 * 1000, 5),
	authControllers.refreshTokenController,
);

// ----logout router
router.post("/logout", authControllers.logoutController);

// -----resend otp router
router.post(
	"/resend-otp",
	limiter(10 * 60 * 1000, 5, false),
	zodValidation(resendOtpSchema),
	authControllers.resendOtpController,
);

// -----change password router
router.patch(
	"/change-password",
	limiter(10 * 60 * 1000, 5),
	authCheck(),
	zodValidation(changePasswordSchema),
	authControllers.changePasswordController,
);

// -----update profile router (name)
router.patch(
	"/update-profile",
	authCheck(),
	zodValidation(updateProfileSchema),
	authControllers.updateProfileController,
);

// -----update avatar router (form-data, field name "avatar")
router.patch(
	"/update-avatar",
	limiter(10 * 60 * 1000, 5, false),
	authCheck(),
	avatarUpload.single("avatar"),
	authControllers.updateAvatarController,
);

export const authRouter = router;
