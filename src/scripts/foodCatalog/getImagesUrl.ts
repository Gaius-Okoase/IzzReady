import { v2 as cloudinary } from 'cloudinary';
import fs from 'node:fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import config from '../../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.join(__dirname, 'urls.json')

try {
    // Set cloudinary configuration options
    const options = {
        cloud_name: config.cloudiCloudName!,
        api_key: config.cloudiApiKey!,
        api_secret: config.cloudiApiSec!,
        secure: true
    }

    // Configure cloudinary
    cloudinary.config(options);

    const { resources } = await cloudinary.api.resources_by_asset_folder('izzReady/custom_food_catalog', {max_results: 100});
    
    const urls = resources.map(element => {
        const url = element.secure_url;
        return url.replace('/upload', '/upload/f_auto,q_auto,c_scale,w_400/')
    });
    await fs.unlink(outputPath)
    await fs.writeFile(outputPath, JSON.stringify(urls, null, 2));
    
} catch (error) {
    console.error(error)
}