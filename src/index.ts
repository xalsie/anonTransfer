import { AnonTransferRepository } from "./repositories/AnonTransferRepository.js";
import { UploadHandler } from "./services/UploadHandler.js";
import { FileToUpload } from "./interfaces/IAnonTransferRepository.js";

/**
 * API principale pour AnonTransfer
 * Permet d'uploader des fichiers vers anontransfer.com
 */
export class AnonTransferAPI {
	private repository: AnonTransferRepository;

	constructor() {
		this.repository = new AnonTransferRepository();
	}

	/**
	 * Upload multiple files to AnonTransfer
	 * @param files Array of files to upload
	 * @returns UploadHandler instance for tracking progress
	 */
	async uploadFiles(files: FileToUpload[]): Promise<UploadHandler> {
		if (!files || files.length === 0) {
			throw new Error("At least one file is required");
		}

		return new UploadHandler(this.repository, files);
	}
}

// Export types for external use
export type {
	FileToUpload,
	UploadProgress,
	UploadResultBatch,
	UploadResult,
	UploadOptions,
} from "./interfaces/IAnonTransferRepository.js";

export { UploadHandler } from "./services/UploadHandler.js";
