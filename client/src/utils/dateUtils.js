/**
 * Frontend date utilities for consistent YYYY-MM-DD handling
 */

export const getTodayString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDisplayDate = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatShortDate = (dateStr) => {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
};

export const getSlotBadgeColor = (slot) => {
  switch (slot) {
    case 'Morning (Fasting)':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'After breakfast':
      return 'bg-purple-50 text-purple-700 border-purple-200';
    case 'After lunch':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'After dinner':
      return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

export const getGlucoseStatus = (value) => {
  if (value < 70) {
    return {
      label: 'Low',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      description: 'Hypoglycemia risk (<70 mg/dL)',
    };
  }
  if (value <= 140) {
    return {
      label: 'Normal',
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      description: 'Target range (70–140 mg/dL)',
    };
  }
  if (value <= 180) {
    return {
      label: 'Elevated',
      color: 'text-amber-600',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      description: 'Slightly high (141–180 mg/dL)',
    };
  }
  return {
    label: 'High',
    color: 'text-rose-600',
    bgColor: 'bg-rose-50',
    borderColor: 'border-rose-200',
    description: 'Hyperglycemia (>180 mg/dL)',
  };
};
