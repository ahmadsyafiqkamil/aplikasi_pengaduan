
import React from 'react';

interface PageWrapperProps {
  title?: string;
  children: React.ReactNode;
  actions?: React.ReactNode; // For buttons like "Add New", "Refresh"
}

const PageWrapper: React.FC<PageWrapperProps> = ({ title, children, actions }) => {
  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      {title && (
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-dark-text mb-4 sm:mb-0">{title}</h1>
          {actions && <div className="flex space-x-2">{actions}</div>}
        </div>
      )}
      <div className="bg-white shadow-lg rounded-lg p-6">
        {children}
      </div>
    </div>
  );
};

export default PageWrapper;
