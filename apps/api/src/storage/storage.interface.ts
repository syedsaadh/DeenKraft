export interface StorageProvider {
  generateUploadUrl(key: string, mimeType: string): Promise<string>;
  generateDownloadUrl(key: string): Promise<string>;
  deleteObject(key: string): Promise<void>;
  objectExists(key: string): Promise<boolean>;
}
