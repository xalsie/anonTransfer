// Export de l'API principale
export { AnonTransfer } from "./AnonTransfer.js";

// Export des types pour utilisation externe
export type {
	FileToUpload,
	UploadProgress,
	UploadResultBatch,
	UploadResult,
	UploadOptions,
} from "./interfaces/IAnonTransferRepository.js";

// Export de l'UploadHandler
export { UploadHandler } from "./services/UploadHandler.js";
