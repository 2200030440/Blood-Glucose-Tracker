import React from 'react';
import { Outlet } from 'react-router-dom';
import { Heart, Activity, ShieldCheck, BarChart3 } from 'lucide-react';

export const AuthLayout = () => {
  return (
    <div className="min-h-screen bg-surface-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      {/* Background ambient glow */}
      <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-lavender/60 to-transparent pointer-events-none -z-10" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl bg-gradient-to-tr from-primary-deep to-primary text-white shadow-lg shadow-primary/30 mb-3">
          <Heart className="w-8 h-8 fill-white" />
        </div>
        <h1 className="text-3xl font-black text-content-primary tracking-tight">SWEETY</h1>
        <p className="text-sm font-medium text-content-secondary mt-1">
          "A healthier you starts with understanding."
        </p>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-lg px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-border shadow-card sm:shadow-card-hover transition-all">
          <Outlet />
        </div>

        {/* Feature badges below card */}
        <div className="mt-8 grid grid-cols-3 gap-3 text-center">
          <div className="p-3 rounded-2xl bg-white/60 border border-border/60">
            <Activity className="w-4 h-4 mx-auto text-primary mb-1" />
            <p className="text-[11px] font-semibold text-content-primary">4 Daily Slots</p>
            <p className="text-[10px] text-content-muted">Targeted fasting & meals</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/60 border border-border/60">
            <BarChart3 className="w-4 h-4 mx-auto text-primary mb-1" />
            <p className="text-[11px] font-semibold text-content-primary">Smart Reports</p>
            <p className="text-[10px] text-content-muted">Daily, MTD & monthly</p>
          </div>
          <div className="p-3 rounded-2xl bg-white/60 border border-border/60">
            <ShieldCheck className="w-4 h-4 mx-auto text-primary mb-1" />
            <p className="text-[11px] font-semibold text-content-primary">Private & Safe</p>
            <p className="text-[10px] text-content-muted">Strict user isolation</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;

