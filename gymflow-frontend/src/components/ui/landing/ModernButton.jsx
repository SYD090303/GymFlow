import React from 'react';
import { motion } from 'framer-motion';

const ModernButton = ({ onClick, children }) => {
  return (
    <motion.button
      onClick={onClick}
      className="relative inline-flex items-center justify-center p-4 px-6 py-3 font-semibold text-white transition-all duration-300 rounded-full group focus:outline-none focus:ring-4 focus:ring-indigo-300 overflow-hidden shadow-lg"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <span className="absolute inset-0 w-full h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-500 group-hover:from-indigo-600 group-hover:to-blue-600 transition-all duration-300"></span>
      <span className="relative z-10">{children}</span>
    </motion.button>
  );
};

export default ModernButton;
