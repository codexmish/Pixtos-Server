import { Request, Response } from "express";
import { catchAsync } from "../../lib/catchAsync";
import { albumServices } from "./album.services";
import { sendResponse } from "../../lib/sendResponse";
import httpStatus from "http-status";

// -------create album
const createAlbums = catchAsync(async (req: Request, res: Response) => {
    const result = await albumServices.createAlbums(req.body, req.user?.userId as string)

    sendResponse(res, {
        success: true,
        statusCode: httpStatus.CREATED,
        message: "Album created successfully",
        data: result
    })

});

// -------getMy album
const getMyAlbums = catchAsync(async (req: Request, res: Response) => {});

// -------get single album
const getAlbumById = catchAsync(async (req: Request, res: Response) => {});

// -------add photos to album
const addPhotosToAlbum = catchAsync(async (req: Request, res: Response) => {});

// -------remove photos from album
const removePhotosFromAlbum = catchAsync(
  async (req: Request, res: Response) => {},
);


// -------delete album
const deleteAlbum = catchAsync(
  async (req: Request, res: Response) => {},
);

export const albumControllers = {
  createAlbums,
  getMyAlbums,
  getAlbumById,
  addPhotosToAlbum,
  removePhotosFromAlbum,
  deleteAlbum

};
