# AnonTransfer API

Une API TypeScript pour intégrer AnonTransfer dans vos applications Node.js.

## Fonctionnalités

- Upload de fichiers vers AnonTransfer
- Gestion de la progression d'upload
- Support des groupes de fichiers

## Installation

```bash
npm install
```

## Utilisation

### Utilisation basique

```typescript
import { AnonTransferAPI } from "./src/lib";

const api = new AnonTransferAPI();

const result = await api.uploadFile("/path/to/file.txt");
console.log("URL de téléchargement:", result.uri);
```

### Utilisation avec progression

```typescript
import { AnonTransferAPI } from "./src/lib";

const api = new AnonTransferAPI();

const options = {
	onProgress: (progress: number) => {
		console.log(`Upload: ${progress}%`);
	},
	groupId: "custom-group-id-uuid", // Optionnel uuid v4
};

const result = await api.uploadFile("/path/to/file.txt", options);
```

### Upload depuis un buffer

```typescript
import { AnonTransferAPI } from "./src/lib";

const api = new AnonTransferAPI();
const buffer = Buffer.from("Contenu du fichier");

const result = await api.uploadFileFromBuffer(buffer, "filename.txt");
```

## Structure du projet

```text
src/
├── interfaces/           # Interfaces et contrats
│   └── IAnonTransferRepository.ts
├── repositories/         # Implémentations des repositories
│   └── AnonTransferRepository.ts
├── services/             # Services métier
│   ├── AuthenticationService.ts
│   ├── FileUploadService.ts
│   ├── FileInfoService.ts
│   ├── FileDeleteService.ts
│   └── UploadProgressHandler.ts
├── utils/               # Utilitaires
│   ├── EventEmitter.ts
│   └── helpers.ts
├── types/               # Types TypeScript
│   └── index.ts
├── tests/               # Tests
│   └── test.ts
├── lib.ts               # API principale
├── index.ts             # Point d'entrée
└── example.ts           # Exemple d'utilisation
```

## Principes de Clean Architecture

1. **Séparation des responsabilités** : Chaque classe a une seule responsabilité
2. **Inversion de dépendance** : Les services dépendent d'interfaces, pas d'implémentations
3. **Testabilité** : Architecture découplée permettant le mocking facile
4. **Extensibilité** : Facile d'ajouter de nouvelles fonctionnalités

## Types de retour

### UploadResult

```typescript
interface UploadResult {
	success: boolean;
	name: string;
	uri: string;
	dir: string;
	id: number;
	groupId: string;
	isPartOfGroup: boolean;
	folderUri: string;
}
```

### UploadOptions

```typescript
interface UploadOptions {
	onProgress?: (progress: number) => void;
	groupId?: string;
	chunkSize?: number;
}
```

## Gestion des erreurs

L'API lance des erreurs typées que vous pouvez capturer :

```typescript
try {
	const result = await api.uploadFile("/path/to/file.txt");
} catch (error) {
	if (error instanceof Error) {
		console.error("Erreur d'upload:", error.message);
	}
}
```

## Développement

```bash
# Compilation
npm run build

# Tests
npm run test

# Linting
npm run lint
```
