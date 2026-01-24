import React from 'react';
import { AlertCircle, CheckCircle, Info, XCircle } from 'lucide-react';

/**
 * Alert component for displaying messages
 * @param {string} type - Type of alert: 'success', 'error', 'warning', 'info'
 * @param {string} message - Message to display
 * @param {function} onClose - Optional close callback
 */
export const Alert = ({ type = 'info', message, onClose }) => {
  const styles = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const icons = {
    success: <CheckCircle className="w-5 h-5" />,
    error: <XCircle className="w-5 h-5" />,
    warning: <AlertCircle className="w-5 h-5" />,
    info: <Info className="w-5 h-5" />,
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${styles[type]}`}>
      <div className="flex-shrink-0">{icons[type]}</div>
      <div className="flex-1">
        <p className="text-sm font-medium">{message}</p>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="flex-shrink-0 hover:opacity-70 transition"
        >
          <XCircle className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

/**
 * Loading spinner component
 * @param {string} size - Size: 'sm', 'md', 'lg'
 * @param {string} message - Optional loading message
 */
export const LoadingSpinner = ({ size = 'md', message }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizes[size]} border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin`}
      />
      {message && <p className="text-sm text-slate-600">{message}</p>}
    </div>
  );
};

/**
 * Empty state component
 * @param {string} icon - Lucide icon component
 * @param {string} title - Title text
 * @param {string} description - Description text
 * @param {node} action - Optional action button
 */
export const EmptyState = ({ icon: Icon, title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {Icon && (
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <Icon className="w-8 h-8 text-slate-400" />
        </div>
      )}
      <h3 className="text-lg font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-600 mb-6 max-w-sm">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
};

/**
 * Error message component for form fields
 * @param {string} message - Error message
 */
export const FieldError = ({ message }) => {
  if (!message) return null;

  return (
    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
      <AlertCircle className="w-4 h-4" />
      {message}
    </p>
  );
};

/**
 * Card component
 * @param {node} children - Card content
 * @param {string} className - Additional classes
 */
export const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-slate-200 ${className}`}>
      {children}
    </div>
  );
};

/**
 * Badge component
 * @param {string} variant - Variant: 'success', 'error', 'warning', 'info', 'default'
 * @param {node} children - Badge content
 */
export const Badge = ({ variant = 'default', children }) => {
  const styles = {
    success: 'bg-green-100 text-green-800',
    error: 'bg-red-100 text-red-800',
    warning: 'bg-yellow-100 text-yellow-800',
    info: 'bg-blue-100 text-blue-800',
    default: 'bg-slate-100 text-slate-800',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${styles[variant]}`}>
      {children}
    </span>
  );
};

export default { Alert, LoadingSpinner, EmptyState, FieldError, Card, Badge };
