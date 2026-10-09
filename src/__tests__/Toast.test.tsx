import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { ToastProvider, useToast } from '../components/Toast';

function TestComponent() {
  const { toast } = useToast();
  return (
    <div>
      <button onClick={() => toast('Test message', 'success')}>Show Toast</button>
      <button onClick={() => toast('Error occurred', 'error')}>Show Error</button>
    </div>
  );
}

describe('Toast', () => {
  it('renders toast message when triggered', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const btn = screen.getByText('Show Toast');
    act(() => { btn.click(); });
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });

  it('renders error toast with correct styling', async () => {
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    const btn = screen.getByText('Show Error');
    act(() => { btn.click(); });
    const toast = screen.getByText('Error occurred');
    expect(toast).toBeInTheDocument();
    expect(toast.className).toContain('bg-red');
  });

  it('auto-dismisses after timeout', async () => {
    vi.useFakeTimers();
    render(
      <ToastProvider>
        <TestComponent />
      </ToastProvider>
    );

    act(() => { screen.getByText('Show Toast').click(); });
    expect(screen.getByText('Test message')).toBeInTheDocument();

    act(() => { vi.advanceTimersByTime(5000); });
    expect(screen.queryByText('Test message')).not.toBeInTheDocument();
    vi.useRealTimers();
  });
});
