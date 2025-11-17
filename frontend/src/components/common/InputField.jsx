import React from 'react';
import PropTypes from 'prop-types';
import { AlertCircle, Eye, EyeOff } from 'lucide-react';

const InputField = React.forwardRef(({
  label,
  type = 'text',
  placeholder = '',
  error = '',
  disabled = false,
  icon: Icon = null,
  required = false,
  helperText = '',
  size = 'md',
  variant = 'outlined',
  className = '',
  showPasswordToggle = false,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg',
  };

  const variantClasses = {
    outlined: 'border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200',
    filled: 'bg-gray-100 border-b-2 border-gray-300 focus:bg-gray-50 focus:border-blue-500',
    flushed: 'border-b-2 border-gray-300 focus:border-blue-500 rounded-0',
  };

  const displayType = showPassword ? 'text' : type;

  const classes = `
    w-full ${sizeClasses[size]} ${variantClasses[variant]}
    rounded-lg transition-all duration-200
    focus:outline-none
    ${Icon ? 'pl-10' : ''}
    ${showPasswordToggle && type === 'password' ? 'pr-10' : ''}
    ${error ? 'border-red-500 focus:ring-red-200' : ''}
    ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed opacity-60' : ''}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon size={18} className={error ? 'text-red-500' : 'text-gray-400'} />
          </div>
        )}

        <input
          ref={ref}
          type={displayType}
          placeholder={placeholder}
          disabled={disabled}
          className={classes}
          {...props}
        />

        {showPasswordToggle && type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
            tabIndex="-1"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>

      {error && (
        <div className="mt-1.5 flex items-center gap-1.5 text-sm text-red-500">
          <AlertCircle size={16} />
          {error}
        </div>
      )}

      {helperText && !error && (
        <p className="mt-1.5 text-xs text-gray-500">{helperText}</p>
      )}
    </div>
  );
});

InputField.displayName = 'InputField';

InputField.propTypes = {
  label: PropTypes.string,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  disabled: PropTypes.bool,
  icon: PropTypes.elementType,
  required: PropTypes.bool,
  helperText: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['outlined', 'filled', 'flushed']),
  className: PropTypes.string,
  showPasswordToggle: PropTypes.bool,
};

export default InputField;
