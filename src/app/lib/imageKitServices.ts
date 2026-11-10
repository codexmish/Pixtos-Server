import ImageKit, { toFile } from "@imagekit/nodejs";
import { imagekitClient } from "../configs/imageKitConfig";

// ----upload media
export const mediaUpload = async (file: Express.Multer.File) => {
	const isVideo = file.mimetype.startsWith("video/");
	const fileObj = await toFile(file.buffer, file.originalname, {
		type: file.mimetype,
	});

	const uploadParams: ImageKit.FileUploadParams = {
		file: fileObj,
		fileName: `${file.originalname}-${Date.now()}`,
		folder: isVideo ? "/my-videos" : "/my-photos",
		useUniqueFileName: true,
		responseFields: ["tags"],
	};

	if (!isVideo) {
		uploadParams.extensions = [
			{
				name: "google-auto-tagging",
				minConfidence: 60,
				maxTags: 10,
			},
		];
	}

	const imageKitRes = await imagekitClient.files.upload(uploadParams);
	// console.log(imageKitRes);

	return imageKitRes;
};

// ----upload avatar
export const avatarImageUpload = async (file: Express.Multer.File) => {
	const fileObj = await toFile(file.buffer, file.originalname, {
		type: file.mimetype,
	});

	const imageKitRes = await imagekitClient.files.upload({
		file: fileObj,
		fileName: `avatar-${Date.now()}`,
		folder: "/avatars",
		useUniqueFileName: true,
	});

	return imageKitRes;
};

// -----delete media
export const mediaDelete = async (fileId: string) => {
	try {
		await imagekitClient.files.delete(fileId);
	} catch (error: any) {
		console.log("file delatein failed:", error.message);
	}
};
