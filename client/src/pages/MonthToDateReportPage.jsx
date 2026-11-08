import React, { useState, useEffect, useCallback } from 'react';
import reportService from '../services/reportService.js';
import { getTodayString, formatDisplayDate, getSlotBadgeColor, getGlucoseStatus } from '../utils/dateUtils.js';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import AddEditReadingModal from '../features/readings/AddEditReadingModal.jsx';
import { CardSkeleton } from '../components/ui/LoadingSkeleton.jsx';
import { toast } from 'sonner';
import { Calendar, Plus, CalendarRange, TrendingUp, ArrowUpRight, ArrowDownRight, Layers, Activity } from 'lucide-react';
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

export const MonthToDateReportPage = () => {
  const todayStr = getTodayString();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchMonthToDateReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await reportService.getMonthToDateReport(selectedDate);
      setReport(res.data);
    } catch (err) {
      toast.error('Failed to load Month-to-Date report.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchMonthToDateReport();
  }, [fetchMonthToDateReport]);

  const chartData = report?.trend?.map((item) => ({
    date: item.date.slice(5),
    fullDate: item.date,
    average: item.average,
    highest: item.highest,
    lowest: item.lowest,
  })) || [];

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light text-primary-deep text-xs font-semibold mb-2">
            <CalendarRange className="w-3.5 h-3.5" />
            <span>Cumulative Monthly Progress</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-content-primary tracking-tight">
            Month-to-Date Report
          </h1>
          <p className="text-sm text-content-secondary mt-1">
            Track your cumulative metabolic health from day 1 through your selected date
          </p>
        </div>

        {/* Date Selector */}
        <div className="flex items-center gap-2 bg-white px-4 py-2.5 rounded-2xl border border-border shadow-sm">
          <Calendar className="w-4 h-4 text-primary" />
          <input
            type="date"
            max={todayStr}
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="bg-transparent text-content-primary font-semibold text-sm focus:outline-none cursor-pointer"
          />
        </div>
      </div>

      {/* Date Range Banner */}
      <Card className="p-6 bg-gradient-to-r from-white to-surface-subtle/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-content-secondary">
              Evaluated Date Range
            </span>
            <h2 className="text-xl font-extrabold text-content-primary mt-1">
              {report?.startDate ? `${formatDisplayDate(report.startDate)} — ${formatDisplayDate(report.endDate)}` : 'Loading...'}
            </h2>
            <p className="text-xs text-content-secondary mt-1">
              From the 1st of the month through {formatDisplayDate(selectedDate)}
            </p>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="outline"
            size="sm"
            icon={Plus}
          >
            Log Reading
          </Button>
        </div>
      </Card>

      {/* Metrics Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      ) : report?.isEmpty ? (
        <Card className="p-8">
          <EmptyState
            title="No readings in this date range"
            message="No readings yet. Start tracking your glucose to see your health insights here."
            actionText="Add Reading"
            onAction={() => setIsModalOpen(true)}
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Readings */}
            <Card hoverEffect className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-content-secondary">
                  Total Readings
                </span>
                <div className="w-8 h-8 rounded-xl bg-lavender text-primary-deep flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-content-primary">
                  {report.count}
                </span>
                <span className="text-xs text-content-secondary">measurements</span>
              </div>
              <p className="text-[11px] text-content-secondary mt-2">
                In current month-to-date span
              </p>
            </Card>

            {/* Average */}
            <Card hoverEffect className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-content-secondary">
                  Period Average
                </span>
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-primary-deep flex items-center justify-center">
                  <Activity className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-content-primary">
                  {report.average}
                </span>
                <span className="text-xs font-semibold text-content-secondary">mg/dL</span>
              </div>
              <p className="text-[11px] text-content-secondary mt-2">
                Rounded to 1 decimal place
              </p>
            </Card>

            {/* Highest */}
            <Card hoverEffect className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-content-secondary">
                  Highest Reading
                </span>
                <div className="w-8 h-8 rounded-xl bg-rose-50 text-health-danger flex items-center justify-center">
                  <ArrowUpRight className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-content-primary">
                  {report.highest}
                </span>
                <span className="text-xs font-semibold text-content-secondary">mg/dL</span>
              </div>
              <p className="text-[11px] text-content-secondary mt-2">Period high peak</p>
            </Card>

            {/* Lowest */}
            <Card hoverEffect className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-content-secondary">
                  Lowest Reading
                </span>
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-health-success flex items-center justify-center">
                  <ArrowDownRight className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-content-primary">
                  {report.lowest}
                </span>
                <span className="text-xs font-semibold text-content-secondary">mg/dL</span>
              </div>
              <p className="text-[11px] text-content-secondary mt-2">Period baseline low</p>
            </Card>
          </div>

          {/* Trend Chart */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <CardTitle>Month-to-Date Glucose Curve</CardTitle>
                <p className="text-xs text-content-secondary mt-1">
                  Daily average fluctuations with clinical target thresholds
                </p>
              </div>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="mtdGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#7665E8" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#7665E8" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#ECECF3" vertical={false} />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#85899D' }} tickLine={false} axisLine={{ stroke: '#ECECF3' }} />
                  <YAxis domain={[40, 'auto']} tick={{ fontSize: 11, fill: '#85899D' }} tickLine={false} axisLine={false} unit=" mg" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const d = payload[0].payload;
                        return (
                          <div className="bg-white p-3 rounded-2xl shadow-modal border border-border text-xs space-y-1">
                            <p className="font-bold text-content-primary">{d.fullDate}</p>
                            <p className="text-primary font-bold">Average: {d.average} mg/dL</p>
                            <div className="flex gap-3 text-content-muted text-[11px] pt-1 border-t border-border/60">
                              <span>Peak: {d.highest}</span>
                              <span>Low: {d.lowest}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ReferenceLine y={140} stroke="#2EAD83" strokeDasharray="4 4" />
                  <ReferenceLine y={70} stroke="#E9A23B" strokeDasharray="4 4" />
                  <Area
                    type="monotone"
                    dataKey="average"
                    stroke="#7665E8"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#mtdGradient)"
                    activeDot={{ r: 6, fill: '#5B4BC4', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Detailed Readings List */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Period Readings Log ({report.readings.length})</CardTitle>
            </CardHeader>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-content-primary">
                <thead className="bg-surface-subtle/60 text-xs font-semibold text-content-secondary uppercase tracking-wider border-b border-border/80">
                  <tr>
                    <th className="py-3 px-6">Date</th>
                    <th className="py-3 px-6">Slot</th>
                    <th className="py-3 px-6">Value</th>
                    <th className="py-3 px-6">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {report.readings.map((r) => {
                    const status = getGlucoseStatus(r.value);
                    return (
                      <tr key={r.id} className="hover:bg-surface-subtle/30">
                        <td className="py-3.5 px-6 font-semibold">{r.date}</td>
                        <td className="py-3.5 px-6">
                          <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getSlotBadgeColor(r.slot)}`}>
                            {r.slot}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 font-bold">{r.value} mg/dL</td>
                        <td className="py-3.5 px-6">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${status.bgColor} ${status.color} ${status.borderColor}`}>
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        </>
      )}

      {/* Add Modal */}
      <AddEditReadingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultDate={selectedDate}
        onSuccess={fetchMonthToDateReport}
      />
    </div>
  );
};

export default MonthToDateReportPage;
