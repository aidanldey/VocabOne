import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QuickStart } from './QuickStart';

describe('QuickStart', () => {
  const mockOnStart = vi.fn();

  afterEach(() => {
    mockOnStart.mockClear();
  });

  it('should render with selected module', () => {
    render(
      <QuickStart
        selectedModule="Spanish Animals"
        dueCount={12}
        onStart={mockOnStart}
      />
    );

    expect(screen.getByText('Spanish Animals')).toBeInTheDocument();
    expect(screen.getByText('12 cards due for review')).toBeInTheDocument();
  });

  it('should render without selected module', () => {
    render(<QuickStart selectedModule={null} dueCount={0} onStart={mockOnStart} />);

    expect(screen.getByText('No Module Selected')).toBeInTheDocument();
    expect(screen.getByText('Select a module from below to start studying')).toBeInTheDocument();
  });

  it('should show singular card when dueCount is 1', () => {
    render(
      <QuickStart
        selectedModule="Spanish Animals"
        dueCount={1}
        onStart={mockOnStart}
      />
    );

    expect(screen.getByText('1 card due for review')).toBeInTheDocument();
  });

  it('should show plural cards when dueCount is more than 1', () => {
    render(
      <QuickStart
        selectedModule="Spanish Animals"
        dueCount={5}
        onStart={mockOnStart}
      />
    );

    expect(screen.getByText('5 cards due for review')).toBeInTheDocument();
  });

  it('should enable start button when module is selected', () => {
    render(
      <QuickStart
        selectedModule="Spanish Animals"
        dueCount={12}
        onStart={mockOnStart}
      />
    );

    const startButton = screen.getByRole('button', { name: /start studying/i });
    expect(startButton).not.toBeDisabled();
  });

  it('should disable start button when no module is selected', () => {
    render(<QuickStart selectedModule={null} dueCount={0} onStart={mockOnStart} />);

    const startButton = screen.getByRole('button', { name: /start studying/i });
    expect(startButton).toBeDisabled();
  });

  it('should disable start button when disabled prop is true', () => {
    render(
      <QuickStart
        selectedModule="Spanish Animals"
        dueCount={12}
        onStart={mockOnStart}
        disabled={true}
      />
    );

    const startButton = screen.getByRole('button', { name: /start studying/i });
    expect(startButton).toBeDisabled();
  });

  it('should call onStart with card limit when button clicked', async () => {
    const user = userEvent.setup();

    render(
      <QuickStart
        selectedModule="Spanish Animals"
        dueCount={12}
        onStart={mockOnStart}
      />
    );

    const startButton = screen.getByRole('button', { name: /start studying/i });
    await user.click(startButton);

    expect(mockOnStart).toHaveBeenCalledWith(20); // Default card limit
  });

  it('should not call onStart when disabled', async () => {
    const user = userEvent.setup();

    render(
      <QuickStart
        selectedModule="Spanish Animals"
        dueCount={12}
        onStart={mockOnStart}
        disabled={true}
      />
    );

    const startButton = screen.getByRole('button', { name: /start studying/i });
    await user.click(startButton);

    expect(mockOnStart).not.toHaveBeenCalled();
  });

  it('should toggle session settings', async () => {
    const user = userEvent.setup();

    render(
      <QuickStart
        selectedModule="Spanish Animals"
        dueCount={12}
        onStart={mockOnStart}
      />
    );

    const settingsButton = screen.getByRole('button', { name: /session settings/i });

    // Settings should be hidden initially
    expect(screen.queryByLabelText(/cards per session/i)).not.toBeInTheDocument();

    // Click to show settings
    await user.click(settingsButton);
    expect(screen.getByLabelText(/cards per session/i)).toBeInTheDocument();

    // Click to hide settings
    await user.click(settingsButton);
    expect(screen.queryByLabelText(/cards per session/i)).not.toBeInTheDocument();
  });

  it('should update card limit with slider', async () => {
    const user = userEvent.setup();

    render(
      <QuickStart
        selectedModule="Spanish Animals"
        dueCount={12}
        onStart={mockOnStart}
      />
    );

    // Show settings
    const settingsButton = screen.getByRole('button', { name: /session settings/i });
    await user.click(settingsButton);

    const slider = screen.getByLabelText(/cards per session/i) as HTMLInputElement;
    expect(slider.value).toBe('20');

    // Change slider value using fireEvent (range inputs don't work well with user.type)
    fireEvent.change(slider, { target: { value: '50' } });

    expect(slider.value).toBe('50');
  });

  it('should update card limit with preset buttons', async () => {
    const user = userEvent.setup();

    render(
      <QuickStart
        selectedModule="Spanish Animals"
        dueCount={12}
        onStart={mockOnStart}
      />
    );

    // Show settings
    const settingsButton = screen.getByRole('button', { name: /session settings/i });
    await user.click(settingsButton);

    // Click 30 cards button
    const button30 = screen.getByRole('button', { name: '30' });
    await user.click(button30);

    const startButton = screen.getByRole('button', { name: /start studying/i });
    await user.click(startButton);

    expect(mockOnStart).toHaveBeenCalledWith(30);
  });

  it('should show all preset card limit options', async () => {
    const user = userEvent.setup();

    render(
      <QuickStart
        selectedModule="Spanish Animals"
        dueCount={12}
        onStart={mockOnStart}
      />
    );

    // Show settings
    const settingsButton = screen.getByRole('button', { name: /session settings/i });
    await user.click(settingsButton);

    expect(screen.getByRole('button', { name: '10' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '20' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '30' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '50' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '100' })).toBeInTheDocument();
  });

  it('should highlight selected card limit button', async () => {
    const user = userEvent.setup();

    render(
      <QuickStart
        selectedModule="Spanish Animals"
        dueCount={12}
        onStart={mockOnStart}
      />
    );

    // Show settings
    const settingsButton = screen.getByRole('button', { name: /session settings/i });
    await user.click(settingsButton);

    // Default is 20
    const button20 = screen.getByRole('button', { name: '20' });
    expect(button20).toHaveClass('bg-blue-600');

    // Click 50
    const button50 = screen.getByRole('button', { name: '50' });
    await user.click(button50);

    expect(button50).toHaveClass('bg-blue-600');
    expect(button20).not.toHaveClass('bg-blue-600');
  });

  it('should show helper text when no module selected', () => {
    render(<QuickStart selectedModule={null} dueCount={0} onStart={mockOnStart} />);

    expect(screen.getByText('Select a module below to begin')).toBeInTheDocument();
  });

  it('should not show helper text when module selected', () => {
    render(
      <QuickStart
        selectedModule="Spanish Animals"
        dueCount={12}
        onStart={mockOnStart}
      />
    );

    expect(screen.queryByText('Select a module below to begin')).not.toBeInTheDocument();
  });
});
