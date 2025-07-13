import {
	IAnonTransferRepository,
	UploadOptions,
	UploadResult,
	AnonTransferUploadResponse,
} from "../interfaces/IAnonTransferRepository.js";
import { promises as fs } from "fs";
import { basename } from "path";
import { randomUUID } from "crypto";
import * as https from "https";
import * as http from "http";
import { URL } from "url";

export class AnonTransferRepository implements IAnonTransferRepository {
	private readonly baseUrl = "https://anontransfer.com";
	private readonly uploadEndpoint = "/anonymous_upload_handler.php";
	private readonly defaultChunkSize = 52428800; // 50MB
	private sessionCookie: string | null = null;

	private async getSessionCookie(): Promise<string> {
		if (this.sessionCookie) {
			return this.sessionCookie;
		}

		return new Promise((resolve, reject) => {
			const req = https.request(
				this.baseUrl,
				{
					method: "GET",
					headers: {
						"User-Agent":
							"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
						Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
						"Accept-Language": "en-US,en;q=0.5",
						"Accept-Encoding": "gzip, deflate, br",
						Connection: "keep-alive",
						"Upgrade-Insecure-Requests": "1",
						"Sec-Fetch-Dest": "document",
						"Sec-Fetch-Mode": "navigate",
						"Sec-Fetch-Site": "none",
					},
				},
				(res) => {
					const cookies = res.headers["set-cookie"];
					if (cookies) {
						for (const cookie of cookies) {
							const match = cookie.match(/PHPSESSID=([^;]+)/);
							if (match) {
								this.sessionCookie = `PHPSESSID=${match[1]}`;
								console.log(
									`🔧 Debug: Session cookie acquired: ${this.sessionCookie}`
								);
								resolve(this.sessionCookie);
								return;
							}
						}
					}
					reject(new Error("No PHPSESSID cookie found"));
				}
			);

			req.on("error", (error) => {
				reject(error);
			});

			req.end();
		});
	}

	async uploadFile(filePath: string, options?: UploadOptions): Promise<UploadResult> {
		const buffer = await fs.readFile(filePath);
		const fileName = basename(filePath);
		return this.uploadFileFromBuffer(buffer, fileName, options);
	}
	async uploadFileFromBuffer(
		buffer: Buffer,
		fileName: string,
		options?: UploadOptions
	): Promise<UploadResult> {
		const fileSize = buffer.length;
		const chunkSize = options?.chunkSize || this.defaultChunkSize;
		const groupId = options?.groupId || randomUUID();
		const dzuuid = randomUUID();

		// Pour l'instant, on implémente l'upload en un seul chunk
		const totalChunkCount = Math.ceil(fileSize / chunkSize);

		try {
			console.log(`🔧 Debug: Uploading ${fileName} (${fileSize} bytes)`);

			// Récupérer le cookie de session
			const sessionCookie = await this.getSessionCookie();
			console.log(`🔧 Debug: Using session cookie: ${sessionCookie}`);

			const boundary = `----formdata-boundary-${randomUUID()}`;
			const formData = this.createMultipartFormData(boundary, {
				dzuuid,
				dzchunkindex: "0",
				dztotalfilesize: fileSize.toString(),
				dzchunksize: chunkSize.toString(),
				dztotalchunkcount: totalChunkCount.toString(),
				dzchunkbyteoffset: "0",
				groupId,
				file: { buffer, fileName },
			});

			console.log(`🔧 Debug: Form data size: ${formData.length} bytes`);
			console.log(`🔧 Debug: Boundary: ${boundary}`);

			const result = await this.makeRequest(this.baseUrl + this.uploadEndpoint, {
				method: "POST",
				headers: {
					"Content-Type": `multipart/form-data; boundary=${boundary}`,
					"Content-Length": formData.length.toString(),
					"User-Agent":
						"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
					Accept: "application/json, text/plain, */*",
					"Accept-Language": "en-US,en;q=0.9",
					"Accept-Encoding": "identity",
					Origin: "https://anontransfer.com",
					Referer: "https://anontransfer.com/",
					Connection: "keep-alive",
					Cookie: sessionCookie,
					"Sec-Fetch-Dest": "empty",
					"Sec-Fetch-Mode": "cors",
					"Sec-Fetch-Site": "same-origin",
				},
				body: formData,
			});

			console.log(`🔧 Debug: Response:`, result);

			if (!result.success) {
				throw new Error(`Upload failed: ${JSON.stringify(result)}`);
			}

			// Callback de progression
			if (options?.onProgress) {
				options.onProgress(100);
			}

			return {
				success: result.success,
				name: result.name,
				uri: result.uri,
				dir: result.dir,
				id: result.id,
				groupId: result.group_id,
				isPartOfGroup: result.isPartOfGroup,
				folderUri: result.folderUri,
			};
		} catch (error) {
			console.error(`🔧 Debug: Error in uploadFileFromBuffer:`, error);
			throw new Error(
				`Upload failed: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	}

	private createMultipartFormData(
		boundary: string,
		fields: {
			dzuuid: string;
			dzchunkindex: string;
			dztotalfilesize: string;
			dzchunksize: string;
			dztotalchunkcount: string;
			dzchunkbyteoffset: string;
			groupId: string;
			file: { buffer: Buffer; fileName: string };
		}
	): Buffer {
		const chunks: Buffer[] = [];

		for (const [key, value] of Object.entries(fields)) {
			if (key === "file" && typeof value === "object" && value.buffer) {
				// Fichier
				chunks.push(Buffer.from(`--${boundary}\r\n`));
				chunks.push(
					Buffer.from(
						`Content-Disposition: form-data; name="${key}"; filename="${value.fileName}"\r\n`
					)
				);
				chunks.push(Buffer.from(`Content-Type: application/octet-stream\r\n\r\n`));
				chunks.push(value.buffer);
				chunks.push(Buffer.from(`\r\n`));
			} else {
				// Champ texte
				chunks.push(Buffer.from(`--${boundary}\r\n`));
				chunks.push(Buffer.from(`Content-Disposition: form-data; name="${key}"\r\n\r\n`));
				chunks.push(Buffer.from(`${value}\r\n`));
			}
		}

		chunks.push(Buffer.from(`--${boundary}--\r\n`));
		return Buffer.concat(chunks);
	}

	private async makeRequest(
		url: string,
		options: {
			method: string;
			headers: Record<string, string>;
			body?: Buffer;
		}
	): Promise<AnonTransferUploadResponse> {
		return new Promise((resolve, reject) => {
			const urlObj = new URL(url);
			const requestModule = urlObj.protocol === "https:" ? https : http;

			const req = requestModule.request(
				url,
				{
					method: options.method,
					headers: options.headers,
				},
				(res) => {
					let data = "";

					// Simple traitement sans décompression
					res.on("data", (chunk) => {
						data += chunk;
					});

					res.on("end", () => {
						console.log(`🔧 Debug: Raw response: ${data}`);
						try {
							const result = JSON.parse(data);
							resolve(result);
						} catch (error) {
							reject(new Error(`Failed to parse response: ${error}`));
						}
					});
				}
			);

			req.on("error", (error) => {
				reject(error);
			});

			if (options.body) {
				req.write(options.body);
			}

			req.end();
		});
	}
}
