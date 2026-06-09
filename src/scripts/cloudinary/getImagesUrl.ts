import fs from 'node:fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import cloudinary from '../../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputPath = path.join(__dirname, 'urls.json');

try {
  const { resources } = await cloudinary.api.resources_by_asset_folder('izzReady/food_catalog', {
    max_results: 100,
  });

  const urls = resources.map((element) => {
    const url = element.secure_url;
    return url.replace('/upload', '/upload/f_auto,q_auto,c_scale,w_300/');
  });

  await fs.unlink(outputPath);
  await fs.writeFile(outputPath, JSON.stringify(urls, null, 2));
} catch (error) {
  if (error instanceof Error) console.error(error.message);
}
