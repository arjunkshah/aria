import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ size = 'md', className = '' }) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Icon */}
      <div className={`relative ${sizeClasses[size]}`}>
        {/* Blue square background */}
        <div className="w-full h-full bg-blue-600 rounded-lg flex items-center justify-center">
          {/* White document */}
          <div className="w-3/4 h-3/4 bg-white rounded-sm relative">
            {/* Document lines */}
            <div className="absolute top-1 left-1 right-1 space-y-0.5">
              <div className="h-0.5 bg-gray-400 rounded"></div>
              <div className="h-0.5 bg-gray-400 rounded w-3/4"></div>
              <div className="h-0.5 bg-gray-400 rounded w-1/2"></div>
            </div>
            
            {/* Green paper airplane */}
            <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-green-500 rounded-sm transform rotate-45 border border-white"></div>
          </div>
        </div>
      </div>
      
      {/* Text */}
      <div className="flex flex-col">
        <span className="font-bold text-text-strong text-lg">Aria</span>
        <span className="text-xs text-text-secondary">Automated changelog writer</span>
      </div>
    </div>
  );
};

export default Logo; 