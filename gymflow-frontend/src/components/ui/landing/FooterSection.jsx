import React from 'react';
import { motion } from 'framer-motion';

const FooterSection = () => {
  return (
    <motion.footer 
      className="w-full py-6 mt-12 text-center text-gray-500 text-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 1.0 }}
    >
      <p>&copy; {new Date().getFullYear()} GymFlow. All rights reserved.</p>
      <p className="mt-1">
        Built with <span className="text-red-500">&hearts;</span> by Your Name
      </p>
    </motion.footer>
  );
};

export default FooterSection;
