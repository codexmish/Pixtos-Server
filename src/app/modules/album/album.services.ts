import { AppError } from "../../lib/AppError"
import { albumSchema } from "../../models/albumSchema"
import { ICreateAlbum } from "./album.interface"
import httpStatus from "http-status";


// ------create album
const createAlbums = async(paylaod: ICreateAlbum, userId: string)=>{
    const {title, description, photoIds} = paylaod

    const validPhotos = Array.isArray(photoIds) ? photoIds : []


    // -----create new album 
    const  newAlbum = await albumSchema.create({
        title: title,
        description: description || "",
        owner: userId,
        photos: validPhotos
    })

    const populated = await albumSchema.findById(newAlbum.id).populate("owner", "name email").populate({
        path: "photos",
        match: {isTrash: false},
        select: "thumbnailUrl url mediaType title"
    })

    return populated
}


// -----get My albums
const getMyAlbums = async(userId: string)=>{
    // -----getting my album
    const myAlbums = await albumSchema.find({
        owner: userId
    })

    if(myAlbums.length === 0) {
        throw new AppError(httpStatus.NOT_FOUND, "No album found")
    }

    return myAlbums
}

export const albumServices = {createAlbums, getMyAlbums}