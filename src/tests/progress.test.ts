import { AnonTransfer, type FileToUpload } from "../index.js";

async function progressExample() {
	console.log("AnonTransfer Upload with Progress Example");
	console.log("==========================================\n");

	const api = new AnonTransfer();

	try {
		const files: FileToUpload[] = [
			{
				file: Buffer.from("Hello, this is file 1 content for AnonTransfer"),
				fileName: "progress-test-1.txt",
			},
			{
				file: Buffer.from("Hello, this is file 2 content for AnonTransfer"),
				fileName: "progress-test-2.txt",
			},
			{
				file: Buffer.from("Hello, this is file 3 content for AnonTransfer"),
				fileName: "progress-test-3.txt",
			},
			{
				file: Buffer.from("Hello, this is file 4 content for AnonTransfer"),
				fileName: "progress-test-4.txt",
			},
		];

		console.log(`Uploading ${files.length} files with progress tracking...`);
		console.log("Files to upload:");
		files.forEach((file, index) => {
			console.log(`   ${index + 1}. ${file.fileName} (${file.file.length} bytes)`);
		});
		console.log();

		const uploadHandler = await api.uploadFiles(files);

		uploadHandler.on("uploadProgress", (progress) => {
			if (!progress.completed) {
				console.log(
					`Starting upload: ${progress.fileName} (${progress.currentFile}/${progress.totalFiles})`
				);
			} else {
				if (progress.success) {
					console.log(`Completed: ${progress.fileName} -> ${progress.downloadPage}`);
				} else {
					console.log(`Failed: ${progress.fileName} -> ${progress.error}`);
				}
			}
		});

		uploadHandler.on("done", (results) => {
			console.log("\nUpload process completed!");
			console.log("Final results:", {
				success: results.success,
				totalFiles: files.length,
				successfulUploads: results.results.filter((r) => r.success).length,
				folderId: results.folderId,
				downloadPage: results.downloadPage,
				error: results.error,
			});

			if (results.success) {
				console.log("All files uploaded successfully!");
				console.log("Folder download page:", results.downloadPage);
				process.exit(0);
			} else {
				console.error("Some uploads failed:", results.error);
				process.exit(1);
			}
		});
	} catch (error) {
		console.error("Error:", error);
	}
}

progressExample().catch(console.error);
