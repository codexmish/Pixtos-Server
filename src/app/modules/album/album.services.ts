import { albumSchema } from "../../models/albumSchema"
import { ICreateAlbum } from "./album.interface"


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

export const albumServices = {createAlbums}