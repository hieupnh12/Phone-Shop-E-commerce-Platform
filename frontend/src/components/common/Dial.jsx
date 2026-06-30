import React, { useState } from 'react';
import PropTypes from 'prop-types';

const Dial = ({
  value = 5,
  min = 1,
  max = 10,
  step = 1,
  onChange,
  label = '',
  unit = '',
  size = 'md',
  disabled = false,
  showValue = true,
  className = '',
}) => {
  const [isRotating, setIsRotating] = useState(false);
  const [startAngle, setStartAngle] = useState(0);

  const sizeClasses = {
    sm: 'w-24 h-24',
    md: 'w-32 h-32',
    lg: 'w-40 h-40',
  };

  const handleMouseDown = (e) => {
    if (disabled) return;
    setIsRotating(true);
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const angle = Math.atan2(e.clientY - (rect.top + centerY), e.clientX - (rect.left + centerX));
    setStartAngle(angle);
  };

  const handleMouseMove = (e) => {
    if (!isRotating || disabled) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const currentAngle = Math.atan2(e.clientY - (rect.top + centerY), e.clientX - (rect.left + centerX));
    
    const angleDiff = currentAngle - startAngle;
    const range = max - min;
    const increment = (angleDiff / (Math.PI * 2)) * range;
    
    let newValue = value + increment;
    newValue = Math.round(newValue / step) * step;
    newValue = Math.max(min, Math.min(max, newValue));

    if (onChange && newValue !== value) {
      onChange(newValue);
      setStartAngle(currentAngle);
    }
  };

  const handleMouseUp = () => {
    setIsRotating(false);
  };

  const percentage = ((value - min) / (max - min)) * 100;
  const rotation = (percentage / 100) * 360;

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}

      <div
        className={`${sizeClasses[size]} relative cursor-grab active:cursor-grabbing transition-transform ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* Outer circle */}
        <svg className="w-full h-full" viewBox="0 0 200 200">
          <circle cx="100" cy="100" r="95" fill="none" stroke="#e5e7eb" strokeWidth="2" />
          <circle cx="100" cy="100" r="90" fill="none" stroke="#f3f4f6" strokeWidth="8" />

          {/* Progress arc */}
          <circle
            cx="100"
            cy="100"
            r="90"
            fill="none"
            stroke="#3b82f6"
            strokeWidth="8"
            strokeDasharray={`${(percentage / 100) * 2 * Math.PI * 90} ${2 * Math.PI * 90}`}
            strokeLinecap="round"
            style={{ transform: 'rotate(-90deg)', transformOrigin: '100px 100px' }}
          />

          {/* Markers */}
          {[...Array(Math.min(10, max - min + 1))].map((_, i) => {
            const markerAngle = (i / Math.min(9, max - min)) * 360 - 90;
            const markerX = 100 + 85 * Math.cos((markerAngle * Math.PI) / 180);
            const markerY = 100 + 85 * Math.sin((markerAngle * Math.PI) / 180);
            return (
              <circle
                key={i}
                cx={markerX}
                cy={markerY}
                r="3"
                fill="#9ca3af"
              />
            );
          })}
        </svg>

        {/* Center circle */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 bg-white rounded-full shadow-lg border-2 border-gray-200 flex items-center justify-center">
            <div className="text-center">
              {showValue && (
                <>
                  <div className="text-2xl font-bold text-gray-900">{value}</div>
                  {unit && <div className="text-xs text-gray-500">{unit}</div>}
                </>
              )}
            </div>
          </div>

          {/* Indicator needle */}
          <div
            className="absolute w-1 h-12 bg-blue-600 rounded-full origin-bottom"
            style={{
              bottom: '50%',
              transform: `rotate(${rotation}deg)`,
              transition: isRotating ? 'none' : 'transform 0.2s ease-out',
            }}
          />
        </div>
      </div>

      {/* Range display */}
      <div className="text-xs text-gray-500 text-center">
        {min} - {max}
      </div>
    </div>
  );
};

Dial.propTypes = {
  value: PropTypes.number,
  min: PropTypes.number,
  max: PropTypes.number,
  step: PropTypes.number,
  onChange: PropTypes.func,
  label: PropTypes.string,
  unit: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  disabled: PropTypes.bool,
  showValue: PropTypes.bool,
  className: PropTypes.string,
};

export default Dial;
