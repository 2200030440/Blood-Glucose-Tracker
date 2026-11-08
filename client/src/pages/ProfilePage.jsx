import React from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import { User, Mail, Shield, LogOut, Heart, CheckCircle2, Lock } from 'lucide-react';

export const ProfilePage = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="max-w-4xl space-y-6 animate-fadeIn">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-content-primary tracking-tight">
          Profile & Account
        </h1>
        <p className="text-sm text-content-secondary mt-1">
          Manage your credentials, security settings, and session status
        </p>
      </div>

      {/* Account Info Card */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-border/60">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-3xl bg-primary-light text-primary-deep font-black flex items-center justify-center text-xl shadow-sm border border-primary/20">
              {user?.name ? user.name[0].toUpperCase() : 'U'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-content-primary">{user?.name}</h2>
                <Badge variant="primary" size="sm">Active Member</Badge>
              </div>
              <p className="text-xs text-content-secondary mt-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" />
                {user?.email}
              </p>
            </div>
          </div>

          <Button onClick={handleLogout} variant="outline" size="sm" icon={LogOut} className="text-health-danger hover:bg-rose-50 border-rose-200">
            Sign Out
          </Button>
        </div>

        <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-surface-subtle/70 border border-border/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-content-secondary">
              User ID
            </span>
            <p className="font-mono text-xs font-semibold text-content-primary mt-1 break-all">
              {user?.id}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-surface-subtle/70 border border-border/80">
            <span className="text-[11px] font-bold uppercase tracking-wider text-content-secondary">
              Session Authentication
            </span>
            <p className="text-xs font-semibold text-content-primary mt-1 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-health-success" />
              Secure HTTP-Only Cookie (JWT)
            </p>
          </div>
        </div>
      </Card>

      {/* Security & Health Standards Card */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-lavender text-primary-deep">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <CardTitle>Medical Data Privacy & Security Protocol</CardTitle>
            <p className="text-xs text-content-secondary">How SWEETY safeguards your personal glycemic logs</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs text-content-secondary">
          <div className="p-3.5 rounded-2xl border border-border/70 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-health-success shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-content-primary">Strict User Isolation</p>
              <p className="text-[11px] text-content-muted mt-0.5">
                Every reading query is strictly constrained to your user ID on the PostgreSQL layer.
              </p>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl border border-border/70 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-health-success shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-content-primary">Bcrypt Hash Encryption</p>
              <p className="text-[11px] text-content-muted mt-0.5">
                Passwords are never stored in plain text and pass through 12 salt rounds.
              </p>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl border border-border/70 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-health-success shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-content-primary">Calendar Date Preservation</p>
              <p className="text-[11px] text-content-muted mt-0.5">
                Date-only string storage ensures no timezone drift or UTC accidental shifts.
              </p>
            </div>
          </div>
          <div className="p-3.5 rounded-2xl border border-border/70 flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-health-success shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-content-primary">Atomic Concurrency Guard</p>
              <p className="text-[11px] text-content-muted mt-0.5">
                Transactions protect against race conditions to enforce max 4 readings per day.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ProfilePage;

