import apiClient from '../apiClient';

const API_BASE_URL = 'http://localhost:9001/gymflow';

export const getMyProfile = async () => {
  const { data } = await apiClient.get(`${API_BASE_URL}/api/v1/users/me`);
  return data;
};

export const updateMyProfile = async (payload) => {
  const { data } = await apiClient.put(`${API_BASE_URL}/api/v1/users/me/profile`, payload);
  return data;
};

export const changeMyPassword = async ({ currentPassword, newPassword }) => {
  const { data } = await apiClient.post(`${API_BASE_URL}/api/v1/users/me/change-password`, { currentPassword, newPassword });
  return data;
};

export const changeMyEmail = async ({ currentPassword, newEmail }) => {
  const { data } = await apiClient.post(`${API_BASE_URL}/api/v1/users/me/change-email`, { currentPassword, newEmail });
  return data; // { accessToken, tokenType }
};
