import apiClient from '../apiClient';
import { NOTIFICATION_ENDPOINTS } from '../apiConfig';

export const getOwnerNotifications = async () => {
  const { data } = await apiClient.get(NOTIFICATION_ENDPOINTS.OWNER_LIST);
  return data;
};

export const getMyNotifications = async () => {
  const res = await apiClient.get(NOTIFICATION_ENDPOINTS.MY_LIST);
  return res.data;
};

export const markNotificationRead = async (id) => {
  await apiClient.put(NOTIFICATION_ENDPOINTS.MARK_READ(id));
  return true;
};

export const markAllRead = async () => {
  await apiClient.put(NOTIFICATION_ENDPOINTS.MARK_ALL_READ);
  return true;
};
