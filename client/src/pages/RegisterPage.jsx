import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import Button from '../components/ui/Button.jsx';
import Input from '../components/ui/Input.jsx';
import { User, Mail, Lock, CheckCircle2, Circle } from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Password rules validation
  const rules = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
  };

  const validate = () => {
    const newErrors = {};

    if (!name.trim()) {
      newErrors.name = 'Please enter your full name.';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters long.';
    }

    if (!email.trim()) {
      newErrors.email = 'Please enter your email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Please enter a password.';
    } else if (!rules.length || !rules.uppercase || !rules.lowercase || !rules.number) {
      newErrors.password = 'Please meet all password strength requirements.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsLoading(true);
    try {
      await register({
        name,
        email,
        password,
        confirmPassword,
      });
      navigate('/dashboard');
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        form: err.friendlyMessage || 'Registration failed. Please check your information.',
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-extrabold text-content-primary tracking-tight">Create your account</h2>
        <p className="text-xs text-content-secondary mt-1">
          Start logging your blood glucose and discovering vital health trends
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-4">
        {errors.form && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-health-danger">
            {errors.form}
          </div>
        )}

        <Input
          label="Full Name"
          type="text"
          placeholder="e.g. Jane Doe"
          icon={User}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (errors.name) setErrors((prev) => ({ ...prev, name: null }));
          }}
          error={errors.name}
          autoComplete="name"
        />

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
          autoComplete="new-password"
        />

        {/* Password Strength Checklist */}
        <div className="p-3 rounded-2xl bg-surface-subtle/70 border border-border/80 space-y-1.5 text-xs text-content-secondary">
          <p className="font-semibold text-content-primary text-[11px] uppercase tracking-wider mb-1">
            Password Requirements
          </p>
          <div className="grid grid-cols-2 gap-1.5 text-[11px]">
            <span className={`flex items-center gap-1.5 ${rules.length ? 'text-health-success font-medium' : ''}`}>
              {rules.length ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
              At least 8 characters
            </span>
            <span className={`flex items-center gap-1.5 ${rules.uppercase ? 'text-health-success font-medium' : ''}`}>
              {rules.uppercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
              One uppercase letter
            </span>
            <span className={`flex items-center gap-1.5 ${rules.lowercase ? 'text-health-success font-medium' : ''}`}>
              {rules.lowercase ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
              One lowercase letter
            </span>
            <span className={`flex items-center gap-1.5 ${rules.number ? 'text-health-success font-medium' : ''}`}>
              {rules.number ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Circle className="w-3.5 h-3.5" />}
              One number
            </span>
          </div>
        </div>

        <Input
          label="Confirm Password"
          type="password"
          placeholder="••••••••"
          icon={Lock}
          showPasswordToggle
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errors.confirmPassword) setErrors((prev) => ({ ...prev, confirmPassword: null }));
          }}
          error={errors.confirmPassword}
          autoComplete="new-password"
        />

        <Button type="submit" variant="primary" size="lg" className="w-full mt-2" isLoading={isLoading}>
          Create Account
        </Button>
      </form>

      <div className="mt-6 text-center text-xs text-content-secondary">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-primary hover:text-primary-deep transition-colors">
          Sign in
        </Link>
      </div>
    </div>
  );
};

export default RegisterPage;
