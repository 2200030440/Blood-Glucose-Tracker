import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useOutletContext } from 'react-router-dom';
import reportService from '../services/reportService.js';
import readingService from '../services/readingService.js';
import { getTodayString, formatDisplayDate, getSlotBadgeColor, getGlucoseStatus } from '../utils/dateUtils.js';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import Badge from '../components/ui/Badge.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import AddEditReadingModal from '../features/readings/AddEditReadingModal.jsx';
import { CardSkeleton, TableSkeleton } from '../components/ui/LoadingSkeleton.jsx';
import { toast } from 'sonner';

import {
  Activity,
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Clock,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
  ChevronRight,
  Info,
} from 'lucide-react';

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';

const SLOTS = [
  'Morning (Fasting)',
  'After breakfast',
  'After lunch',
  'After dinner',
];

export const DashboardPage = () => {
  const { user } = useAuth();
  const { openAddModal } = useOutletContext() || {};

  const todayStr = getTodayString();
  const [selectedDate, setSelectedDate] = useState(todayStr);

  const [dailyData, setDailyData] = useState(null);
  const [monthData, setMonthData] = useState(null);
  const [recentReadings, setRecentReadings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [editReadingData, setEditReadingData] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [prefilledSlot, setPrefilledSlot] = useState(null);

  // Delete confirmation
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [dailyRes, monthRes, recentRes] = await Promise.all([
        reportService.getDailyReport(selectedDate),
        reportService.getMonthToDateReport(selectedDate),
        readingService.getReadings({ limit: 10 }),
      ]);

      setDailyData(dailyRes.data);
      setMonthData(monthRes.data);
      setRecentReadings(recentRes.data?.readings || []);
    } catch (err) {
      toast.error('Failed to load dashboard metrics.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchDashboardData();

    // Listen to global reading events (from header Add button)
    const handleRefresh = () => fetchDashboardData();
    window.addEventListener('sweety:reading-created', handleRefresh);
    return () => window.removeEventListener('sweety:reading-created', handleRefresh);
  }, [fetchDashboardData]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await readingService.deleteReading(deleteId);
      toast.success('Reading deleted successfully.');
      setDeleteId(null);
      fetchDashboardData();
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to delete reading.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenAddForSlot = (slotName) => {
    setPrefilledSlot(slotName);
    setEditReadingData(null);
    setIsAddModalOpen(true);
  };

  const handleEdit = (reading) => {
    setEditReadingData(reading);
    setIsAddModalOpen(true);
  };

  // Map daily readings to 4 slots
  const slotMap = {};
  if (dailyData?.readings) {
    dailyData.readings.forEach((r) => {
      slotMap[r.slot] = r;
    });
  }

  // Format Recharts data
  const chartData = monthData?.trend?.map((item) => ({
    date: item.date.slice(5), // 'MM-DD'
    fullDate: item.date,
    average: item.average,
    highest: item.highest,
    lowest: item.lowest,
  })) || [];

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-primary-deep via-primary to-[#8A79F5] p-6 sm:p-8 text-white shadow-xl shadow-primary/20">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/20 via-white/5 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 text-white text-xs font-semibold backdrop-blur-md">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Personalized Glycemic Tracker</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Welcome back, {user?.name || 'Friend'}!
            </h1>
            <p className="text-sm text-lavender/90 font-normal leading-relaxed">
              "Every reading brings you one step closer to understanding your health."
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-2xl px-3.5 py-2 border border-white/20 text-xs">
              <Calendar className="w-4 h-4 text-white" />
              <input
                type="date"
                max={todayStr}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-transparent text-white font-medium focus:outline-none cursor-pointer"
              />
            </div>
            <Button
              onClick={() => {
                setPrefilledSlot(null);
                setEditReadingData(null);
                setIsAddModalOpen(true);
              }}
              variant="secondary"
              size="md"
              icon={Plus}
              className="bg-white text-primary-deep hover:bg-lavender shadow-md"
            >
              Add Reading
            </Button>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {isLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            {/* Card 1: Today's Readings Count */}
            <Card hoverEffect className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-content-secondary">
                  Daily Progress
                </span>
                <div className="w-9 h-9 rounded-xl bg-lavender text-primary-deep flex items-center justify-center">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-content-primary">
                  {dailyData?.count ?? 0}
                </span>
                <span className="text-xs font-semibold text-content-secondary">/ 4 slots</span>
              </div>
              <div className="mt-3 w-full bg-surface-subtle rounded-full h-2 overflow-hidden">
                <div
                  className="bg-primary h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, ((dailyData?.count || 0) / 4) * 100)}%` }}
                />
              </div>
              <p className="text-[11px] text-content-secondary mt-2">
                {dailyData?.count === 4
                  ? 'All 4 daily slots recorded'
                  : `${4 - (dailyData?.count || 0)} slots remaining today`}
              </p>
            </Card>

            {/* Card 2: Average Glucose */}
            <Card hoverEffect className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-content-secondary">
                  Average Glucose
                </span>
                <div className="w-9 h-9 rounded-xl bg-purple-50 text-primary-deep flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-content-primary">
                  {dailyData?.average !== null && dailyData?.average !== undefined
                    ? dailyData.average
                    : '—'}
                </span>
                {dailyData?.average !== null && dailyData?.average !== undefined && (
                  <span className="text-xs font-semibold text-content-secondary">mg/dL</span>
                )}
              </div>
              <div className="mt-2">
                {dailyData?.average !== null && dailyData?.average !== undefined ? (
                  <Badge variant={dailyData.average <= 140 ? 'success' : 'warning'} size="sm">
                    {dailyData.average <= 140 ? 'In target range' : 'Above target'}
                  </Badge>
                ) : (
                  <p className="text-[11px] text-content-muted">No measurements yet</p>
                )}
              </div>
            </Card>

            {/* Card 3: Highest Reading */}
            <Card hoverEffect className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-content-secondary">
                  Highest Reading
                </span>
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-health-danger flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-content-primary">
                  {dailyData?.highest !== null && dailyData?.highest !== undefined
                    ? dailyData.highest
                    : '—'}
                </span>
                {dailyData?.highest !== null && dailyData?.highest !== undefined && (
                  <span className="text-xs font-semibold text-content-secondary">mg/dL</span>
                )}
              </div>
              <p className="text-[11px] text-content-secondary mt-2">
                {dailyData?.highest !== null && dailyData?.highest !== undefined
                  ? 'Peak value recorded'
                  : 'Awaiting readings'}
              </p>
            </Card>

            {/* Card 4: Lowest Reading */}
            <Card hoverEffect className="p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-content-secondary">
                  Lowest Reading
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-health-success flex items-center justify-center">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-content-primary">
                  {dailyData?.lowest !== null && dailyData?.lowest !== undefined
                    ? dailyData.lowest
                    : '—'}
                </span>
                {dailyData?.lowest !== null && dailyData?.lowest !== undefined && (
                  <span className="text-xs font-semibold text-content-secondary">mg/dL</span>
                )}
              </div>
              <p className="text-[11px] text-content-secondary mt-2">
                {dailyData?.lowest !== null && dailyData?.lowest !== undefined
                  ? 'Minimum value recorded'
                  : 'Awaiting readings'}
              </p>
            </Card>
          </>
        )}
      </div>

      {/* Today's Reading Timeline (4 Slots) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-content-primary tracking-tight">
              Daily Slot Timeline
            </h2>
            <p className="text-xs text-content-secondary">
              Strict protocol: 4 scheduled meal & fasting measurements for {formatDisplayDate(selectedDate)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {SLOTS.map((slotName) => {
            const reading = slotMap[slotName];
            const status = reading ? getGlucoseStatus(reading.value) : null;

            return (
              <Card
                key={slotName}
                hoverEffect
                className={`p-5 transition-all flex flex-col justify-between ${
                  reading ? 'border-primary/20 bg-white' : 'border-dashed border-border/80 bg-surface-subtle/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-content-primary tracking-tight">
                      {slotName}
                    </span>
                    {reading && status && (
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${status.bgColor} ${status.color} border ${status.borderColor}`}>
                        {status.label}
                      </span>
                    )}
                  </div>

                  {reading ? (
                    <div className="my-2">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-black text-content-primary">
                          {reading.value}
                        </span>
                        <span className="text-xs font-semibold text-content-secondary">mg/dL</span>
                      </div>
                      <p className="text-[11px] text-content-muted mt-1">{status.description}</p>
                    </div>
                  ) : (
                    <div className="my-4 py-2 text-center">
                      <p className="text-xs text-content-muted italic">Slot not logged yet</p>
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-border/60 flex items-center justify-between">
                  {reading ? (
                    <div className="flex items-center justify-end w-full gap-2">
                      <button
                        onClick={() => handleEdit(reading)}
                        className="p-1.5 rounded-lg text-content-secondary hover:text-primary hover:bg-lavender transition-colors"
                        title="Edit Reading"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeleteId(reading.id)}
                        className="p-1.5 rounded-lg text-content-secondary hover:text-health-danger hover:bg-rose-50 transition-colors"
                        title="Delete Reading"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleOpenAddForSlot(slotName)}
                      variant="outline"
                      size="sm"
                      icon={Plus}
                      className="w-full text-xs"
                    >
                      Log Slot
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Monthly Glucose Trend Chart */}
      <Card className="p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              <CardTitle>Month-to-Date Glucose Trend</CardTitle>
            </div>
            <p className="text-xs text-content-secondary mt-1">
              Daily average glucose trajectory with reference target threshold (70–140 mg/dL)
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs text-content-secondary">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              Daily Average
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-0.5 bg-emerald-500" />
              Target Range
            </span>
          </div>
        </div>

        {chartData.length === 0 ? (
          <EmptyState
            title="No trend data for this month"
            message="No readings yet. Start tracking your glucose to see your health insights here."
            actionText="Log Glucose Reading"
            onAction={() => setIsAddModalOpen(true)}
          />
        ) : (
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="glucoseGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7665E8" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7665E8" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ECECF3" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: '#85899D' }}
                  tickLine={false}
                  axisLine={{ stroke: '#ECECF3' }}
                />
                <YAxis
                  domain={[40, 'auto']}
                  tick={{ fontSize: 11, fill: '#85899D' }}
                  tickLine={false}
                  axisLine={false}
                  unit=" mg"
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 rounded-2xl shadow-modal border border-border text-xs space-y-1">
                          <p className="font-bold text-content-primary">{data.fullDate}</p>
                          <p className="text-primary font-bold">
                            Average: {data.average} mg/dL
                          </p>
                          <div className="flex gap-3 text-content-muted text-[11px] pt-1 border-t border-border/60">
                            <span>High: {data.highest}</span>
                            <span>Low: {data.lowest}</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine
                  y={140}
                  stroke="#2EAD83"
                  strokeDasharray="4 4"
                  label={{ value: 'Target Max (140)', position: 'insideTopRight', fill: '#2EAD83', fontSize: 10 }}
                />
                <ReferenceLine
                  y={70}
                  stroke="#E9A23B"
                  strokeDasharray="4 4"
                  label={{ value: 'Target Min (70)', position: 'insideBottomRight', fill: '#E9A23B', fontSize: 10 }}
                />
                <Area
                  type="monotone"
                  dataKey="average"
                  stroke="#7665E8"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#glucoseGradient)"
                  activeDot={{ r: 6, fill: '#5B4BC4', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </Card>

      {/* Recent Readings Table */}
      <Card className="overflow-hidden">
        <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <CardTitle>Recent Glucose Logs</CardTitle>
            <CardDescription>Your latest recorded blood glucose measurements</CardDescription>
          </div>
          <Button
            onClick={() => {
              setPrefilledSlot(null);
              setEditReadingData(null);
              setIsAddModalOpen(true);
            }}
            variant="outline"
            size="sm"
            icon={Plus}
          >
            Add Log
          </Button>
        </CardHeader>

        {isLoading ? (
          <TableSkeleton rows={4} />
        ) : recentReadings.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No readings found"
              message="No readings yet. Start tracking your glucose to see your health insights here."
              actionText="Log First Reading"
              onAction={() => setIsAddModalOpen(true)}
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-content-primary">
              <thead className="bg-surface-subtle/60 text-xs font-semibold text-content-secondary uppercase tracking-wider border-b border-border/80">
                <tr>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Time Slot</th>
                  <th className="py-3 px-6">Value</th>
                  <th className="py-3 px-6">Health Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {recentReadings.map((r) => {
                  const status = getGlucoseStatus(r.value);
                  return (
                    <tr key={r.id} className="hover:bg-surface-subtle/30 transition-colors">
                      <td className="py-4 px-6 font-medium whitespace-nowrap">{r.date}</td>
                      <td className="py-4 px-6">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getSlotBadgeColor(r.slot)}`}>
                          {r.slot}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-base">
                        {r.value}{' '}
                        <span className="text-xs font-normal text-content-secondary">mg/dL</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${status.bgColor} ${status.color} ${status.borderColor}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.color.replace('text-', 'bg-')}`} />
                          {status.label}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleEdit(r)}
                            className="p-1.5 rounded-lg text-content-secondary hover:text-primary hover:bg-lavender transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteId(r.id)}
                            className="p-1.5 rounded-lg text-content-secondary hover:text-health-danger hover:bg-rose-50 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add / Edit Reading Modal */}
      <AddEditReadingModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        initialData={editReadingData}
        defaultDate={selectedDate}
        defaultSlot={prefilledSlot}
        onSuccess={fetchDashboardData}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Reading"
        message="Are you sure you want to delete this glucose reading? This record will be permanently removed."
        confirmText="Yes, Delete"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default DashboardPage;
