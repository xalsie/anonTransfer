export class UploadProgressHandler {
	private totalBytes: number = 0;
	private uploadedBytes: number = 0;
	private onProgress: ((progress: number) => void) | undefined;

	constructor(totalBytes: number, onProgress?: (progress: number) => void) {
		this.totalBytes = totalBytes;
		this.onProgress = onProgress;
	}

	updateProgress(bytes: number): void {
		this.uploadedBytes += bytes;
		const progress = Math.round((this.uploadedBytes / this.totalBytes) * 100);

		if (this.onProgress) {
			this.onProgress(progress);
		}
	}

	setComplete(): void {
		this.uploadedBytes = this.totalBytes;
		if (this.onProgress) {
			this.onProgress(100);
		}
	}
}
