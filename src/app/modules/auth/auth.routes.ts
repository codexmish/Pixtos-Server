import { Router } from "express";
import { authControllers } from "./auth.controller";
import { zodValidation } from "../../middleware/zodValidation";
import { userSignupSchema } from "./auth.validation";


const router = Router();

// -----signup router
router.post(
	"/signup",
    zodValidation(userSignupSchema),
	authControllers.signupContorller,
);

export const authRouter = router;