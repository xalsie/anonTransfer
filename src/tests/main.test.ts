import { uploadFileFromBuffer } from "../lib.js";

async function testFileUpload() {
	try {
		console.log("🔧 Test d'upload de fichier...");

		// Test avec buffer
		const testContent = "Contenu de test pour AnonTransfer API";
		const buffer = Buffer.from(testContent, "utf8");

		const result = await uploadFileFromBuffer(buffer, "test-file.txt", {
			onProgress: (progress) => {
				console.log(`Progress: ${progress}%`);
			},
		});

		console.log("✅ Upload réussi:");
		console.log(`URL: ${result.uri}`);
		console.log(`Nom: ${result.name}`);
		console.log(`Dossier: ${result.folderUri}`);
		console.log(`ID: ${result.id}`);

		return result;
	} catch (error) {
		console.error("❌ Erreur lors de l'upload:", error);
		throw error;
	}
}

async function testBufferUpload() {
	try {
		console.log("\n🔧 Test d'upload depuis buffer...");

		const largerContent = "A".repeat(1000); // 1KB de données
		const buffer = Buffer.from(largerContent, "utf8");

		const result = await uploadFileFromBuffer(buffer, "large-test.txt", {
			onProgress: (progress) => {
				console.log(`Progress: ${progress}%`);
			},
		});

		console.log("✅ Upload de buffer réussi:");
		console.log(`URL: ${result.uri}`);
		console.log(`Taille: ${buffer.length} bytes`);

		return result;
	} catch (error) {
		console.error("❌ Erreur lors de l'upload de buffer:", error);
		throw error;
	}
}

// Exécution des tests
async function main() {
	console.log("🚀 Démarrage des tests AnonTransfer API");

	try {
		await testFileUpload();
		await testBufferUpload();
		console.log("\n✅ Tous les tests ont réussi!");
		process.exit(0);
	} catch (error) {
		console.error("\n❌ Tests échoués:", error);
		process.exit(1);
	}
}

// Exécuter si le fichier est appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
	main();
}
