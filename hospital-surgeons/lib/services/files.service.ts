import { getSupabaseClient } from './supabase';
import { getDb } from '@/lib/db';
import { files } from '@/src/db/drizzle/migrations/schema';
import { eq } from 'drizzle-orm';

export interface FileMetadata {
  filename: string;
  url: string;
  mimetype: string;
  size: number;
  thumbnail?: string;
  storageBucket?: string;
  storageKey?: string;
  cdnUrl?: string;
  isPublic?: boolean;
}

export class FilesService {
  private supabase = getSupabaseClient();
  private db = getDb();

  /**
   * Uploads file to Supabase Storage
   */
  async uploadFile(
    buffer: Buffer,
    filename: string,
    folder: string,
    mimetype: string,
    bucket: string = 'images'
  ): Promise<{ url: string; path: string }> {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(`${folder}/${filename}`, buffer, {
        contentType: mimetype,
        upsert: true,
      });

    if (error) {
      throw new Error(`Failed to upload file: ${error.message}`);
    }

    const { data: urlData } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(data.path);

    return { url: urlData.publicUrl, path: data.path };
  }

  /**
   * Saves file metadata in database
   */
  async saveFileMetadata(metadata: FileMetadata): Promise<string> {
    const values: any = {
      filename: metadata.filename,
      url: metadata.url,
      mimetype: metadata.mimetype,
      size: BigInt(metadata.size),
    };

    if (metadata.thumbnail) values.thumbnail = metadata.thumbnail;
    if (metadata.storageBucket) values.storageBucket = metadata.storageBucket;
    if (metadata.storageKey) values.storageKey = metadata.storageKey;
    if (metadata.cdnUrl) values.cdnUrl = metadata.cdnUrl;
    if (metadata.isPublic !== undefined) values.isPublic = metadata.isPublic;

    const [result] = await this.db
      .insert(files)
      .values(values)
      .returning({ id: files.id });

    return result.id;
  }

  /**
   * Convenience method: upload file and save metadata in one call
   */
  async uploadAndSave(file: {
    buffer: Buffer;
    filename: string;
    folder: string;
    mimetype: string;
    size: number;
    thumbnail?: string;
    bucket?: string;
    isPublic?: boolean;
  }): Promise<{ fileId: string; url: string; path: string }> {
    const { url, path } = await this.uploadFile(
      file.buffer,
      file.filename,
      file.folder,
      file.mimetype,
      file.bucket
    );

    const fileId = await this.saveFileMetadata({
      filename: file.filename,
      url,
      mimetype: file.mimetype,
      size: file.size,
      thumbnail: file.thumbnail,
      storageBucket: file.bucket || 'images',
      storageKey: path,
      isPublic: file.isPublic ?? false,
    });

    return { fileId, url, path };
  }

  /**
   * Get file by ID
   */
  async getFileById(fileId: string) {
    const result = await this.db
      .select()
      .from(files)
      .where(eq(files.id, fileId))
      .limit(1);

    return result[0] || null;
  }

  /**
   * Delete file from storage and database
   */
  async deleteFile(fileId: string, bucket: string = 'images'): Promise<boolean> {
    try {
      // Get file metadata
      const file = await this.getFileById(fileId);
      if (!file) {
        return false;
      }

      // Delete from Supabase Storage
      if (file.storageKey) {
        const { error: storageError } = await this.supabase.storage
          .from(bucket)
          .remove([file.storageKey]);

        if (storageError) {
          console.error('Failed to delete file from storage:', storageError);
        }
      }

      // Delete from database
      await this.db
        .delete(files)
        .where(eq(files.id, fileId));

      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }
}

