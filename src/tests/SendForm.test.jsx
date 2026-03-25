import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SendForm } from '../components/SendForm';

vi.mock('../utils/stellar', () => ({
  isValidStellarAddress: addr => addr.startsWith('G') && addr.length === 56,
  sendPayment: vi.fn(),
}));

const VALID_ADDR = 'GBBVAN7YTES4NTF5EC2ULSNTVVAZCHZCPX7UI3X7UXYZLH6ZSY4JPDAW';

describe('SendForm', () => {
  beforeEach(() => vi.clearAllMocks());

  it('renders correctly', () => {
    render(<SendForm address={VALID_ADDR} network="testnet" />);
    expect(screen.getByLabelText(/recipient/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/amount/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/memo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', {name: /send xlm/i})).toBeInTheDocument();
  });

  it('submit is disabled when empty', () => {
    render(<SendForm address={VALID_ADDR} network="testnet" />);
    expect(screen.getByRole('button', {name: /send xlm/i})).toBeDisabled();
  });

  it('shows validation error for invalid address', async () => {
    render(<SendForm address={VALID_ADDR} network="testnet" />);
    const recv = screen.getByLabelText(/recipient/i);
    const amt = screen.getByLabelText(/amount/i);
    await userEvent.type(recv, 'GBBAD');
    await userEvent.type(amt, '10');
    fireEvent.submit(recv.closest('form'));
    expect(await screen.findByText(/invalid stellar address/i)).toBeInTheDocument();
  });

  it('shows warning when not connected', () => {
    render(<SendForm address={null} network="testnet" />);
    expect(screen.getByText(/connect your wallet/i)).toBeInTheDocument();
  });

  it('amount must be positive', async () => {
    render(<SendForm address={VALID_ADDR} network="testnet" />);
    const recv = screen.getByLabelText(/recipient/i);
    const amt = screen.getByLabelText(/amount/i);
    await userEvent.type(recv, VALID_ADDR);
    await userEvent.type(amt, '-5');
    fireEvent.submit(recv.closest('form'));
    expect(await screen.findByText(/valid amount required/i)).toBeInTheDocument();
  });
});
