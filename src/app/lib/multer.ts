import multer from "multer";
import { AppError } from "./AppError";
import httpStatus from "http-status";

const storage = multer.memoryStorage();

export const upload = multer({
	storage: storage,
	limits: {
		fileSize: 100 * 1024 * 1024, //100 mb max
		files: 20, //max 20 files per upload
	},
	fileFilter: (_req, file, cb) => {
		if (
			file.mimetype.startsWith("image/") ||
			file.mimetype.startsWith("video/")
		) {
			cb(null, true);
		} else {
			cb(
				new AppError(
					httpStatus.NOT_ACCEPTABLE,
					"Only video and image files are allowed",
				),
			);
		}
	},
});

// -----avatar upload (one image only, small size)
export const avatarUpload = multer({
	storage: storage,
	limits: {
		fileSize: 5 * 1024 * 1024, //5 mb max
		files: 1,
	},
	fileFilter: (_req, file, cb) => {
		if (file.mimetype.startsWith("image/")) {
			cb(null, true);
		} else {
			cb(
				new AppError(httpStatus.NOT_ACCEPTABLE, "Only image files are allowed"),
			);
		}
	},
});
