import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export const Input = React.forwardRef(
  ({ label, error, helperText, type = 'text', icon: Icon, className = '', id, showPasswordToggle = false, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
    const isPassword = type === 'password';
    const computedType = isPassword && showPassword ? 'text' : type;

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-semibold uppercase tracking-wider text-content-secondary">
            {label}
          </label>
        )}
        <div className="relative rounded-xl shadow-sm">
          {Icon && (
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-content-muted">
              <Icon className="w-4 h-4" />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            type={computedType}
            className={`w-full bg-white border rounded-xl py-2.5 px-3.5 text-sm text-content-primary placeholder:text-content-muted transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:bg-surface-subtle disabled:cursor-not-allowed ${
              Icon ? 'pl-10' : ''
            } ${isPassword || showPasswordToggle ? 'pr-10' : ''} ${
              error ? 'border-health-danger focus:border-health-danger focus:ring-health-danger/20' : 'border-border'
            } ${className}`}
            {...props}
          />
          {(isPassword || showPasswordToggle) && (
            <button
              type="button"
              tabIndex={-1}
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-content-muted hover:text-content-primary transition-colors focus:outline-none"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          )}
        </div>
        {error ? (
          <p className="text-xs font-medium text-health-danger mt-1 animate-fadeIn">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-content-muted mt-1">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
export default Input;
