import { v2 as cloudinary } from 'cloudinary';
import config from './env.js';

cloudinary.config({
  cloud_name: config.cloudiCloudName!,
  api_key: config.cloudiApiKey!,
  api_secret: config.cloudiApiSec!,
  secure: true,
});

export default cloudinary;