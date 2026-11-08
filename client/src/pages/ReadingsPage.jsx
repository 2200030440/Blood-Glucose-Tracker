import React, { useState, useEffect, useCallback } from 'react';
import readingService from '../services/readingService.js';
import { getTodayString, getSlotBadgeColor, getGlucoseStatus } from '../utils/dateUtils.js';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card.jsx';
import Button from '../components/ui/Button.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx';
import AddEditReadingModal from '../features/readings/AddEditReadingModal.jsx';
import { TableSkeleton } from '../components/ui/LoadingSkeleton.jsx';
import { toast } from 'sonner';
import { Plus, Edit2, Trash2, Filter, Calendar, Activity, X } from 'lucide-react';

const SLOTS = [
  'All Slots',
  'Morning (Fasting)',
  'After breakfast',
  'After lunch',
  'After dinner',
];

export const ReadingsPage = () => {
  const [readings, setReadings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [filterDate, setFilterDate] = useState('');
  const [filterSlot, setFilterSlot] = useState('All Slots');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingReading, setEditingReading] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchReadings = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = {};
      if (filterDate) params.date = filterDate;
      const res = await readingService.getReadings(params);
      setReadings(res.data?.readings || []);
      setCurrentPage(1); // Reset to page 1 on filter change
    } catch (err) {
      toast.error('Failed to load readings.');
    } finally {
      setIsLoading(false);
    }
  }, [filterDate]);

  useEffect(() => {
    fetchReadings();
  }, [fetchReadings]);

  const handleDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await readingService.deleteReading(deleteId);
      toast.success('Reading deleted successfully.');
      setDeleteId(null);
      fetchReadings();
    } catch (err) {
      toast.error(err.friendlyMessage || 'Failed to delete reading.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredReadings = readings.filter((r) => {
    if (filterSlot !== 'All Slots' && r.slot !== filterSlot) return false;
    return true;
  });

  // Calculate paginated slice
  const totalPages = Math.max(1, Math.ceil(filteredReadings.length / pageSize));
  const paginatedReadings = filteredReadings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-content-primary tracking-tight">
            My Glucose Readings
          </h1>
          <p className="text-sm text-content-secondary mt-1">
            Browse, filter, edit, and manage all your historical blood sugar logs
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingReading(null);
            setIsModalOpen(true);
          }}
          variant="primary"
          size="md"
          icon={Plus}
        >
          Add New Reading
        </Button>
      </div>

      {/* Filter Controls */}
      <Card className="p-4 sm:p-5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-surface-subtle px-3 py-2 rounded-xl border border-border text-xs">
              <Calendar className="w-4 h-4 text-content-muted" />
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="bg-transparent text-content-primary focus:outline-none cursor-pointer"
                placeholder="Filter by date"
              />
              {filterDate && (
                <button
                  onClick={() => setFilterDate('')}
                  className="p-1 hover:text-content-primary text-content-muted"
                  title="Clear date filter"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-2 bg-surface-subtle px-3 py-2 rounded-xl border border-border text-xs">
              <Filter className="w-4 h-4 text-content-muted" />
              <select
                value={filterSlot}
                onChange={(e) => setFilterSlot(e.target.value)}
                className="bg-transparent text-content-primary focus:outline-none cursor-pointer"
              >
                {SLOTS.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-xs font-semibold text-content-secondary">
            Showing {filteredReadings.length} {filteredReadings.length === 1 ? 'reading' : 'readings'}
          </div>
        </div>
      </Card>

      {/* Readings Table / Cards */}
      <Card className="overflow-hidden">
        {isLoading ? (
          <TableSkeleton rows={6} />
        ) : filteredReadings.length === 0 ? (
          <div className="p-8">
            <EmptyState
              title="No readings match your filters"
              message="No readings yet. Start tracking your glucose to see your health insights here."
              actionText="Log Glucose Reading"
              onAction={() => {
                setEditingReading(null);
                setIsModalOpen(true);
              }}
            />
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-sm text-content-primary">
                <thead className="bg-surface-subtle/60 text-xs font-semibold text-content-secondary uppercase tracking-wider border-b border-border/80">
                  <tr>
                    <th className="py-3.5 px-6">Calendar Date</th>
                    <th className="py-3.5 px-6">Time Slot</th>
                    <th className="py-3.5 px-6">Glucose Reading</th>
                    <th className="py-3.5 px-6">Health Category</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {paginatedReadings.map((r) => {
                    const status = getGlucoseStatus(r.value);
                    return (
                      <tr key={r.id} className="hover:bg-surface-subtle/30 transition-colors">
                        <td className="py-4 px-6 font-semibold whitespace-nowrap">{r.date}</td>
                        <td className="py-4 px-6">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getSlotBadgeColor(r.slot)}`}>
                            {r.slot}
                          </span>
                        </td>
                        <td className="py-4 px-6 font-black text-base">
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
                              onClick={() => {
                                setEditingReading(r);
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 rounded-lg text-content-secondary hover:text-primary hover:bg-lavender transition-colors"
                              title="Edit Reading"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setDeleteId(r.id)}
                              className="p-1.5 rounded-lg text-content-secondary hover:text-health-danger hover:bg-rose-50 transition-colors"
                              title="Delete Reading"
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

            {/* Mobile Card List View */}
            <div className="sm:hidden divide-y divide-border/60">
              {paginatedReadings.map((r) => {
                const status = getGlucoseStatus(r.value);
                return (
                  <div key={r.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-content-primary">{r.date}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getSlotBadgeColor(r.slot)}`}>
                        {r.slot}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-2xl font-black text-content-primary">{r.value}</span>
                        <span className="text-xs text-content-secondary ml-1">mg/dL</span>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold border ${status.bgColor} ${status.color} ${status.borderColor}`}>
                        {status.label}
                      </span>
                    </div>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/40">
                      <Button
                        onClick={() => {
                          setEditingReading(r);
                          setIsModalOpen(true);
                        }}
                        variant="outline"
                        size="sm"
                        icon={Edit2}
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => setDeleteId(r.id)}
                        variant="outline"
                        size="sm"
                        icon={Trash2}
                        className="text-health-danger hover:bg-rose-50 border-rose-200"
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-4 sm:p-5 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between gap-3 bg-surface-subtle/30">
                <span className="text-xs text-content-secondary">
                  Showing {(currentPage - 1) * pageSize + 1}–{Math.min(currentPage * pageSize, filteredReadings.length)} of {filteredReadings.length} readings
                </span>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-xs font-bold text-content-primary px-2">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Add / Edit Modal */}
      <AddEditReadingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialData={editingReading}
        onSuccess={fetchReadings}
      />

      {/* Confirm Delete */}
      <ConfirmDialog
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete Reading"
        message="Are you sure you want to delete this glucose reading? This action is permanent."
        confirmText="Yes, Delete"
        isLoading={isDeleting}
      />
    </div>
  );
};

export default ReadingsPage;

