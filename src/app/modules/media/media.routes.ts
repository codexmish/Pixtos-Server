import { Router } from "express";
import { authCheck } from "../../middleware/authCheck";
import { upload } from "../../lib/multer";
import { mediaController } from "./media.controller";
import { zodValidation } from "../../middleware/zodValidation";
import { bulkFavoriteSchema, bulkTrashSchema } from "./media.validation";
import { limiter } from "../../lib/requestLimiter";

const router = Router();

// -----signup router
router.post(
	"/upload",
	limiter(10 * 60 * 1000, 20, false),
	authCheck(),
	upload.array("media", 20),
	mediaController.uploadMediaController,
);

// -----signup router
router.get("/", authCheck(), mediaController.getMediaController);

// -----signup router
router.patch(
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

// ----delete permanently
router.patch(
	"/delete/:id",
	authCheck(),
	mediaController.deleteMediaPermanentlyController,
);

// -----empty trash
router.delete("/trash", authCheck(), mediaController.emptyTrashController);

//---- media stats
router.get("/stats", authCheck(), mediaController.getStorageStatsController);

// -----bulk favorite router
router.patch(
	"/bulk-favorite",
	authCheck(),
	zodValidation(bulkFavoriteSchema),
	mediaController.bulkFavoriteController,
);

// -----bulk move to trash router
router.patch(
	"/bulk-trash",
	authCheck(),
	zodValidation(bulkTrashSchema),
	mediaController.bulkTrashController,
);

export const mediaRouter = router;
