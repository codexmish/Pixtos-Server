import { Router } from "express";
import { authRouter } from "../modules/auth/auth.routes";
import { mediaRouter } from "../modules/media/media.routes";
import { albumRouter } from "../modules/album/album.routes";

const router = Router();

router.use("/auth", authRouter);
router.use("/media", mediaRouter);
router.use("/album", albumRouter);

export default router;
