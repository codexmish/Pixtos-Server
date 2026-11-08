import ImageKit, { toFile } from "@imagekit/nodejs";
import { AppError } from "../../lib/AppError"
import httpStatus from "http-status";
import { imagekitClient } from "../../configs/imageKitConfig";
import envConfig from "../../configs/envConfig";
import { mediaSchema } from "../../models/mediaSchema";
import { mediaUpload } from "../../lib/imageKitServices";


// -----upload media Services
const uploadMediaServices = async(files: Express.Multer.File[], userId:string)=>{
    if (!files || files.length === 0){
        throw new AppError(httpStatus.BAD_REQUEST, "No files uploaded")
    }


    const uploadedMedia = []

    for(const file of files){
        const isVideo = file.mimetype.startsWith("video/")
        const mediaType = isVideo ? "video" : "image"

        // ----upload media
        const imageKitRes = await mediaUpload(file)

        const title = file.originalname
        const endPoint = envConfig.IMAGEKIT_URL_ENDPOINT
        const imagePath = imageKitRes.filePath
        const transFormation = "tr:w-400"
        const thumbnailUrl = isVideo ? `${endPoint}/${transFormation}/${imagePath}/ik-thumbnail.jpg` : `${endPoint}/${transFormation}/${imagePath}`
        const detectedObjects: string[] = []

        if(imageKitRes.AITags && Array.isArray(imageKitRes.AITags)){
            imageKitRes.AITags.forEach((tag)=>{
                if(tag.name && typeof tag.name === "string"){
                    detectedObjects.push(tag.name.toLowerCase().trim())
                }
            })
        }

        const createItems = await mediaSchema.create({
            title: title || (isVideo? "Untitled Video": "Untitled Photo"),
            url: imageKitRes.url,
            thumbnailUrl,
            fileId: imageKitRes.fileId,
            size: imageKitRes.size || file.size,
            format: imageKitRes.fileType || (isVideo? "mp4": "jpg"),
            mediaType,
            duration: imageKitRes.duration || 0,
            width: imageKitRes.width || 1200,
            height: imageKitRes.height || 800,
            owner: userId,
            objects: detectedObjects
        })

        uploadedMedia.push(createItems)


    }

    return uploadedMedia




}


// ------get media services
const getMediaServices = async(queryData: any, userId: string)=>{

    const {favorite, q, type} = queryData

    // ----filter data
    const filter: Record<string, unknown> = {
        owner: userId,
        isTrash: false
    }

    if(favorite === "true"){
        filter.isFavorite = true
    }

    if((type === "video" || type === "image")){
        filter.mediaType = type
    }

    if(q && typeof q === "string" && q.trim()){
        const searchTerm = q.trim()
        filter.$or = [{title: {$regex: searchTerm, $options: "i"}},
            {objects: {$regex: searchTerm, $options: "i"}}
        ]
    }


    const media =  await mediaSchema.find(filter).sort({createdAt: -1})

    return media
}


// ------toggle favorite services
const toggleFavoriteServices = async(mediaId: string, userId: string)=>{
    // -----getting media data
    const item = await mediaSchema.findOne({
        _id: mediaId,
        owner: userId
    })

    if(!item){
        throw new AppError(httpStatus.NOT_FOUND, "Media not found")
    }

    // -----toggleing item is favorite
    item.isFavorite = !item.isFavorite
    await item.save()

    return 
}


export const mediaServices = {uploadMediaServices, getMediaServices, toggleFavoriteServices}