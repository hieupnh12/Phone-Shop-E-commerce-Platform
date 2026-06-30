import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Button from '../Button';

const FormStepper = ({
  steps = [],
  onStepChange,
  onComplete,
  children,
  className = '',
  showStepNumbers = true,
  canSkip = false,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps([...new Set([...completedSteps, currentStep])]);
      setCurrentStep(currentStep + 1);
      onStepChange?.(currentStep + 1);
    } else {
      onComplete?.();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      onStepChange?.(currentStep - 1);
    }
  };

  const handleStepClick = (index) => {
    if (canSkip || completedSteps.includes(index) || index <= currentStep) {
      setCurrentStep(index);
      onStepChange?.(index);
    }
  };

  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;
  const isStepCompleted = (index) => completedSteps.includes(index);

  return (
    <div className={`${className}`}>
      {/* Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              {/* Step Circle */}
              <button
                onClick={() => handleStepClick(index)}
                disabled={!canSkip && !isStepCompleted(index) && index > currentStep}
                className={`
                  flex items-center justify-center w-12 h-12 rounded-full font-semibold transition-all
                  disabled:cursor-not-allowed
                  ${
                    index === currentStep
                      ? 'bg-blue-600 text-white ring-4 ring-blue-200'
                      : isStepCompleted(index)
                      ? 'bg-green-600 text-white'
                      : index < currentStep
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }
                `}
              >
                {showStepNumbers && (
                  isStepCompleted(index) || index < currentStep ? (
                    <svg
                      className="w-6 h-6"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    index + 1
                  )
                )}
              </button>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-grow h-1 mx-2 rounded transition-colors
                    ${
                      index < currentStep || isStepCompleted(index)
                        ? 'bg-green-600'
                        : 'bg-gray-200'
                    }
                  `}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Step Titles */}
        <div className="flex gap-0 mt-4">
          {steps.map((step, index) => (
            <div key={index} className="flex-1 px-1">
              <p
                className={`text-xs font-medium text-center ${
                  index === currentStep
                    ? 'text-blue-600'
                    : 'text-gray-600'
                }`}
              >
                {step.label}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg p-6 border border-gray-200 min-h-96">
        {typeof children === 'function'
          ? children(currentStep, steps[currentStep])
          : children}
      </div>

      {/* Actions */}
      <div className="flex gap-3 mt-8 justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep}
        >
          Previous
        </Button>

        <div className="flex gap-3">
          {isLastStep && (
            <Button
              variant="success"
              onClick={onComplete}
            >
              Complete
            </Button>
          )}
          <Button
            variant="primary"
            onClick={handleNext}
          >
            {isLastStep ? 'Finish' : 'Next'}
          </Button>
        </div>
      </div>
    </div>
  );
};

FormStepper.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      content: PropTypes.node,
    })
  ),
  onStepChange: PropTypes.func,
  onComplete: PropTypes.func,
  children: PropTypes.oneOfType([PropTypes.node, PropTypes.func]),
  className: PropTypes.string,
  showStepNumbers: PropTypes.bool,
  canSkip: PropTypes.bool,
};

export default FormStepper;
