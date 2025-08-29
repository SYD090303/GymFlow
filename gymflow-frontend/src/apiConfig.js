const API_BASE_URL = "http://localhost:9001/gymflow";

export const AUTH_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/v1/auth/login`,
};

export const MEMBER_ENDPOINTS = {
  CREATE: `${API_BASE_URL}/api/v1/members/create`,
  GET_ALL: `${API_BASE_URL}/api/v1/members`,
  GET_BY_ID: (id) => `${API_BASE_URL}/api/v1/members/${id}`,
  UPDATE: (id) => `${API_BASE_URL}/api/v1/members/${id}`,
  DELETE: (id) => `${API_BASE_URL}/api/v1/members/${id}`,
  ACTIVATE: (id) => `${API_BASE_URL}/api/v1/members/activate/${id}`,
  DEACTIVATE: (id) => `${API_BASE_URL}/api/v1/members/deactivate/${id}`,
  LOG_ATTENDANCE: (memberId) => `${API_BASE_URL}/api/v1/members/${memberId}/attendance`,
  RENEW_MEMBERSHIP: (id) => `${API_BASE_URL}/api/v1/members/${id}/renew-membership`,
  GET_BY_EMAIL: `${API_BASE_URL}/api/v1/members/by-email`,
  GET_BY_STATUS: (status) => `${API_BASE_URL}/api/v1/members/status/${status}`,
  GET_BY_MEMBERSHIP_STATUS: (status) => `${API_BASE_URL}/api/v1/members/membership-status/${status}`,
  GET_ENDING_BEFORE: `${API_BASE_URL}/api/v1/members/membership/ending-before`,
  GET_ENDING_BETWEEN: `${API_BASE_URL}/api/v1/members/membership/ending-between`,
  GET_OUTSTANDING_PAYMENTS: `${API_BASE_URL}/api/v1/members/payments/outstanding`,
  GET_NO_PAYMENTS: `${API_BASE_URL}/api/v1/members/payments/none`,
};

export const MEMBERSHIP_PLAN_ENDPOINTS = {
  CREATE: `${API_BASE_URL}/api/v1/membership-plans/create`,
  GET_ALL: `${API_BASE_URL}/api/v1/membership-plans`,
  GET_BY_ID: (id) => `${API_BASE_URL}/api/v1/membership-plans/${id}`,
  UPDATE: (id) => `${API_BASE_URL}/api/v1/membership-plans/${id}`,
  DELETE: (id) => `${API_BASE_URL}/api/v1/membership-plans/${id}`,
  ACTIVATE: (id) => `${API_BASE_URL}/api/v1/membership-plans/${id}/activate`,
  DEACTIVATE: (id) => `${API_BASE_URL}/api/v1/membership-plans/${id}/deactivate`,
};

export const RECEPTIONIST_ENDPOINTS = {
  CREATE: `${API_BASE_URL}/api/v1/receptionists/create`,
  GET_ALL: `${API_BASE_URL}/api/v1/receptionists`,
  GET_BY_ID: (id) => `${API_BASE_URL}/api/v1/receptionists/${id}`,
  UPDATE: (id) => `${API_BASE_URL}/api/v1/receptionists/${id}`,
  DELETE: (id) => `${API_BASE_URL}/api/v1/receptionists/${id}`,
  ACTIVATE: (id) => `${API_BASE_URL}/api/v1/receptionists/activate/${id}`,
  DEACTIVATE: (id) => `${API_BASE_URL}/api/v1/receptionists/deactivate/${id}`,
};

export const ATTENDANCE_ENDPOINTS = {
  LOG: (memberId) => `${API_BASE_URL}/api/v1/attendance/member/${memberId}/log`,
  BY_MEMBER: (memberId) => `${API_BASE_URL}/api/v1/attendance/member/${memberId}`,
  BY_STATUS: (status) => `${API_BASE_URL}/api/v1/attendance/status/${status}`,
  RANGE: `${API_BASE_URL}/api/v1/attendance/range`,
  CHECK_IN: (memberId) => `${API_BASE_URL}/api/v1/attendance/member/${memberId}/check-in`,
  CHECK_OUT: (memberId) => `${API_BASE_URL}/api/v1/attendance/member/${memberId}/check-out`,
  TODAY: `${API_BASE_URL}/api/v1/attendance/today`,
};

export const ACTUATOR_ENDPOINTS = {
    HEALTH: `${API_BASE_URL}/actuator/health`,
    INFO: `${API_BASE_URL}/actuator/info`,
};
