import React from 'react';
import { motion } from 'framer-motion';

const FeatureCard = ({ title, description, color, features }) => {
  return (
    <motion.div 
      className="bg-white rounded-xl shadow-2xl p-6 transform transition-transform duration-500 hover:scale-105 hover:shadow-3xl"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="p-4">
        <h2 className={`text-2xl font-bold ${color} mb-3`}>{title}</h2>
        <p className="text-gray-700 mb-4 text-sm">{description}</p>
        <ul className={`grid gap-3 text-gray-600 text-sm ${features && features.length === 2 ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
          {features.map((item, idx) => (
            <li key={idx} className={`flex ${features && features.length === 2 ? 'items-center' : 'items-start'} gap-2`}>
              <svg
                className={`w-5 h-5 text-current flex-shrink-0 ${color.replace("text-", "text-")}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {item.icon}
              </svg>
              <span className="leading-tight">{item.text}</span>
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

export default FeatureCard;
