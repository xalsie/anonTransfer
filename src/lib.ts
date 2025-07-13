import { AnonTransferRepository } from "./repositories/AnonTransferRepository.js";
import { FileUploadService } from "./services/FileUploadService.js";
import { UploadOptions, UploadResult } from "./interfaces/IAnonTransferRepository.js";

// Instance unique du repository (singleton)
const repository = new AnonTransferRepository();

// Services configurés avec le repository
const uploadService = new FileUploadService(repository);

/**
 * Upload d'un fichier vers AnonTransfer
 */
export async function uploadFile(filePath: string, options?: UploadOptions): Promise<UploadResult> {
	return uploadService.uploadFile(filePath, options);
}

/**
 * Upload d'un buffer vers AnonTransfer
 */
export async function uploadFileFromBuffer(
	buffer: Buffer,
	fileName: string,
	options?: UploadOptions
): Promise<UploadResult> {
	return repository.uploadFileFromBuffer(buffer, fileName, options);
}

// Re-export des types directement depuis leurs sources
export type { UploadOptions, UploadResult } from "./interfaces/IAnonTransferRepository.js";
