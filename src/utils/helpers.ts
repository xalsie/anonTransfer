export function isValidFilePath(filePath: string): boolean {
	// Simple validation, à adapter selon les besoins
	return typeof filePath === "string" && filePath.length > 0;
}
