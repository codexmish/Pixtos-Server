import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes";
import { mediaRouter } from "../modules/media/media.routes";

const router = Router();

// -----signup router
router.use("/auth", authRouter);
router.use("/media", mediaRouter);

export default router;
