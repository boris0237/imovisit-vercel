import { uploadToCloudinary } from "@/lib/cloudinary";
import { UPLOAD_FOLDERS } from "@/types/constant";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

type FolderType = (typeof UPLOAD_FOLDERS)[keyof typeof UPLOAD_FOLDERS];

export async function handleFormData(formData: FormData) {
  const data: Record<string, any> = {};

  // Parcours toutes les entrées du FormData
  for (const key of Array.from(formData.keys())) {
    const value = formData.get(key);

    // Si c'est un fichier
    if (value instanceof File && value.size > 0) {
      if (value.size > MAX_SIZE) {
        throw new Error(`Le fichier ${key} dépasse 5MB`);
      }

      const bytes = await value.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Choisir le dossier selon le champ
      let folder: FolderType = UPLOAD_FOLDERS.DOCUMENT;
      if (key.toLowerCase() === "documents") folder = UPLOAD_FOLDERS.DOCUMENT;

      const uploadResult: any = await uploadToCloudinary(buffer, folder);

      data[key] = uploadResult.secure_url;
    }

    // Si c'est un champ texte
    else if (typeof value === "string" && value.trim() !== "") {
      data[key] = isNaN(Number(value)) ? value : Number(value);
    }
  }

  return data;
}
