import { uploadToCloudinary } from "@/lib/cloudinary";
import { UPLOAD_FOLDERS } from "@/types/constant";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

type FolderType =
  (typeof UPLOAD_FOLDERS)[keyof typeof UPLOAD_FOLDERS];

// Type spécifique à Property
export type PropertyFormDataResult = {
  images: string[];
  documents: string[];
} & Record<string, any>;

export async function handlePropertyFormData(
  formData: FormData
): Promise<PropertyFormDataResult> {
  const data: Record<string, any> = {};
  const images: string[] = [];
  const documents: string[] = [];

  for (const key of Array.from(formData.keys())) {
    const value = formData.get(key);

    if (value instanceof File && value.size > 0) {
      if (value.size > MAX_SIZE) {
        throw new Error(`Le fichier ${key} dépasse 5MB`);
      }

      let folder: FolderType = UPLOAD_FOLDERS.DOCUMENT;
      if (key.toLowerCase() === "images") folder = UPLOAD_FOLDERS.IMAGE;
      if (key.toLowerCase() === "avatar" || key.toLowerCase() === "companylogo") folder = UPLOAD_FOLDERS.AVATAR;

      const bytes = await value.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const uploadResult: any = await uploadToCloudinary(buffer, folder);

      if (key.toLowerCase() === "images") images.push(uploadResult.secure_url);
      else if (key.toLowerCase() === "documents") documents.push(uploadResult.secure_url);
      else data[key] = uploadResult.secure_url;
    } 
    else if (typeof value === "string" && value.trim() !== "") {
      data[key] = isNaN(Number(value)) ? value : Number(value);
    }
  }

  return {
    ...data,
    images,
    documents,
  };
}
