import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ROLES_CONFIG, INITIAL_APP_CONTENT_CONFIG } from '../../constants';
import Input from '../common/Input';
import Button from '../common/Button';
import Alert from '../common/Alert';
import { UserRole } from '../../types';

const LoginForm: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const TEXTS = INITIAL_APP_CONTENT_CONFIG.formTexts;

  // Clear error when component mounts or when error changes
  useEffect(() => {
    if (error) {
      clearError();
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    
    try {
      const user = await login(username, password);
      if (user) {
        // Redirect based on role
        const rolePath = ROLES_CONFIG[user.role]?.path || '/';
        navigate(rolePath);
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-light-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-dark-text">
            {TEXTS.loginTitle}
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <Alert type="error" message={error} onClose={clearError} />}
          <Input
            id="username"
            name="username"
            type="text"
            label={TEXTS.usernameLabel}
            autoComplete="username"
            required
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder={TEXTS.usernameLabel}
          />
          <Input
            id="password"
            name="password"
            type="password"
            label={TEXTS.passwordLabel}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={TEXTS.passwordLabel}
          />
          <div>
            <Button type="submit" variant="primary" className="w-full" isLoading={isLoading}>
              {TEXTS.loginButton}
            </Button>
          </div>
        </form>
        {/* Removed alternative links for staff login */}
      </div>
    </div>
  );
};

export default LoginForm;
