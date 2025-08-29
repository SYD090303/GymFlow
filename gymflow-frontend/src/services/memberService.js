import apiClient from '../apiClient';
import { MEMBER_ENDPOINTS } from '../apiConfig';

export const getMembers = async () => {
  try {
    const response = await apiClient.get(MEMBER_ENDPOINTS.GET_ALL);
    return response.data;
  } catch (error) {
    console.error("Error fetching members", error);
    throw error;
  }
};

export const getMemberById = async (id) => {
  try {
    const response = await apiClient.get(MEMBER_ENDPOINTS.GET_BY_ID(id));
    return response.data;
  } catch (error) {
    console.error(`Error fetching member ${id}`, error);
    throw error;
  }
};

export const getMemberByEmail = async (email) => {
  try {
    const response = await apiClient.get(MEMBER_ENDPOINTS.GET_BY_EMAIL, { params: { email } });
    return response.data;
  } catch (error) {
    console.error(`Error fetching member by email ${email}`, error);
    throw error;
  }
};

export const createMember = async (memberData) => {
    try {
        const response = await apiClient.post(MEMBER_ENDPOINTS.CREATE, memberData);
        return response.data;
    } catch (error) {
        console.error("Error creating member", error);
        throw error;
    }
};

export const updateMember = async (id, memberData) => {
  try {
    const response = await apiClient.put(MEMBER_ENDPOINTS.UPDATE(id), memberData);
    return response.data;
  } catch (error) {
    console.error(`Error updating member ${id}`, error);
    throw error;
  }
};

export const deleteMember = async (id) => {
  try {
    const response = await apiClient.delete(MEMBER_ENDPOINTS.DELETE(id));
    return response.data;
  } catch (error) {
    console.error(`Error deleting member ${id}`, error);
    throw error;
  }
};

export const activateMember = async (id) => {
  try {
    const response = await apiClient.put(MEMBER_ENDPOINTS.ACTIVATE(id));
    return response.data;
  } catch (error) {
    console.error(`Error activating member ${id}`, error);
    throw error;
  }
};

export const deactivateMember = async (id) => {
  try {
    const response = await apiClient.put(MEMBER_ENDPOINTS.DEACTIVATE(id));
    return response.data;
  } catch (error) {
    console.error(`Error deactivating member ${id}`, error);
    throw error;
  }
};

export const logAttendance = async (memberId, recordedBy = 'RECEPTIONIST') => {
  try {
    const response = await apiClient.post(MEMBER_ENDPOINTS.LOG_ATTENDANCE(memberId), { recordedBy });
    return response.data;
  } catch (error) {
    console.error(`Error logging attendance for member ${memberId}`, error);
    throw error;
  }
};

export const renewMembership = async (id, newStartDate) => {
  try {
    const response = await apiClient.post(MEMBER_ENDPOINTS.RENEW_MEMBERSHIP(id), null, { params: { newStartDate } });
    return response.data;
  } catch (error) {
    console.error(`Error renewing membership for member ${id}`, error);
    throw error;
  }
};

export const getMembersByStatus = async (status) => {
  try {
    const response = await apiClient.get(MEMBER_ENDPOINTS.GET_BY_STATUS(status));
    return response.data;
  } catch (error) {
    console.error(`Error fetching members by status ${status}`, error);
    throw error;
  }
};

export const getMembersByMembershipStatus = async (status) => {
  try {
    const response = await apiClient.get(MEMBER_ENDPOINTS.GET_BY_MEMBERSHIP_STATUS(status));
    return response.data;
  } catch (error) {
    console.error(`Error fetching members by membership status ${status}`, error);
    throw error;
  }
};

export const getMembersEndingBefore = async (date) => {
  try {
    const response = await apiClient.get(MEMBER_ENDPOINTS.GET_ENDING_BEFORE, { params: { date } });
    return response.data;
  } catch (error) {
    console.error('Error fetching members ending before', error);
    throw error;
  }
};

export const getMembersEndingBetween = async (start, end) => {
  try {
    const response = await apiClient.get(MEMBER_ENDPOINTS.GET_ENDING_BETWEEN, { params: { start, end } });
    return response.data;
  } catch (error) {
    console.error('Error fetching members ending between', error);
    throw error;
  }
};

export const getMembersWithOutstandingPayments = async () => {
  try {
    const response = await apiClient.get(MEMBER_ENDPOINTS.GET_OUTSTANDING_PAYMENTS);
    return response.data;
  } catch (error) {
    console.error('Error fetching members with outstanding payments', error);
    throw error;
  }
};

export const getMembersWithNoPayments = async () => {
  try {
    const response = await apiClient.get(MEMBER_ENDPOINTS.GET_NO_PAYMENTS);
    return response.data;
  } catch (error) {
    console.error('Error fetching members with no payments', error);
    throw error;
  }
};
