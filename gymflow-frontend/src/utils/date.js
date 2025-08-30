const MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export const formatDate = (dt) => {
  if (!dt) return '-';
  const d = typeof dt === 'string' || typeof dt === 'number' ? new Date(dt) : dt;
  if (Number.isNaN(d.getTime())) return '-';
  const day = d.getDate();
  const mon = MONTHS_SHORT[d.getMonth()];
  const yr = d.getFullYear();
  return `${day} ${mon} ${yr}`;
};

export const formatTime = (dt) => {
  if (!dt) return '-';
  const d = typeof dt === 'string' || typeof dt === 'number' ? new Date(dt) : dt;
  if (Number.isNaN(d.getTime())) return '-';
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatDateTime = (dt) => {
  if (!dt) return '-';
  const d = typeof dt === 'string' || typeof dt === 'number' ? new Date(dt) : dt;
  if (Number.isNaN(d.getTime())) return '-';
  return `${formatDate(d)}, ${formatTime(d)}`;
};

export const durationSince = (start) => {
  if (!start) return '-';
  const d = typeof start === 'string' || typeof start === 'number' ? new Date(start) : start;
  if (Number.isNaN(d.getTime())) return '-';
  const ms = Date.now() - d.getTime();
  const totalMins = Math.floor(ms / 60000);
  const hrs = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  return hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;
};
