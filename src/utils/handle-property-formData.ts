import { uploadToCloudinary } from "@/lib/cloudinary";
import { UPLOAD_FOLDERS } from "@/types/constant";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

type FolderType =
  (typeof UPLOAD_FOLDERS)[keyof typeof UPLOAD_FOLDERS];

// Type spécifique à Property
export type PropertyFormDataResult = {
  images: string[];
} & Record<string, any>;

export async function handlePropertyFormData(
  formData: FormData
): Promise<PropertyFormDataResult> {
  const data: Record<string, any> = {};
  const images: string[] = [];
  const amenities: string[] = [];

  for (const [key, value] of Array.from(formData.entries())) {

    if (value instanceof File && value.size > 0) {
      if (value.size > MAX_SIZE) {
        throw new Error(`Le fichier ${key} dépasse 5MB`);
      }

      let folder: FolderType = UPLOAD_FOLDERS.DOCUMENT;
      if (key.toLowerCase() === "images") folder = UPLOAD_FOLDERS.IMAGE;

      const bytes = await value.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadResult: any = await uploadToCloudinary(buffer, folder);

      // Images multiples
      if (key.toLowerCase() === "images") {
        images.push(uploadResult.secure_url);
      }

      // Document
      else if (key.toLowerCase() === "doctitrefoncier") {
        data.docTitreFoncier = uploadResult.secure_url;
      }
    }
    else if (typeof value === "string" && value.trim() !== "") {
      if (key.toLowerCase() === "amenities") {
        amenities.push(value);
        continue;
      }

      // Conversion Boolean
      if (value === "true") {
        data[key] = true;
      }
      else if (value === "false") {
        data[key] = false;
      }

      // Conversion Number
      else if (!isNaN(Number(value))) {
        data[key] = Number(value);
      }

      // Sinon string normale
      else {
        data[key] = value;
      }
    }
  }

  return {
    ...data,
    amenities,
    ...(images.length > 0 ? { images } : {}),
  };
}
