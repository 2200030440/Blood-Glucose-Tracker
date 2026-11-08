import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import { Mail, Lock, Sparkles } from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const fillDemoCredentials = () => {
    setEmail('demo@sweety.app');
    setPassword('SweetyDemo@123');
    setErrors({});
  };

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Please enter your password.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        form: err.friendlyMessage || 'Invalid email or password.',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-extrabold text-content-primary tracking-tight">Sign in to Sweety</h2>
        <p className="text-xs text-content-secondary mt-1">
          Access your personal glucose log and analytics dashboard
        </p>
      </div>

      {/* 1-Click Demo Fill Banner */}
      <div className="mb-6 p-3.5 rounded-2xl bg-lavender/60 border border-primary/20 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-primary shrink-0" />
          <div className="text-left">
            <p className="text-xs font-bold text-primary-deep">Kenpath Hiring Reviewer?</p>
            <p className="text-[11px] text-content-secondary">Click to auto-fill sample demo account</p>
          </div>
        </div>
        <button
          type="button"
          onClick={fillDemoCredentials}
          className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-deep transition-colors shrink-0"
        >
          Fill Demo
        </button>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {errors.form && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-health-danger">
            {errors.form}
          </div>
        )}

        <Input
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          icon={Mail}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (errors.email) setErrors((prev) => ({ ...prev, email: null }));
          }}
          error={errors.email}
          autoComplete="email"
        />

        <Input
          label="Password"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          showPasswordToggle
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            if (errors.password) setErrors((prev) => ({ ...prev, password: null }));
          }}
          error={errors.password}
          autoComplete="current-password"
        />

        <Button type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={isLoading}>
          Sign In
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-content-secondary">
        Don't have an account yet?{' '}
        <Link to="/register" className="font-bold text-primary hover:text-primary-deep transition-colors">
          Create account
        </Link>
      </div>
    </div>
  );
};

export default LoginPage;
