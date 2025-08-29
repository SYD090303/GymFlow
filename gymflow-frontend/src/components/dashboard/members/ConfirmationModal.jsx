import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { variants } from '../../../ui/motionPresets';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title = 'Are you sure?', description = 'This action cannot be undone.', confirmText = 'Confirm' }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-center items-center z-50 p-4" {...variants.backdrop} onClick={onClose}>
        <motion.div className="relative bg-white p-6 rounded-2xl shadow-2xl w-full max-w-sm" {...variants.scaleIn} onClick={(e) => e.stopPropagation()}>
          <h3 className="text-xl font-semibold mb-2">{title}</h3>
          <p className="text-gray-600 mb-6">{description}</p>
          <div className="flex justify-end space-x-3">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-lg">Cancel</button>
            <button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white rounded-lg">{confirmText}</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ConfirmationModal;
