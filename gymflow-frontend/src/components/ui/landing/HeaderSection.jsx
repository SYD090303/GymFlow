import React from "react";
import ModernButton from "./ModernButton";
import { motion } from "framer-motion";

const HeaderSection = ({ onLoginClick }) => {
  return (
    <motion.header 
      className="py-8 px-6 sm:px-8 lg:px-12 text-center relative z-10"
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      <div className="max-w-4xl mx-auto">
        <motion.h1 
          className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-wide text-gray-900 leading-tight"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Your Gym, <span className="text-blue-600">Reimagined.</span>
        </motion.h1>
        <motion.p 
          className="mt-4 text-lg md:text-xl text-gray-600 max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Streamline operations, engage members, and grow your gym effortlessly.
        </motion.p>
        <motion.div 
          className="mt-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <ModernButton onClick={onLoginClick}>
            Log In to Your Dashboard
          </ModernButton>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default HeaderSection;
