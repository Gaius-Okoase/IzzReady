import dotenv from 'dotenv';

dotenv.config();

const config = {
  // PORT
  port: process.env.PORT || 4100,

  // Environment
  env: process.env.NODE_ENV || 'development',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',

  // Database
  mongoUri: process.env.MONGO_URI,

  // jwt
  accessSec: process.env.JWT_ACCESS_SECRET,
  refreshSec: process.env.JWT_REFRESH_SECRET,

  // Google OAuth Credentials
  clientId: process.env.CLIENT_ID,
  clientSec: process.env.CLIENT_SECRET,
  redirectUri: process.env.REDIRECT_URI,

  // CORS
  corsOrigin: process.env.CORS_ORIGIN,

  // Cloudinary
  cloudiCloudName: process.env.CLOUDINARY_CLOUD_NAME,
  cloudiApiKey: process.env.CLOUDINARY_API_KEY,
  cloudiApiSec: process.env.CLOUDINARY_API_SECRET,
  cloudiUrl: process.env.CLOUDINARY_URL,

  //VAPID kes
  vapidPri: process.env.VAPID_PRIVATE_KEY,
  vapidPub: process.env.VAPID_PUBLIC_KEY,
};

for (const key in config) {
  const configKey = key as keyof typeof config;
  if (config[configKey] === undefined) {
    console.error(`${configKey} is undefined.`);
    process.exit(1);
  }
}

export default config;
