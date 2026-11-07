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
        // const fileObj = await toFile(file.buffer, file.originalname, {type: file.mimetype})

        // const uploadParams: ImageKit.FileUploadParams = {
        //     file: fileObj,
        //     fileName: `${file.originalname}-${Date.now()}`,
        //     folder: isVideo? "/my-videos" : "/my-photos",
        //     useUniqueFileName: true,
        //     responseFields: ["tags"]
        // }

        // if(!isVideo){
        //     uploadParams.extensions = [
        //         {
        //             name: "google-auto-tagging",
        //         minConfidence: 60,
        //         maxTags: 10
        //         }
        //     ]
        // }

        // const imageKitRes = await imagekitClient.files.upload(uploadParams)

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


export const mediaServices = {uploadMediaServices}