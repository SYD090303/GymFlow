export const titleCase = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(s => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase())
    .join(' ');
};
