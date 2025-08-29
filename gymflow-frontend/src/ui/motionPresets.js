// Centralized motion presets for consistent timing and easing
export const ease = [0.2, 0.8, 0.2, 1]; // material-ish easeOut

export const transitions = {
  quick: { duration: 0.12, ease },
  base: { duration: 0.2, ease },
  slow: { duration: 0.28, ease },
};

export const variants = {
  fadeUp: {
    initial: { opacity: 0, y: 8 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 8 },
    transition: transitions.base,
  },
  fadeDown: {
    initial: { opacity: 0, y: -6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -6 },
    transition: transitions.base,
  },
  scaleIn: {
    initial: { opacity: 0, scale: 0.96, y: -4 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.96, y: -4 },
    transition: transitions.quick,
  },
  backdrop: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: transitions.base,
  },
  cardIn: {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 6 },
    transition: transitions.slow,
  },
  tableRow: {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 6 },
    transition: transitions.base,
  },
};

export const list = {
  container: {
    animate: { transition: { staggerChildren: 0.05, delayChildren: 0.02 } },
  },
  item: {
    initial: { opacity: 0, y: 6 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: 6 },
    transition: transitions.base,
  },
};
