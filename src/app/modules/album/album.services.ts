import { AppError } from "../../lib/AppError";
import { albumSchema } from "../../models/albumSchema";
import { ICreateAlbum } from "./album.interface";
import httpStatus from "http-status";

// ------create album
const createAlbums = async (paylaod: ICreateAlbum, userId: string) => {
	const { title, description, photoIds } = paylaod;

	const validPhotos = Array.isArray(photoIds) ? photoIds : [];

	// -----create new album
	const newAlbum = await albumSchema.create({
		title: title,
		description: description || "",
		owner: userId,
		photos: validPhotos,
	});

	const populated = await albumSchema
		.findById(newAlbum.id)
		.populate("owner", "name email")
		.populate({
			path: "photos",
			match: { isTrash: false },
			select: "thumbnailUrl url mediaType title",
		});

	return populated;
};

// -----get My albums
const getMyAlbums = async (userId: string) => {
	// -----getting my album
	const myAlbums = await albumSchema
		.find({
			owner: userId,
		})
		.populate({
			path: "photos",
			match: { isTrash: false },
			select: "thumbnailUrl url mediaType title",
		})
		.sort({ updatedAt: -1 });

	if (myAlbums.length === 0) {
		throw new AppError(httpStatus.NOT_FOUND, "No album found");
	}

	return myAlbums;
};

// ----get album by id
const getAlbumById = async (albumId: string, userId: string) => {
	// ---getting single album data
	const albumData = await albumSchema
		.findOne({
			_id: albumId,
			owner: userId,
		})
		.populate({
			path: "photos",
			match: { isTrash: false },
			options: { sort: { createdAt: -1 } },
		})
		.populate("owner", "name email");

        if(!albumData){
            throw new AppError(httpStatus.NOT_FOUND, "Album data not found")

        }
        return albumData
    };

export const albumServices = { createAlbums, getMyAlbums, getAlbumById };
