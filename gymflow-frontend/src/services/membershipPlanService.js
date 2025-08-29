import apiClient from '../apiClient';
import { MEMBERSHIP_PLAN_ENDPOINTS } from '../apiConfig';

export const getMembershipPlans = async () => {
  try {
    const res = await apiClient.get(MEMBERSHIP_PLAN_ENDPOINTS.GET_ALL);
    return res.data;
  } catch (err) {
    console.error('Error fetching membership plans', err);
    throw err;
  }
};

export const getMembershipPlanById = async (id) => {
  try {
    const res = await apiClient.get(MEMBERSHIP_PLAN_ENDPOINTS.GET_BY_ID(id));
    return res.data;
  } catch (err) {
    console.error(`Error fetching membership plan ${id}`, err);
    throw err;
  }
};

export const createMembershipPlan = async (payload) => {
  try {
    const res = await apiClient.post(MEMBERSHIP_PLAN_ENDPOINTS.CREATE, payload);
    return res.data;
  } catch (err) {
    console.error('Error creating membership plan', err);
    throw err;
  }
};

export const updateMembershipPlan = async (id, payload) => {
  try {
    const res = await apiClient.put(MEMBERSHIP_PLAN_ENDPOINTS.UPDATE(id), payload);
    return res.data;
  } catch (err) {
    console.error(`Error updating membership plan ${id}`, err);
    throw err;
  }
};

export const deleteMembershipPlan = async (id) => {
  try {
    const res = await apiClient.delete(MEMBERSHIP_PLAN_ENDPOINTS.DELETE(id));
    return res.data;
  } catch (err) {
    console.error(`Error deleting membership plan ${id}`, err);
    throw err;
  }
};

export const activateMembershipPlan = async (id) => {
  try {
  const res = await apiClient.patch(MEMBERSHIP_PLAN_ENDPOINTS.ACTIVATE(id));
    return res.data;
  } catch (err) {
    console.error(`Error activating membership plan ${id}`, err);
    throw err;
  }
};

export const deactivateMembershipPlan = async (id) => {
  try {
  const res = await apiClient.patch(MEMBERSHIP_PLAN_ENDPOINTS.DEACTIVATE(id));
    return res.data;
  } catch (err) {
    console.error(`Error deactivating membership plan ${id}`, err);
    throw err;
  }
};
