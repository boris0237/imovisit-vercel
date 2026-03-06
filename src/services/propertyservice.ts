import axios from "axios";

export const createProperty = async (data: any) => {
  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL}/properties`,
    data,
    {
      withCredentials: true, // si tu utilises cookies / JWT
    }
  );

  return response.data;
};