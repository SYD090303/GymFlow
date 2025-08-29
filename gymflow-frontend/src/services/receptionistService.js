import apiClient from '../apiClient';
import { RECEPTIONIST_ENDPOINTS } from '../apiConfig';

export const getReceptionists = async () => {
  try {
    const response = await apiClient.get(RECEPTIONIST_ENDPOINTS.GET_ALL);
    return response.data;
  } catch (error) {
    console.error("Error fetching receptionists", error);
    throw error;
  }
};

export const getReceptionistById = async (id) => {
  const { data } = await apiClient.get(RECEPTIONIST_ENDPOINTS.GET_BY_ID(id));
  return data;
};

export const createReceptionist = async (payload) => {
  const { data } = await apiClient.post(RECEPTIONIST_ENDPOINTS.CREATE, payload);
  return data;
};

export const updateReceptionist = async (id, payload) => {
  const { data } = await apiClient.put(RECEPTIONIST_ENDPOINTS.UPDATE(id), payload);
  return data;
};

export const deleteReceptionist = async (id) => {
  const { data } = await apiClient.delete(RECEPTIONIST_ENDPOINTS.DELETE(id));
  return data;
};

export const activateReceptionist = async (id) => {
  const { data } = await apiClient.put(RECEPTIONIST_ENDPOINTS.ACTIVATE(id));
  return data;
};

export const deactivateReceptionist = async (id) => {
  const { data } = await apiClient.put(RECEPTIONIST_ENDPOINTS.DEACTIVATE(id));
  return data;
};
