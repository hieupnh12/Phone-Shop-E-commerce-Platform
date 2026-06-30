import React from 'react';
import PropTypes from 'prop-types';

const ProgressStepper = ({
  steps = [],
  currentStep = 0,
  orientation = 'vertical',
  showLabels = true,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: {
      circle: 'w-8 h-8',
      line: 'h-1',
      text: 'text-xs',
    },
    md: {
      circle: 'w-10 h-10',
      line: 'h-2',
      text: 'text-sm',
    },
    lg: {
      circle: 'w-12 h-12',
      line: 'h-3',
      text: 'text-base',
    },
  };

  const config = sizeClasses[size];

  const isVertical = orientation === 'vertical';

  return (
    <div
      className={`
        flex ${isVertical ? 'flex-col' : 'flex-row items-center'}
        gap-4 ${className}
      `}
    >
      {steps.map((step, index) => (
        <React.Fragment key={index}>
          <div className="flex flex-col items-center">
            {/* Step Circle */}
            <div
              className={`
                ${config.circle} rounded-full flex items-center justify-center
                font-semibold text-white transition-all
                ${
                  index < currentStep
                    ? 'bg-green-600'
                    : index === currentStep
                    ? 'bg-blue-600 ring-4 ring-blue-200'
                    : 'bg-gray-300'
                }
              `}
            >
              {index < currentStep ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                index + 1
              )}
            </div>

            {/* Label */}
            {showLabels && (
              <p
                className={`
                  mt-2 font-medium text-center max-w-xs
                  ${config.text}
                  ${
                    index === currentStep
                      ? 'text-blue-600'
                      : index < currentStep
                      ? 'text-green-600'
                      : 'text-gray-600'
                  }
                `}
              >
                {step.label}
              </p>
            )}

            {/* Description */}
            {step.description && (
              <p className="text-xs text-gray-500 text-center mt-1 max-w-xs">
                {step.description}
              </p>
            )}
          </div>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div
              className={`
                ${isVertical ? 'w-1 my-2' : `${config.line} flex-grow mx-2`}
                ${
                  index < currentStep
                    ? 'bg-green-600'
                    : 'bg-gray-300'
                }
                transition-colors
              `}
              style={
                isVertical
                  ? { height: '24px' }
                  : undefined
              }
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

ProgressStepper.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      description: PropTypes.string,
    })
  ),
  currentStep: PropTypes.number,
  orientation: PropTypes.oneOf(['vertical', 'horizontal']),
  showLabels: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default ProgressStepper;
