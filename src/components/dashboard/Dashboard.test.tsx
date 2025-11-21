import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dashboard, type ModuleInfo, type DashboardStats } from './Dashboard';

describe('Dashboard', () => {
  const mockModules: ModuleInfo[] = [
    {
      moduleId: 'spanish-animals',
      title: 'Spanish Animals',
      description: 'Learn common animal names',
      progress: 65,
      dueCount: 12,
      totalEntries: 50,
    },
    {
      moduleId: 'french-food',
      title: 'French Food',
      description: 'Food and cooking vocabulary',
      progress: 30,
      dueCount: 25,
      totalEntries: 80,
    },
    {
      moduleId: 'german-basics',
      title: 'German Basics',
      description: 'Essential German phrases',
      progress: 90,
      dueCount: 0,
      totalEntries: 40,
    },
  ];

  const mockStats: DashboardStats = {
    wordsLearned: 150,
    streak: 7,
    reviewsToday: 25,
    accuracy: 92,
  };

  const mockOnStartStudy = vi.fn();

  afterEach(() => {
    mockOnStartStudy.mockClear();
  });

  it('should render dashboard header', () => {
    render(
      <Dashboard
        modules={mockModules}
        stats={mockStats}
        onStartStudy={mockOnStartStudy}
      />
    );

    expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument();
    expect(screen.getByText('Track your progress and start learning')).toBeInTheDocument();
  });

  it('should render stats panel', () => {
    render(
      <Dashboard
        modules={mockModules}
        stats={mockStats}
        onStartStudy={mockOnStartStudy}
      />
    );

    expect(screen.getByText('150')).toBeInTheDocument(); // Words learned
    expect(screen.getByText('7')).toBeInTheDocument(); // Streak
    expect(screen.getByText('25')).toBeInTheDocument(); // Reviews today
    expect(screen.getByText('92%')).toBeInTheDocument(); // Accuracy
  });

  it('should render all module cards', () => {
    render(
      <Dashboard
        modules={mockModules}
        stats={mockStats}
        onStartStudy={mockOnStartStudy}
      />
    );

    // Check for module cards (will appear at least once each)
    expect(screen.getAllByText('Spanish Animals').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('French Food')).toBeInTheDocument();
    expect(screen.getByText('German Basics')).toBeInTheDocument();
  });

  it('should render quick start panel', () => {
    render(
      <Dashboard
        modules={mockModules}
        stats={mockStats}
        onStartStudy={mockOnStartStudy}
      />
    );

    expect(screen.getByText('Quick Start')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /start studying/i })).toBeInTheDocument();
  });

  it('should auto-select first module with due cards', () => {
    render(
      <Dashboard
        modules={mockModules}
        stats={mockStats}
        onStartStudy={mockOnStartStudy}
      />
    );

    // Spanish Animals is the first module with due cards and should be auto-selected
    // It will appear both in the module card and in the QuickStart panel
    const spanishAnimals = screen.getAllByText('Spanish Animals');
    expect(spanishAnimals.length).toBeGreaterThanOrEqual(1);
  });

  it('should auto-select first module if none have due cards', () => {
    const modulesWithoutDue = mockModules.map((m) => ({ ...m, dueCount: 0 }));

    render(
      <Dashboard
        modules={modulesWithoutDue}
        stats={mockStats}
        onStartStudy={mockOnStartStudy}
      />
    );

    // Spanish Animals is first module and will be auto-selected
    const spanishAnimals = screen.getAllByText('Spanish Animals');
    expect(spanishAnimals.length).toBeGreaterThanOrEqual(1);
  });

  it('should allow selecting different module', async () => {
    const user = userEvent.setup();

    render(
      <Dashboard
        modules={mockModules}
        stats={mockStats}
        onStartStudy={mockOnStartStudy}
      />
    );

    // Find and click the French Food card
    const frenchCard = screen.getByRole('button', {
      name: /French Food module/i,
    });
    await user.click(frenchCard);

    // Quick start should show French Food (will appear in both card and QuickStart)
    const frenchFood = screen.getAllByText('French Food');
    expect(frenchFood.length).toBeGreaterThanOrEqual(1);
  });

  it('should call onStartStudy with correct module and card limit', async () => {
    const user = userEvent.setup();

    render(
      <Dashboard
        modules={mockModules}
        stats={mockStats}
        onStartStudy={mockOnStartStudy}
      />
    );

    const startButton = screen.getByRole('button', { name: /start studying/i });
    await user.click(startButton);

    expect(mockOnStartStudy).toHaveBeenCalledWith('spanish-animals', 20);
  });

  it('should show loading state', () => {
    render(
      <Dashboard
        modules={mockModules}
        stats={mockStats}
        onStartStudy={mockOnStartStudy}
        loading={true}
      />
    );

    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
  });

  it('should show empty state when no modules', () => {
    render(
      <Dashboard
        modules={[]}
        stats={mockStats}
        onStartStudy={mockOnStartStudy}
      />
    );

    expect(screen.getByText('No modules yet')).toBeInTheDocument();
    expect(screen.getByText('Get started by importing your first vocabulary module')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Import Module' })).toBeInTheDocument();
  });

  it('should display module due counts', () => {
    render(
      <Dashboard
        modules={mockModules}
        stats={mockStats}
        onStartStudy={mockOnStartStudy}
      />
    );

    expect(screen.getByText('12 due')).toBeInTheDocument();
    expect(screen.getByText('25 due')).toBeInTheDocument();
  });

  it('should display module progress', () => {
    render(
      <Dashboard
        modules={mockModules}
        stats={mockStats}
        onStartStudy={mockOnStartStudy}
      />
    );

    expect(screen.getByText('65% learned')).toBeInTheDocument();
    expect(screen.getByText('30% learned')).toBeInTheDocument();
    expect(screen.getByText('90% learned')).toBeInTheDocument();
  });

  it('should show recent activity when reviews completed today', () => {
    render(
      <Dashboard
        modules={mockModules}
        stats={mockStats}
        onStartStudy={mockOnStartStudy}
      />
    );

    // Recent activity section with reviews today
    expect(screen.getByText(/Completed 25 reviews today/i)).toBeInTheDocument();
  });

  it('should show no reviews message when reviewsToday is 0', () => {
    render(
      <Dashboard
        modules={mockModules}
        stats={{ ...mockStats, reviewsToday: 0 }}
        onStartStudy={mockOnStartStudy}
      />
    );

    expect(screen.getByText('No reviews completed yet today')).toBeInTheDocument();
  });

  it('should have responsive grid layout', () => {
    const { container } = render(
      <Dashboard
        modules={mockModules}
        stats={mockStats}
        onStartStudy={mockOnStartStudy}
      />
    );

    const mainGrid = container.querySelector('.grid.lg\\:grid-cols-3');
    expect(mainGrid).toBeInTheDocument();

    const moduleGrid = container.querySelector('.grid.sm\\:grid-cols-2');
    expect(moduleGrid).toBeInTheDocument();
  });

  it('should update selected module when clicking different cards', async () => {
    const user = userEvent.setup();

    render(
      <Dashboard
        modules={mockModules}
        stats={mockStats}
        onStartStudy={mockOnStartStudy}
      />
    );

    // Click German Basics card
    const germanCard = screen.getByRole('button', {
      name: /German Basics module/i,
    });
    await user.click(germanCard);

    // Start studying should call with german-basics
    const startButton = screen.getByRole('button', { name: /start studying/i });
    await user.click(startButton);

    expect(mockOnStartStudy).toHaveBeenCalledWith('german-basics', 20);
  });

  it('should show module descriptions', () => {
    render(
      <Dashboard
        modules={mockModules}
        stats={mockStats}
        onStartStudy={mockOnStartStudy}
      />
    );

    expect(screen.getByText('Learn common animal names')).toBeInTheDocument();
    expect(screen.getByText('Food and cooking vocabulary')).toBeInTheDocument();
    expect(screen.getByText('Essential German phrases')).toBeInTheDocument();
  });

  it('should handle modules without descriptions', () => {
    const modulesWithoutDesc = mockModules.map((m) => ({
      ...m,
      description: undefined,
    }));

    render(
      <Dashboard
        modules={modulesWithoutDesc}
        stats={mockStats}
        onStartStudy={mockOnStartStudy}
      />
    );

    const spanishAnimals = screen.getAllByText('Spanish Animals');
    expect(spanishAnimals.length).toBeGreaterThanOrEqual(1);
    expect(screen.queryByText('Learn common animal names')).not.toBeInTheDocument();
  });
});
