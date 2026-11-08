import { Router } from "express";
import { authCheck } from "../../middleware/authCheck";
import { upload } from "../../lib/multer";
import { mediaController } from "./media.controller";

const router = Router();

// -----signup router
router.post(
	"/upload",
	authCheck(),
	upload.array("media", 20),
	mediaController.uploadMediaController,
);

// -----signup router
router.get("/", authCheck(), mediaController.getMediaController);

// -----signup router
router.post(
	"/fav-toggle/:id",
	authCheck(),
	mediaController.toggleFavoriteController,
);

// -----move to trash / restore router
router.patch(
	"/trash-toggle/:id",
	authCheck(),
	mediaController.toggleTrashController,
);

//  ----get all trash media
router.get("/trash", authCheck(), mediaController.getTrashController);

export const mediaRouter = router;
