import {
	IAnonTransferRepository,
	UploadOptions,
	UploadResult,
} from "../interfaces/IAnonTransferRepository.js";

export class FileUploadService {
	constructor(private repository: IAnonTransferRepository) {}

	async uploadFile(filePath: string, options?: UploadOptions): Promise<UploadResult> {
		return this.repository.uploadFile(filePath, options);
	}
}
