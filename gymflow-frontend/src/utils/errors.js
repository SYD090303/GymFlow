export const extractErrorMessage = (error, fallback = 'Something went wrong') => {
  if (!error) return fallback;
  const data = error.response?.data;
  return (
    data?.errorMessage ||
    data?.message ||
    error.message ||
    fallback
  );
};

// Try to extract per-field validation errors from various backend shapes
// Supported shapes (examples):
// - { errors: [{ field: 'email', message: 'must be valid' }] }
// - { errors: [{ field: 'email', defaultMessage: '...' }] }
// - { fieldErrors: { email: '...' } }
// - { validationErrors: [{ field: 'email', message: '...' }] }
// - { details: { email: '...' } } or details as array of strings
export const extractFieldErrors = (error) => {
  const out = {};
  const data = error?.response?.data;
  if (!data) return out;

  const push = (field, message) => {
    if (!field || !message) return;
    const key = String(field).trim();
    if (!key) return;
    out[key] = message;
  };

  // Common arrays
  const arrays = [data.errors, data.validationErrors, data.fieldErrors, data.violations];
  for (const arr of arrays) {
    if (Array.isArray(arr)) {
      for (const e of arr) {
        push(e?.field || e?.propertyPath || e?.name, e?.message || e?.defaultMessage || e?.description);
      }
    }
  }
  // Common maps
  const maps = [data.fieldErrors, data.details, data.errors];
  for (const m of maps) {
    if (m && typeof m === 'object' && !Array.isArray(m)) {
      for (const [k, v] of Object.entries(m)) {
        push(k, typeof v === 'string' ? v : (v?.message || v?.defaultMessage));
      }
    }
  }

  // Heuristic mapping from generic errorMessage to likely fields
  const msg = data.errorMessage || data.message;
  if (msg && Object.keys(out).length === 0) {
    const m = String(msg).toLowerCase();
    if (m.includes('email')) push('email', msg);
    if (m.includes('password')) push('password', msg);
    if (m.includes('phone')) push('phone', msg);
    if (m.includes('plan')) push('membershipPlanId', msg);
    if (m.includes('start')) push('startDate', msg);
  }

  return out;
};
