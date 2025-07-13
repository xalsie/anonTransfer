export interface AnonTransferUploadResult {
	success: boolean;
	name: string;
	uri: string;
	dir: string;
	id: number;
	groupId: string;
	isPartOfGroup: boolean;
	folderUri: string;
}

export interface AnonTransferUploadOptions {
	onProgress?: (progress: number) => void;
	groupId?: string;
	chunkSize?: number;
}
