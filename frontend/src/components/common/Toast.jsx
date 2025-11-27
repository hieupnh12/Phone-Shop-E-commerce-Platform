import React, { useState, useEffect } from 'react';
import { Check, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

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
      bg: 'bg-gradient-to-br from-emerald-50/90 via-green-50/80 to-teal-50/90',
      border: 'border-emerald-200/50',
      text: 'text-emerald-800',
      icon: <Check size={20} className="text-white" />,
      iconBg: 'bg-gradient-to-br from-emerald-400 via-green-500 to-teal-500',
      progressBg: 'bg-gradient-to-r from-emerald-400 to-teal-500',
      shadow: 'shadow-xl shadow-emerald-100/50',
    },
    error: {
      bg: 'bg-gradient-to-br from-rose-50/90 via-red-50/80 to-pink-50/90',
      border: 'border-rose-200/50',
      text: 'text-rose-800',
      icon: <AlertCircle size={20} className="text-white" />,
      iconBg: 'bg-gradient-to-br from-rose-400 via-red-500 to-pink-500',
      progressBg: 'bg-gradient-to-r from-rose-400 to-pink-500',
      shadow: 'shadow-xl shadow-rose-100/50',
    },
    warning: {
      bg: 'bg-gradient-to-br from-amber-50/90 via-yellow-50/80 to-orange-50/90',
      border: 'border-amber-200/50',
      text: 'text-amber-800',
      icon: <AlertTriangle size={20} className="text-white" />,
      iconBg: 'bg-gradient-to-br from-amber-400 via-yellow-500 to-orange-500',
      progressBg: 'bg-gradient-to-r from-amber-400 to-orange-500',
      shadow: 'shadow-xl shadow-amber-100/50',
    },
    info: {
      bg: 'bg-gradient-to-br from-sky-50/90 via-blue-50/80 to-indigo-50/90',
      border: 'border-sky-200/50',
      text: 'text-sky-800',
      icon: <Info size={20} className="text-white" />,
      iconBg: 'bg-gradient-to-br from-sky-400 via-blue-500 to-indigo-500',
      progressBg: 'bg-gradient-to-r from-sky-400 to-indigo-500',
      shadow: 'shadow-xl shadow-sky-100/50',
    },
    loading: {
      bg: 'bg-gradient-to-br from-slate-50/90 via-gray-50/80 to-zinc-50/90',
      border: 'border-slate-200/50',
      text: 'text-slate-800',
      icon: <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />,
      iconBg: 'bg-gradient-to-br from-slate-400 via-gray-500 to-zinc-500',
      progressBg: 'bg-gradient-to-r from-slate-400 to-zinc-500',
      shadow: 'shadow-xl shadow-slate-100/50',
    },
    default: {
      bg: 'bg-gradient-to-br from-purple-50/90 via-violet-50/80 to-fuchsia-50/90',
      border: 'border-purple-200/50',
      text: 'text-purple-800',
      icon: <Info size={20} className="text-white" />,
      iconBg: 'bg-gradient-to-br from-purple-400 via-violet-500 to-fuchsia-500',
      progressBg: 'bg-gradient-to-r from-purple-400 to-fuchsia-500',
      shadow: 'shadow-xl shadow-purple-100/50',
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
        transform transition-all duration-500 ease-out
        ${isExiting ? 'opacity-0 scale-90 translate-y-4' : 'opacity-100 scale-100 translate-y-0'}
      `}
    >
      <div className={`
        ${config.bg} ${config.border} ${config.text}
        border rounded-2xl shadow-2xl ${config.shadow}
        p-5 flex items-start gap-4
        max-w-sm w-full backdrop-blur-xl
        relative overflow-hidden
        transition-all duration-300
      `}>
        {/* Progress Bar */}
        {duration > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5 overflow-hidden">
            <div 
              className={`h-full ${config.progressBg} shadow-lg`}
              style={{
                animation: `shrink ${duration}ms linear forwards`,
              }}
            />
          </div>
        )}

        {/* Icon with gradient background */}
        <div className={`${config.iconBg} p-3 rounded-xl flex-shrink-0 shadow-lg transform transition-transform duration-300 hover:scale-110`}>
          {config.icon}
        </div>

        {/* Content */}
        <div className="flex-grow pt-0.5">
          <p className="font-semibold text-sm leading-relaxed">{message}</p>
          {action && (
            <button
              onClick={action.onClick}
              className="text-xs font-bold mt-2.5 hover:underline opacity-80 hover:opacity-100 transition-opacity"
            >
              {action.label}
            </button>
          )}
        </div>

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 p-1.5 hover:bg-black hover:bg-opacity-10 rounded-xl transition-all duration-300 -mt-0.5 hover:rotate-90"
          aria-label="Close toast"
        >
          <X size={18} className="opacity-50 hover:opacity-100 transition-opacity" />
        </button>

        <style>{`
          @keyframes shrink {
            from {
              width: 100%;
            }
            to {
              width: 0%;
            }
          }
        `}</style>
      </div>
    </div>
  );
};

export default Toast;