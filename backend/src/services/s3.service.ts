// backend/src/services/s3.service.ts
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

const s3Client = new S3Client({
  region: process.env.AWS_REGION || "eu-north-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const BUCKET_NAME = process.env.S3_BUCKET_NAME || "smart-copy-user-sources";

export class S3Service {
  /**
   * Upload pliku do S3
   */
  async uploadFile(
    file: Buffer,
    originalName: string,
    contentType: string
  ): Promise<{ s3Key: string; url: string }> {
    // Generuj unikalną nazwę pliku
    const fileExtension = originalName.split(".").pop();
    const randomString = crypto.randomBytes(16).toString("hex");
    const s3Key = `user-sources/${Date.now()}-${randomString}.${fileExtension}`;

    // Upload do S3
    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: file,
        ContentType: contentType,
      })
    );

    // Generuj signed URL (ważny 7 dni)
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: 7 * 24 * 60 * 60, // 7 dni
    });

    return { s3Key, url };
  }

  /**
   * Generuj nowy signed URL dla istniejącego pliku
   */
  async getSignedUrl(s3Key: string): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    return await getSignedUrl(s3Client, command, {
      expiresIn: 7 * 24 * 60 * 60,
    });
  }
}
