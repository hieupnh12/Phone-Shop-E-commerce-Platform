import React from 'react';
import PropTypes from 'prop-types';

const TimelineStepper = ({
  events = [],
  orientation = 'vertical',
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: {
      circle: 'w-6 h-6',
      line: 'w-1',
      text: 'text-xs',
      title: 'text-sm',
    },
    md: {
      circle: 'w-8 h-8',
      line: 'w-1.5',
      text: 'text-sm',
      title: 'text-base',
    },
    lg: {
      circle: 'w-10 h-10',
      line: 'w-2',
      text: 'text-base',
      title: 'text-lg',
    },
  };

  const config = sizeClasses[size];
  const isVertical = orientation === 'vertical';

  return (
    <div className={`${className}`}>
      <div
        className={`
          flex ${isVertical ? 'flex-col' : 'flex-row items-start'}
          gap-4
        `}
      >
        {events.map((event, index) => (
          <div
            key={index}
            className={`
              flex ${isVertical ? 'flex-row gap-4' : 'flex-col gap-2'}
              ${!isVertical && index !== events.length - 1 ? 'flex-1' : ''}
            `}
          >
            {/* Timeline Content */}
            <div className={`flex flex-col items-center ${isVertical ? '' : 'w-full'}`}>
              {/* Circle */}
              <div
                className={`
                  ${config.circle} rounded-full flex items-center justify-center
                  flex-shrink-0 relative z-10
                  ${
                    event.status === 'completed'
                      ? 'bg-green-500 text-white'
                      : event.status === 'current'
                      ? 'bg-blue-500 text-white ring-4 ring-blue-200'
                      : event.status === 'failed'
                      ? 'bg-red-500 text-white'
                      : 'bg-gray-300 text-gray-600'
                  }
                  transition-all
                `}
              >
                {event.status === 'completed' && (
                  <svg className="w-1/2 h-1/2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {event.status === 'failed' && (
                  <svg className="w-1/2 h-1/2" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {event.icon && event.status !== 'completed' && event.status !== 'failed' && event.icon}
                {!event.icon && event.status !== 'completed' && event.status !== 'failed' && (
                  index + 1
                )}
              </div>

              {/* Connector Line */}
              {index < events.length - 1 && (
                <div
                  className={`
                    ${isVertical ? `${config.line} h-12` : `${config.line} w-full`}
                    my-1 rounded-full
                    ${
                      event.status === 'completed'
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }
                  `}
                />
              )}
            </div>

            {/* Event Details */}
            <div className={`flex-grow ${isVertical ? 'pb-4' : ''}`}>
              <div className="flex items-start justify-between">
                <div>
                  <h4 className={`font-semibold ${config.title} text-gray-900`}>
                    {event.title}
                  </h4>
                  {event.description && (
                    <p className={`${config.text} text-gray-600 mt-1`}>
                      {event.description}
                    </p>
                  )}
                </div>
                {event.timestamp && (
                  <span className={`${config.text} text-gray-500 flex-shrink-0 ml-2`}>
                    {event.timestamp}
                  </span>
                )}
              </div>

              {event.metadata && (
                <div className="mt-2 space-y-1">
                  {Object.entries(event.metadata).map(([key, value]) => (
                    <p key={key} className={`${config.text} text-gray-600`}>
                      <span className="font-medium">{key}:</span> {value}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

TimelineStepper.propTypes = {
  events: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      description: PropTypes.string,
      timestamp: PropTypes.string,
      icon: PropTypes.node,
      status: PropTypes.oneOf(['pending', 'current', 'completed', 'failed']),
      metadata: PropTypes.object,
    })
  ),
  orientation: PropTypes.oneOf(['vertical', 'horizontal']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  className: PropTypes.string,
};

export default TimelineStepper;
