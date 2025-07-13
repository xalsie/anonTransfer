export interface IAnonTransferRepository {
	uploadFile(filePath: string, options?: UploadOptions): Promise<UploadResult>;
	uploadFileFromBuffer(
		buffer: Buffer,
		fileName: string,
		options?: UploadOptions
	): Promise<UploadResult>;
}

export interface UploadOptions {
	onProgress?: (progress: number) => void;
	groupId?: string;
	chunkSize?: number;
}

export interface UploadResult {
	success: boolean;
	name: string;
	uri: string;
	dir: string;
	id: number;
	groupId: string;
	isPartOfGroup: boolean;
	folderUri: string;
}

export interface FileInfo {
	fileId: string;
	fileName: string;
	size: number;
	uploadDate: string;
	downloadUrl: string;
}

export interface AnonTransferUploadResponse {
	success: boolean;
	name: string;
	uri: string;
	dir: string;
	id: number;
	group_id: string;
	isPartOfGroup: boolean;
	folderUri: string;
}

// Nouveaux types pour l'API simplifiée
export interface FileToUpload {
	file: Buffer;
	fileName: string;
}

export interface UploadProgress {
	fileName: string;
	currentFile: number;
	totalFiles: number;
	completed: boolean;
	success?: boolean;
	downloadPage?: string;
	error?: string;
}

export interface UploadResultBatch {
	success: boolean;
	results: UploadResult[];
	folderId?: string;
	downloadPage?: string;
	error?: string;
}
