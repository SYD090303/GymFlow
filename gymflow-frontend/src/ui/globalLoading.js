// Tiny global loading bus for API activity
// Allows axios interceptors to signal in-flight requests and React to subscribe.
const listeners = new Set();
let count = 0;

export const globalLoading = {
  inc() {
    count += 1;
    for (const l of listeners) l(count);
  },
  dec() {
    count = Math.max(0, count - 1);
    for (const l of listeners) l(count);
  },
  subscribe(fn) {
    listeners.add(fn);
    // emit current value on subscribe
    try { fn(count); } catch (_) {}
    return () => listeners.delete(fn);
  }
};

export function getLoadingCount() { return count; }
