import api from '@/services/axios';
import { User } from '@/types';

export async function searchUsers(query: string): Promise<User[]> {
  const response = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
  return response.data.data;
}

export async function getUserByUsername(username: string): Promise<User> {
  const response = await api.get(`/users/${username}`);
  return response.data.data;
}
