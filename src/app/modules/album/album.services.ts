import { AppError } from "../../lib/AppError";
import { albumSchema } from "../../models/albumSchema";
import { mediaSchema } from "../../models/mediaSchema";
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

	if (!albumData) {
		throw new AppError(httpStatus.NOT_FOUND, "Album data not found");
	}
	return albumData;
};

// -----add photos to album
const addPhotosToAlbum = async (
	photoIds: string[],
	albumId: string,
	userId: string,
) => {
	// ----checking album exist or not
	const album = await albumSchema.findOne({
		_id: albumId,
		owner: userId,
	});

	if (!album) {
		throw new AppError(httpStatus.NOT_FOUND, "album not exist");
	}

	// ----only keep photos that belong to this user
	const ownPhotoIds = await mediaSchema
		.find({ _id: { $in: photoIds }, owner: userId })
		.distinct("_id");

	// ----add photos avoiding duplicates ($addToSet skips ids already in the album)
	const updatedAlbum = await albumSchema.findByIdAndUpdate(
		album._id,
		{ $addToSet: { photos: { $each: ownPhotoIds } } },
		{ returnDocument: "after" },
	);

	return updatedAlbum;
};

export const albumServices = {
	createAlbums,
	getMyAlbums,
	getAlbumById,
	addPhotosToAlbum,
};
