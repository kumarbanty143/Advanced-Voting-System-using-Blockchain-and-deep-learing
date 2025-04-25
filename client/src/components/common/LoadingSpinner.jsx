// client/src/components/common/LoadingSpinner.jsx
import React from 'react';

const LoadingSpinner = ({ size = "medium", fullScreen = false }) => {
  const sizeClasses = {
    small: "h-5 w-5 border-2",
    medium: "h-10 w-10 border-3",
    large: "h-16 w-16 border-4"
  };
  
  const spinner = (
    <div className={`animate-spin rounded-full border-t-transparent border-blue-600 ${sizeClasses[size]}`}></div>
  );
  
  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-75 z-50">
        {spinner}
      </div>
    );
  }
  
  return (
    <div className="flex justify-center items-center py-6">
      {spinner}
    </div>
  );
};

export default LoadingSpinner;