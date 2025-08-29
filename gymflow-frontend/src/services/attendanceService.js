import apiClient from '../apiClient';
import { ATTENDANCE_ENDPOINTS } from '../apiConfig';

export const logAttendance = async (memberId, recordedBy = 'RECEPTIONIST') => {
  const { data } = await apiClient.post(ATTENDANCE_ENDPOINTS.LOG(memberId), { recordedBy });
  return data;
};

export const checkIn = async (memberId, { checkInTime, attendanceStatus } = {}) => {
  const payload = {};
  if (checkInTime) payload.checkInTime = checkInTime;
  if (attendanceStatus) payload.attendanceStatus = attendanceStatus;
  const { data } = await apiClient.post(ATTENDANCE_ENDPOINTS.CHECK_IN(memberId), payload);
  return data;
};

export const checkOut = async (memberId, { checkOutTime } = {}) => {
  const payload = {};
  if (checkOutTime) payload.checkOutTime = checkOutTime;
  const { data } = await apiClient.post(ATTENDANCE_ENDPOINTS.CHECK_OUT(memberId), payload);
  return data;
};

export const listByMember = async (memberId) => {
  const { data } = await apiClient.get(ATTENDANCE_ENDPOINTS.BY_MEMBER(memberId));
  return data;
};

export const listByStatus = async (status) => {
  const { data } = await apiClient.get(ATTENDANCE_ENDPOINTS.BY_STATUS(status));
  return data;
};

export const listInRange = async (startISO, endISO) => {
  const { data } = await apiClient.get(ATTENDANCE_ENDPOINTS.RANGE, { params: { start: startISO, end: endISO } });
  return data;
};

export const listToday = async () => {
  const { data } = await apiClient.get(ATTENDANCE_ENDPOINTS.TODAY);
  return data;
};
