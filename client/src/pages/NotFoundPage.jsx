import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/ui/Button.jsx';
import { HeartCrack, Home } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-surface-background flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-lavender flex items-center justify-center text-primary-deep mb-6 shadow-md shadow-primary/10">
        <HeartCrack className="w-10 h-10" />
      </div>

      <span className="px-3 py-1 rounded-full bg-rose-50 text-health-danger font-bold text-xs border border-rose-200 mb-3">
        404 — Page Not Found
      </span>

      <h1 className="text-3xl sm:text-4xl font-black text-content-primary tracking-tight mb-2">
        Lost your way?
      </h1>
      <p className="text-sm text-content-secondary max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved to another URL.
      </p>

      <Link to="/dashboard">
        <Button variant="primary" size="lg" icon={Home}>
          Return to Dashboard
        </Button>
      </Link>
    </div>
  );
};

export default NotFoundPage;

