import React from 'react';
import PropTypes from 'prop-types';

const Loading = ({ type = 'spinner', size = 'md', message = 'Loading...', fullScreen = false }) => {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const spinnerContent = (
    <div className={`${sizeClasses[size]} relative`}>
      <div className="absolute inset-0 rounded-full border-4 border-gray-200" />
      <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-blue-500 border-r-blue-500 animate-spin" />
    </div>
  );

  const skeletonContent = (
    <div className="space-y-3 w-full max-w-xs">
      <div className="h-4 bg-gray-200 rounded animate-pulse" />
      <div className="h-4 bg-gray-200 rounded animate-pulse w-5/6" />
      <div className="h-4 bg-gray-200 rounded animate-pulse w-4/6" />
    </div>
  );

  const dotsContent = (
    <div className={`${sizeClasses[size]} flex items-center justify-center gap-1`}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
          style={{
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );

  const content = {
    spinner: spinnerContent,
    skeleton: skeletonContent,
    dots: dotsContent,
  }[type] || spinnerContent;

  const loadingComponent = (
    <div className="flex flex-col items-center justify-center gap-4">
      {content}
      {message && (
        <p className={`${textSizeClasses[size]} text-gray-600 font-medium`}>
          {message}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-900/90 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-gray-800/50">
          {loadingComponent}
        </div>
      </div>
    );
  }

  return loadingComponent;
};

Loading.propTypes = {
  type: PropTypes.oneOf(['spinner', 'skeleton', 'dots']),
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  message: PropTypes.string,
  fullScreen: PropTypes.bool,
};

export default Loading;
