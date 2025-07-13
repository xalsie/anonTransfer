import { EventEmitter } from "../utils/EventEmitter.js";
import {
	FileToUpload,
	UploadProgress,
	UploadResultBatch,
	UploadResult,
} from "../interfaces/IAnonTransferRepository.js";
import { AnonTransferRepository } from "../repositories/AnonTransferRepository.js";
import { randomUUID } from "crypto";

export class UploadHandler {
	private emitter = new EventEmitter<UploadProgress | UploadResultBatch>();
	private repository: AnonTransferRepository;
	private files: FileToUpload[];
	private groupId: string;

	constructor(repository: AnonTransferRepository, files: FileToUpload[]) {
		this.repository = repository;
		this.files = files;
		this.groupId = randomUUID();
		this.startUpload();
	}

	on(event: "uploadProgress", callback: (progress: UploadProgress) => void): void;
	on(event: "done", callback: (results: UploadResultBatch) => void): void;
	on(
		event: string,
		callback: ((progress: UploadProgress) => void) | ((results: UploadResultBatch) => void)
	): void {
		this.emitter.on(event, callback as (data: UploadProgress | UploadResultBatch) => void);
	}

	private async startUpload(): Promise<void> {
		const results: UploadResult[] = [];
		let successfulUploads = 0;

		for (let i = 0; i < this.files.length; i++) {
			const file = this.files[i];

			// Émission du début de l'upload
			this.emitter.emit("uploadProgress", {
				fileName: file.fileName,
				currentFile: i + 1,
				totalFiles: this.files.length,
				completed: false,
			});

			try {
				const result = await this.repository.uploadFileFromBuffer(
					file.file,
					file.fileName,
					{ groupId: this.groupId }
				);

				results.push(result);
				successfulUploads++;

				// Émission du succès de l'upload
				this.emitter.emit("uploadProgress", {
					fileName: file.fileName,
					currentFile: i + 1,
					totalFiles: this.files.length,
					completed: true,
					success: true,
					downloadPage: result.uri,
				});
			} catch (error) {
				const errorResult: UploadResult = {
					success: false,
					name: file.fileName,
					uri: "",
					dir: "",
					id: 0,
					groupId: this.groupId,
					isPartOfGroup: false,
					folderUri: "",
				};

				results.push(errorResult);

				// Émission de l'échec de l'upload
				this.emitter.emit("uploadProgress", {
					fileName: file.fileName,
					currentFile: i + 1,
					totalFiles: this.files.length,
					completed: true,
					success: false,
					error: error instanceof Error ? error.message : String(error),
				});
			}
		}

		// Émission des résultats finaux
		const downloadPage =
			results.length > 0 && results[0].success ? results[0].folderUri : undefined;
		const error =
			successfulUploads < this.files.length
				? `${this.files.length - successfulUploads} uploads failed`
				: undefined;

		const finalResults: UploadResultBatch = {
			success: successfulUploads === this.files.length,
			results,
			folderId: this.groupId,
			...(downloadPage && { downloadPage }),
			...(error && { error }),
		};

		this.emitter.emit("done", finalResults);
	}
}
