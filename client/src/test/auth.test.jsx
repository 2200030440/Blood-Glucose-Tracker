import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../pages/LoginPage.jsx';
import RegisterPage from '../pages/RegisterPage.jsx';
import { AuthProvider } from '../context/AuthContext.jsx';
import authService from '../services/authService.js';

// Mock authService
vi.mock('../services/authService.js', () => ({
  default: {
    getCurrentUser: vi.fn().mockRejectedValue(new Error('Unauthenticated')),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}));

describe('Frontend Authentication Tests', () => {
  describe('Login Form Validation', () => {
    it('shows required error messages when submitting empty login fields', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </MemoryRouter>
      );

      const submitBtn = screen.getByRole('button', { name: /sign in/i });
      fireEvent.click(submitBtn);

      expect(await screen.findByText(/please enter your email address/i)).toBeInTheDocument();
    });

    it('shows backend error message on invalid credentials', async () => {
      authService.login.mockRejectedValueOnce({
        friendlyMessage: 'Invalid email or password.',
      });

      render(
        <MemoryRouter>
          <AuthProvider>
            <LoginPage />
          </AuthProvider>
        </MemoryRouter>
      );

      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const submitBtn = screen.getByRole('button', { name: /sign in/i });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'WrongPass123' } });
      fireEvent.click(submitBtn);

      expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
    });
  });

  describe('Registration Form Validation', () => {
    it('requires valid password strength and matching confirm password', async () => {
      render(
        <MemoryRouter>
          <AuthProvider>
            <RegisterPage />
          </AuthProvider>
        </MemoryRouter>
      );

      const nameInput = screen.getByLabelText(/full name/i);
      const emailInput = screen.getByLabelText(/email address/i);
      const passwordInput = screen.getByLabelText(/^password/i);
      const confirmInput = screen.getByLabelText(/confirm password/i);
      const submitBtn = screen.getByRole('button', { name: /create account/i });

      fireEvent.change(nameInput, { target: { value: 'Jane' } });
      fireEvent.change(emailInput, { target: { value: 'jane@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'Password123' } });
      fireEvent.change(confirmInput, { target: { value: 'DifferentPass123' } });

      fireEvent.click(submitBtn);

      expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });
});
