import React from 'react';

const ConfirmDialog = ({ isOpen, title, description, confirmText = 'Confirm', cancelText = 'Cancel', onConfirm, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-xl border border-gray-100 w-full max-w-md mx-4 p-5">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {description && (
          <p className="mt-2 text-sm text-gray-600 whitespace-pre-line">{description}</p>
        )}
        <div className="mt-5 flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 rounded-md border border-gray-200 text-gray-700 hover:bg-gray-50">{cancelText}</button>
          <button onClick={() => { onConfirm?.(); }} className="px-4 py-2 rounded-md bg-rose-600 text-white hover:bg-rose-700">{confirmText}</button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
