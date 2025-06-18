
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES_CONFIG } from '../../constants';
import Button from '../common/Button';
import { UserRole } from '../../types';

const HomeIcon: React.FC<{ className?: string }> = ({ className = "w-7 h-7" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
  </svg>
);

const LoginIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className={className}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
  </svg>
);


const Navbar: React.FC = () => {
  const { loggedInUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-primary shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-white p-1 rounded-md hover:bg-white/20 transition-colors" aria-label="Halaman Utama">
              <HomeIcon />
            </Link>
          </div>
          <div className="flex items-center space-x-3 sm:space-x-4">
            {loggedInUser ? (
              <>
                <span className="text-white text-sm sm:text-base">
                  Halo, {loggedInUser.name} ({ROLES_CONFIG[loggedInUser.role].name})
                </span>
                {loggedInUser.role === UserRole.ADMIN && (
                  <Link to={ROLES_CONFIG[UserRole.ADMIN].path} className="hidden sm:block text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Dashboard Admin</Link>
                )}
                 {loggedInUser.role === UserRole.SUPERVISOR && (
                  <Link to={ROLES_CONFIG[UserRole.SUPERVISOR].path} className="hidden sm:block text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Dashboard Spv.</Link>
                )}
                 {loggedInUser.role === UserRole.AGENT && (
                  <Link to={ROLES_CONFIG[UserRole.AGENT].path} className="hidden sm:block text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Dashboard Agent</Link>
                )}
                 {loggedInUser.role === UserRole.MANAGEMENT && (
                  <Link to={ROLES_CONFIG[UserRole.MANAGEMENT].path} className="hidden sm:block text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium">Dashboard Mgmt.</Link>
                )}
                <Button onClick={handleLogout} variant="secondary" size="sm" className="px-2 sm:px-3">
                  Keluar
                </Button>
              </>
            ) : (
              <>
                <Button 
                  onClick={() => navigate('/login')} 
                  variant="secondary" 
                  size="sm"
                  className="p-2" 
                  aria-label="Login"
                >
                  <LoginIcon className="w-5 h-5 text-white"/>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
