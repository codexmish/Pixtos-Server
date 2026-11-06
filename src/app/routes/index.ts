import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes";



const router = Router();

// -----signup router
router.use("/auth", authRouter)

export default router;