//filtre les diff champs du formData
export function filterFormDataFields(
  data: Record<string, any>,
  allowedFields: readonly string[]
) {
  const filteredData: Record<string, any> = {};

  for (const key of Object.keys(data)) {
    if (!allowedFields.includes(key)) {
      throw new Error(`Le champ "${key}" ne peut pas être modifié.`);
    }

    filteredData[key] = data[key];
  }

  return filteredData;
}
