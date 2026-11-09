import { Request, Response } from "express";
import { catchAsync } from "../../lib/catchAsync";
import { mediaServices } from "./media.services";
import { sendResponse } from "../../lib/sendResponse";
import httpStatus from "http-status";

// -----upload media controller
const uploadMediaController = catchAsync(
	async (req: Request, res: Response) => {
		const result = await mediaServices.uploadMediaServices(
			req.files as Express.Multer.File[],
			req.user?.userId as string,
		);

		sendResponse(res, {
			statusCode: httpStatus.CREATED,
			success: true,
			message: "Media uploaded successfully",
			data: result,
		});
	},
);

// -----get media controller
const getMediaController = catchAsync(async (req: Request, res: Response) => {
	const result = await mediaServices.getMediaServices(
		req.query as any,
		req.user?.userId as string,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "Media get successfully",
		data: result,
	});
});

// ----- toggleFavorite controller
const toggleFavoriteController = catchAsync(
	async (req: Request, res: Response) => {
		const result = await mediaServices.toggleFavoriteServices(
			req.params.id as string,
			req.user?.userId as string,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Media fevarite update successfully",
			data: result,
		});
	},
);

// ----- toggletrash controller
const toggleTrashController = catchAsync(
	async (req: Request, res: Response) => {
		const result = await mediaServices.toggleTrashServices(
			req.params.id as string,
			req.user?.userId as string,
			req.body,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: result.isTrash ? "Moved to trash" : "Restored from trash",
			data: result,
		});
	},
);

// ----- gettrash controller
const getTrashController = catchAsync(async (req: Request, res: Response) => {
	const result = await mediaServices.getTrashServices(
		req.user?.userId as string,
	);

	sendResponse(res, {
		statusCode: httpStatus.OK,
		success: true,
		message: "All Trash Media get successfully",
		data: result,
	});
});

// ----- delete Media Permanently controller
const deleteMediaPermanentlyController = catchAsync(
	async (req: Request, res: Response) => {
		const result = await mediaServices.deleteMediaPermanentlyServices(
			req.params.id as string,
			req.user?.userId as string,
		);

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "Media permanently deleted",
			data: result,
		});
	},
);

// ----- empty Trash controller
const emptyTrashController = catchAsync(
	async (req: Request, res: Response) => {
		const result = await mediaServices.emptyTrashServices(req.user?.userId as string)

		sendResponse(res, {
			statusCode: httpStatus.OK,
			success: true,
			message: "All Trash media deleted",
		});
	},
);

// ----- get Storage Stats controller
const getStorageStatsController = catchAsync(
	async (req: Request, res: Response) => {},
);

export const mediaController = {
	uploadMediaController,
	getMediaController,
	toggleFavoriteController,
	toggleTrashController,
	getTrashController,
	deleteMediaPermanentlyController,
	emptyTrashController,
	getStorageStatsController,
};
