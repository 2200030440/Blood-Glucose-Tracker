import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AddEditReadingModal from '../features/readings/AddEditReadingModal.jsx';
import EmptyState from '../components/ui/EmptyState.jsx';
import readingService from '../services/readingService.js';

vi.mock('../services/readingService.js', () => ({
  default: {
    createReading: vi.fn(),
    updateReading: vi.fn(),
    deleteReading: vi.fn(),
    getReadings: vi.fn(),
  },
}));

describe('Frontend Readings & Validation Tests', () => {
  it('validates empty glucose value with "Please enter a glucose value."', async () => {
    render(
      <AddEditReadingModal
        isOpen={true}
        onClose={() => {}}
      />
    );

    const submitBtn = screen.getByRole('button', { name: /log reading/i });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Please enter a glucose value.')).toBeInTheDocument();
  });

  it('validates value range between 40 and 600 mg/dl', async () => {
    render(
      <AddEditReadingModal
        isOpen={true}
        onClose={() => {}}
      />
    );

    const valueInput = screen.getByPlaceholderText('e.g. 110');
    const submitBtn = screen.getByRole('button', { name: /log reading/i });

    // Under 40
    fireEvent.change(valueInput, { target: { value: '35' } });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Value must be between 40 and 600 mg/dl.')).toBeInTheDocument();

    // Over 600
    fireEvent.change(valueInput, { target: { value: '650' } });
    fireEvent.click(submitBtn);

    expect(await screen.findByText('Value must be between 40 and 600 mg/dl.')).toBeInTheDocument();
  });

  it('submits valid reading successfully and triggers callback', async () => {
    readingService.createReading.mockResolvedValueOnce({
      success: true,
      message: 'Reading added successfully.',
      data: { id: 'r1', value: 110, slot: 'Morning (Fasting)', date: '2026-10-15' },
    });

    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    render(
      <AddEditReadingModal
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    );

    const valueInput = screen.getByPlaceholderText('e.g. 110');
    const submitBtn = screen.getByRole('button', { name: /log reading/i });

    fireEvent.change(valueInput, { target: { value: '110' } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(readingService.createReading).toHaveBeenCalledWith(
        expect.objectContaining({
          value: 110,
          slot: 'Morning (Fasting)',
        })
      );
      expect(handleSuccess).toHaveBeenCalled();
      expect(handleClose).toHaveBeenCalled();
    });
  });

  it('displays the exact required empty report message', () => {
    render(
      <EmptyState
        title="No readings found"
        message="No readings yet. Start tracking your glucose to see your health insights here."
      />
    );

    expect(
      screen.getByText('No readings yet. Start tracking your glucose to see your health insights here.')
    ).toBeInTheDocument();
  });
});
