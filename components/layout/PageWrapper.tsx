import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';
import Alert from '../common/Alert';

interface PageWrapperProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode; // For buttons like "Add New", "Refresh"
  allowedRoles?: UserRole[];
}

const PageWrapper: React.FC<PageWrapperProps> = ({ title, description, children, actions, allowedRoles }) => {
  const { loggedInUser, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p>Memuat...</p>
      </div>
    );
  }

  if (allowedRoles && (!loggedInUser || !allowedRoles.includes(loggedInUser.role as UserRole))) {
    return (
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        <Alert type="error" message="Anda tidak memiliki izin untuk melihat halaman ini." />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <div>
          {title && <h1 className="text-2xl sm:text-3xl font-bold text-dark-text">{title}</h1>}
          {description && <p className="text-gray-500 mt-1">{description}</p>}
        </div>
        {actions && <div className="flex space-x-2 mt-4 sm:mt-0">{actions}</div>}
      </div>
      <div className="bg-white shadow-lg rounded-lg p-6">
        {children}
      </div>
    </div>
  );
};

export default PageWrapper;
