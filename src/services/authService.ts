// src/services/authService.ts
import { fetchApi } from './apiConfig';

export const authService = {
  /**
   
   * @param credentials 
   * @returns 
   */
  login: async (credentials: { email: string; password?: string }) => {
    const response = await fetchApi('/api/users/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    return response.data.user;
  },
  logout: async () => {
    const response = await fetchApi('/api/users/logout', {
      method: 'POST',
    });
    
    return response;
  },
  register: async (userData: any) => {
    const response = await fetchApi('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    return response.data;
  }
};