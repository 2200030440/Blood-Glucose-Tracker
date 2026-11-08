import React, { useState, useEffect } from 'react';
import Modal from '../../components/ui/Modal.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import readingService from '../../services/readingService.js';
import { getTodayString } from '../../utils/dateUtils.js';
import { toast } from 'sonner';
import { Activity, Calendar, Clock } from 'lucide-react';

const PERMITTED_SLOTS = [
  'Morning (Fasting)',
  'After breakfast',
  'After lunch',
  'After dinner',
];

export const AddEditReadingModal = ({
  isOpen,
  onClose,
  initialData = null, // if provided, edit mode
  defaultDate = null,
  defaultSlot = null,
  onSuccess,
}) => {
  const isEdit = !!initialData?.id;
  const todayStr = getTodayString();

  const [date, setDate] = useState(todayStr);
  const [slot, setSlot] = useState(PERMITTED_SLOTS[0]);
  const [value, setValue] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (initialData) {
      setDate(initialData.date || todayStr);
      setSlot(initialData.slot || PERMITTED_SLOTS[0]);
      setValue(initialData.value !== undefined ? String(initialData.value) : '');
    } else {
      setDate(defaultDate || todayStr);
      setSlot(defaultSlot || PERMITTED_SLOTS[0]);
      setValue('');
    }
    setErrors({});
  }, [initialData, defaultDate, defaultSlot, isOpen, todayStr]);

  const validateForm = () => {
    const newErrors = {};

    // 1. Date cannot be in future
    if (!date) {
      newErrors.date = 'Date is required.';
    } else if (date > todayStr) {
      newErrors.date = 'Date cannot be in the future.';
    }

    // 2. Slot required
    if (!slot || !PERMITTED_SLOTS.includes(slot)) {
      newErrors.slot = 'Please select a valid time slot.';
    }

    // 3. Glucose value required
    if (value === undefined || value === null || String(value).trim() === '') {
      newErrors.value = 'Please enter a glucose value.';
    } else {
      const num = Number(value);
      // 4. Whole number between 40 and 600
      if (isNaN(num) || !Number.isInteger(num) || num < 40 || num > 600) {
        newErrors.value = 'Value must be between 40 and 600 mg/dl.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      const payload = {
        date,
        slot,
        value: parseInt(value, 10),
      };

      let res;
      if (isEdit) {
        res = await readingService.updateReading(initialData.id, payload);
        toast.success(res.message || 'Reading updated successfully.');
      } else {
        res = await readingService.createReading(payload);
        toast.success(res.message || 'Reading added successfully.');
      }

      if (onSuccess) {
        onSuccess(res.data);
      }
      onClose();
    } catch (err) {
      const errorMsg = err.friendlyMessage || 'Failed to save glucose reading.';
      // Check if slot error or general limit error
      if (errorMsg.includes('slot') || errorMsg.includes('already have')) {
        setErrors((prev) => ({ ...prev, slot: errorMsg }));
      } else if (errorMsg.includes('4 readings')) {
        setErrors((prev) => ({ ...prev, general: errorMsg }));
      } else if (errorMsg.includes('between 40 and 600')) {
        setErrors((prev) => ({ ...prev, value: errorMsg }));
      } else if (errorMsg.includes('future')) {
        setErrors((prev) => ({ ...prev, date: errorMsg }));
      } else {
        setErrors((prev) => ({ ...prev, general: errorMsg }));
      }
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? 'Edit Glucose Reading' : 'Log New Glucose Reading'}
      description="Record your blood glucose measurement accurately to monitor your glycemic control."
      maxWidth="max-w-md"
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {errors.general && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-health-danger">
            {errors.general}
          </div>
        )}

        {/* Date Field */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-content-secondary mb-1.5">
            Reading Date
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-content-muted">
              <Calendar className="w-4 h-4" />
            </div>
            <input
              type="date"
              max={todayStr}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                if (errors.date) setErrors((prev) => ({ ...prev, date: null }));
              }}
              className={`w-full bg-white border rounded-xl py-2.5 pl-10 pr-3.5 text-sm text-content-primary transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                errors.date ? 'border-health-danger' : 'border-border'
              }`}
            />
          </div>
          {errors.date && <p className="text-xs font-medium text-health-danger mt-1">{errors.date}</p>}
        </div>

        {/* Slot Field */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-content-secondary mb-1.5">
            Time Slot
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-content-muted">
              <Clock className="w-4 h-4" />
            </div>
            <select
              value={slot}
              onChange={(e) => {
                setSlot(e.target.value);
                if (errors.slot) setErrors((prev) => ({ ...prev, slot: null }));
              }}
              className={`w-full bg-white border rounded-xl py-2.5 pl-10 pr-3.5 text-sm text-content-primary appearance-none transition-all focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary ${
                errors.slot ? 'border-health-danger' : 'border-border'
              }`}
            >
              {PERMITTED_SLOTS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          {errors.slot && <p className="text-xs font-medium text-health-danger mt-1">{errors.slot}</p>}
        </div>

        {/* Glucose Value Field */}
        <div>
          <Input
            label="Glucose Value (mg/dL)"
            type="number"
            step="1"
            min="40"
            max="600"
            placeholder="e.g. 110"
            icon={Activity}
            value={value}
            onChange={(e) => {
              setValue(e.target.value);
              if (errors.value) setErrors((prev) => ({ ...prev, value: null }));
            }}
            error={errors.value}
            helperText="Whole number between 40 and 600 mg/dL"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading}>
            {isEdit ? 'Save Changes' : 'Log Reading'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AddEditReadingModal;
