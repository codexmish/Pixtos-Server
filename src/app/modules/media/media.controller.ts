import { Request, Response } from "express";
import { catchAsync } from "../../lib/catchAsync";

// -----upload media controller
const uploadMediaController = catchAsync(
  async (req: Request, res: Response) => {},
);

// -----get media controller
const getMediaController = catchAsync(
  async (req: Request, res: Response) => {},
);

// ----- toggleFavorite controller
const toggleFavoriteController = catchAsync(
  async (req: Request, res: Response) => {},
);

// ----- toggletrash controller
const toggleTrashController = catchAsync(
  async (req: Request, res: Response) => {},
);

// ----- gettrash controller
const getTrashController = catchAsync(
  async (req: Request, res: Response) => {},
);

// ----- delete Media Permanently controller
const deleteMediaPermanentlyController = catchAsync(
  async (req: Request, res: Response) => {},
);

// ----- empty Trash controller
const emptyTrashController = catchAsync(
  async (req: Request, res: Response) => {},
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
  getStorageStatsController
};
