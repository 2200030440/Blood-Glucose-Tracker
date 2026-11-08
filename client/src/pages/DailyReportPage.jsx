import React, { useState, useEffect, useCallback } from 'react';
import reportService from '../services/reportService.js';
import { getTodayString, formatDisplayDate, getSlotBadgeColor, getGlucoseStatus } from '../utils/dateUtils.js';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import AddEditReadingModal from '../features/readings/AddEditReadingModal.jsx';
import { CardSkeleton } from '../components/ui/LoadingSkeleton.jsx';
import { toast } from 'sonner';
import { Calendar, Plus, Activity, ArrowUpRight, ArrowDownRight, Layers, Clock } from 'lucide-react';

export const DailyReportPage = () => {
  const todayStr = getTodayString();
  const [selectedDate, setSelectedDate] = useState(todayStr);
  const [report, setReport] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchDailyReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await reportService.getDailyReport(selectedDate);
      setReport(res.data);
    } catch (err) {
      toast.error('Failed to load daily report.');
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    fetchDailyReport();
  }, [fetchDailyReport]);

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light text-primary-deep text-xs font-semibold mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>Daily Metabolic Summary</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-content-primary tracking-tight">
            Daily Glucose Report
          </h1>
          <p className="text-sm text-content-secondary mt-1">
            Comprehensive single-day analysis of glucose levels across daily routine slots
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

      {/* Date Header Card */}
      <Card className="p-6 bg-gradient-to-r from-white to-surface-subtle/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-content-secondary">
              Report for Date
            </span>
            <h2 className="text-xl font-extrabold text-content-primary mt-1">
              {formatDisplayDate(selectedDate)}
            </h2>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            variant="outline"
            size="sm"
            icon={Plus}
          >
            Log Slot for this Date
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
            title="No readings on this date"
            message="No readings yet. Start tracking your glucose to see your health insights here."
            actionText="Add Reading for This Date"
            onAction={() => setIsModalOpen(true)}
          />
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Number of Readings */}
            <Card hoverEffect className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-content-secondary">
                  Number of Readings
                </span>
                <div className="w-8 h-8 rounded-xl bg-lavender text-primary-deep flex items-center justify-center">
                  <Layers className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-content-primary">
                  {report.count}
                </span>
                <span className="text-xs text-content-secondary">/ 4 slots</span>
              </div>
              <p className="text-[11px] text-content-secondary mt-2">
                {report.count === 4 ? 'Complete daily cycle' : `${4 - report.count} slots unrecorded`}
              </p>
            </Card>

            {/* Average Glucose */}
            <Card hoverEffect className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-content-secondary">
                  Daily Average
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

            {/* Highest Reading */}
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
              <p className="text-[11px] text-content-secondary mt-2">Maximum daily spike</p>
            </Card>

            {/* Lowest Reading */}
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
              <p className="text-[11px] text-content-secondary mt-2">Minimum daily level</p>
            </Card>
          </div>

          {/* Individual Readings with Time Slots */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Daily Slot Breakdown</CardTitle>
              <p className="text-xs text-content-secondary mt-1">
                Individual measurements and scheduled slots for {selectedDate}
              </p>
            </CardHeader>

            <div className="divide-y divide-border/60">
              {report.readings.map((r) => {
                const status = getGlucoseStatus(r.value);
                return (
                  <div key={r.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-surface-subtle/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-surface-subtle border border-border flex items-center justify-center text-primary-deep">
                        <Clock className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-content-primary">{r.slot}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getSlotBadgeColor(r.slot)}`}>
                            Slot
                          </span>
                        </div>
                        <p className="text-xs text-content-secondary mt-0.5">{status.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="text-2xl font-black text-content-primary">{r.value}</span>
                        <span className="text-xs font-medium text-content-secondary ml-1">mg/dL</span>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${status.bgColor} ${status.color} ${status.borderColor}`}>
                        {status.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </>
      )}

      {/* Add Reading Modal */}
      <AddEditReadingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultDate={selectedDate}
        onSuccess={fetchDailyReport}
      />
    </div>
  );
};

export default DailyReportPage;

