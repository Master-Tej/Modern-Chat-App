import api from '@/services/axios';
import { User } from '@/types';

export async function fetchCurrentUser(): Promise<User> {
  const response = await api.get('/users/me');
  return response.data.data;
}
