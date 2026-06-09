import type { Request, Response, NextFunction } from "express";
import cloudinary from "../config/cloudinary.js";
import type { UploadApiResponse } from "cloudinary";

export const uploadToCloudinary = async (req: Request, _res: Response, next: NextFunction) => {
    try {
        // Extract file buffer
        const file = req.file;
        if(!file) return next();
        const buffer = file.buffer;

        // Upload image buffer to cloudinary. P.S: I still don't understand this Promise thingy 😖
        const result = await new Promise<UploadApiResponse | undefined>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {folder: '/izzReady/custom_food_item'},
                (error, result) => {
                if (error) reject(error);
                resolve(result)
            }).end(buffer)
        });
        
        // Extract url and format for proper retrieval
        const url = result?.secure_url;
        const imageUrl = url?.replace('/upload', '/upload/f_auto,q_auto,c_scale,w_300/')
       
        // Attach url to body object
        req.body.imageUrl = imageUrl;
    } catch (error) {
        next(error)
    }
    return next()
}