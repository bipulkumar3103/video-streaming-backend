import { S3Client } from "@aws-sdk/client-s3";
// import dotenv from "dotenv";

// dotenv.config();

/**
 * Validate required AWS environment variables
 */
const requiredEnv = [
  "AWS_REGION",
  "AWS_ACCESS_KEY",
  "AWS_SECRET_KEY",
  "AWS_S3_BUCKET",
];

for (const key of requiredEnv) {
  if (!process.env[key]) {
    console.error(`❌ Missing environment variable: ${key}`);
    throw new Error(`Environment variable ${key} is not defined`);
  }
}

/**
 * Debug (remove in production)
 */
console.log("✅ AWS Config Loaded");
console.log("Region:", process.env.AWS_REGION);
console.log("Bucket:", process.env.AWS_S3_BUCKET);

/**
 * Create S3 Client
 */
export const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_KEY!,
  },
});