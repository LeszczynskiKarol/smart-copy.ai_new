// backend/src/services/s3.service.ts

import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand, // ← DODAJ
  ListObjectsV2Command, // ← DODAJ
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
    const fileExtension = originalName.split(".").pop();
    const randomString = crypto.randomBytes(16).toString("hex");
    const s3Key = `user-sources/${Date.now()}-${randomString}.${fileExtension}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
        Body: file,
        ContentType: contentType,
      })
    );

    const command = new GetObjectCommand({
      Bucket: BUCKET_NAME,
      Key: s3Key,
    });

    const url = await getSignedUrl(s3Client, command, {
      expiresIn: 7 * 24 * 60 * 60,
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

  /**
   * ✨ NOWE: Usuń pojedynczy plik
   */
  async deleteFile(s3Key: string): Promise<void> {
    await s3Client.send(
      new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: s3Key,
      })
    );
    console.log(`🗑️ Usunięto plik: ${s3Key}`);
  }

  /**
   * ✨ NOWE: Wyczyść pliki starsze niż 24h
   */
  async cleanupOldFiles(): Promise<number> {
    const now = Date.now();
    const twentyFourHoursAgo = now - 24 * 60 * 60 * 1000;
    let deletedCount = 0;

    try {
      // Lista wszystkich plików
      const listResponse = await s3Client.send(
        new ListObjectsV2Command({
          Bucket: BUCKET_NAME,
          Prefix: "user-sources/",
        })
      );

      if (!listResponse.Contents) {
        console.log("ℹ️ Brak plików do usunięcia");
        return 0;
      }

      // Filtruj i usuń stare pliki
      for (const obj of listResponse.Contents) {
        if (!obj.Key || !obj.LastModified) continue;

        const fileAge = obj.LastModified.getTime();

        if (fileAge < twentyFourHoursAgo) {
          await this.deleteFile(obj.Key);
          deletedCount++;
        }
      }

      console.log(`✅ Usunięto ${deletedCount} starych plików`);
      return deletedCount;
    } catch (error) {
      console.error("❌ Błąd podczas czyszczenia S3:", error);
      throw error;
    }
  }
}
