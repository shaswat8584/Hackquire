import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';

const Modal = ({ isOpen, onClose, children, maxWidth = 'max-w-md' }) => {
  useEffect(() => {
    if (isOpen) {
      // Prevent background scrolling when modal is active
      const originalStyle = window.getComputedStyle(document.body).overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
      {/* Full-screen backdrop tint & blur (covers header, sidebar, whole viewport) */}
      <div
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Modal Dialog Content Container */}
      <div className={`relative z-10 bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full ${maxWidth} max-h-[90vh] overflow-y-auto`}>
        {children}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
