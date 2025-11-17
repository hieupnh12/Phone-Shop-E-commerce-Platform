import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Check, AlertCircle, Info, X } from 'lucide-react';

const Toast = ({
  message = '',
  type = 'info',
  duration = 4000,
  onClose,
  position = 'top-right',
  action = null,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    if (duration && duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  if (!isVisible) return null;

  const typeConfig = {
    success: {
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      icon: <Check size={20} className="text-green-600" />,
      bgIcon: 'bg-green-100',
    },
    error: {
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-800',
      icon: <AlertCircle size={20} className="text-red-600" />,
      bgIcon: 'bg-red-100',
    },
    warning: {
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-800',
      icon: <AlertCircle size={20} className="text-yellow-600" />,
      bgIcon: 'bg-yellow-100',
    },
    info: {
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      icon: <Info size={20} className="text-blue-600" />,
      bgIcon: 'bg-blue-100',
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  const positionClasses = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4',
  };

  return (
    <div
      className={`
        fixed ${positionClasses[position]} z-50
        transform transition-all duration-300
        ${isExiting ? 'opacity-0 translate-y-2' : 'opacity-100 translate-y-0'}
      `}
    >
      <div className={`
        ${config.bg} ${config.border} ${config.text}
        border rounded-lg shadow-lg p-4 flex items-start gap-3
        max-w-sm w-full
      `}>
        {/* Icon */}
        <div className={`${config.bgIcon} p-2 rounded-lg flex-shrink-0`}>
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-grow">
          <p className="font-medium text-sm">{message}</p>
          {action && (
            <button
              onClick={action.onClick}
              className="text-xs font-semibold mt-2 hover:underline"
            >
              {action.label}
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1 hover:bg-black hover:bg-opacity-10 rounded transition-colors"
          aria-label="Close toast"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

Toast.propTypes = {
  message: PropTypes.string,
  type: PropTypes.oneOf(['success', 'error', 'warning', 'info']),
  duration: PropTypes.number,
  onClose: PropTypes.func,
  position: PropTypes.oneOf(['top-left', 'top-right', 'bottom-left', 'bottom-right']),
  action: PropTypes.shape({
    label: PropTypes.string,
    onClick: PropTypes.func,
  }),
};

export default Toast;
