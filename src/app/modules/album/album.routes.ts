import { Router } from "express";
import { albumControllers } from "./album.controller";
import { zodValidation } from "../../middleware/zodValidation";
import { createAlbumSchema } from "./album.validation";
import { authCheck } from "../../middleware/authCheck";

const router = Router();

// -----signup router
router.post(
	"/create",
	authCheck(),
	zodValidation(createAlbumSchema),
	albumControllers.createAlbums,
);

// -----get my album
router.get("/", authCheck(), albumControllers.getMyAlbums);

// -----get single album data
router.get("/:id", authCheck(), albumControllers.getAlbumById)

export const albumRouter = router;
