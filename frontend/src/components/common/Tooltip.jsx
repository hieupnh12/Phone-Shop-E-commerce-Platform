import React, { useState } from 'react';
import PropTypes from 'prop-types';

const Tooltip = ({
  content = '',
  children,
  position = 'top',
  delay = 0,
  className = '',
  disabled = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState(null);

  const handleMouseEnter = () => {
    if (disabled) return;
    const id = setTimeout(() => {
      setIsVisible(true);
    }, delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
    setIsVisible(false);
  };

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  };

  const arrowClasses = {
    top: 'top-full border-t-gray-800 border-r-transparent border-b-transparent border-l-transparent',
    bottom: 'bottom-full border-b-gray-800 border-r-transparent border-t-transparent border-l-transparent',
    left: 'left-full border-l-gray-800 border-t-transparent border-b-transparent border-r-transparent',
    right: 'right-full border-r-gray-800 border-t-transparent border-b-transparent border-l-transparent',
  };

  const arrowPositionClasses = {
    top: 'left-1/2 -translate-x-1/2',
    bottom: 'left-1/2 -translate-x-1/2',
    left: 'top-1/2 -translate-y-1/2',
    right: 'top-1/2 -translate-y-1/2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {isVisible && content && (
        <div
          className={`
            absolute z-50 px-3 py-2 text-sm font-medium text-white
            bg-gray-800 rounded-lg whitespace-nowrap pointer-events-none
            transition-opacity duration-200 opacity-100
            ${positionClasses[position]}
            ${className}
          `}
        >
          {content}
          <div
            className={`
              absolute w-0 h-0 border-4
              ${arrowClasses[position]} ${arrowPositionClasses[position]}
            `}
          />
        </div>
      )}
    </div>
  );
};

Tooltip.propTypes = {
  content: PropTypes.string,
  children: PropTypes.node.isRequired,
  position: PropTypes.oneOf(['top', 'bottom', 'left', 'right']),
  delay: PropTypes.number,
  className: PropTypes.string,
  disabled: PropTypes.bool,
};

export default Tooltip;
