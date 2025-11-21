import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ProgressChart } from './ProgressChart';
import type { ProgressDataPoint } from '../../hooks/useStatistics';

describe('ProgressChart', () => {
  const mockData: ProgressDataPoint[] = [
    { date: '2025-01-01', wordsLearned: 10, reviewsCompleted: 20, accuracy: 85 },
    { date: '2025-01-02', wordsLearned: 15, reviewsCompleted: 25, accuracy: 90 },
    { date: '2025-01-03', wordsLearned: 22, reviewsCompleted: 30, accuracy: 88 },
    { date: '2025-01-04', wordsLearned: 28, reviewsCompleted: 35, accuracy: 92 },
    { date: '2025-01-05', wordsLearned: 35, reviewsCompleted: 40, accuracy: 87 },
  ];

  it('should render chart title', () => {
    render(
      <ProgressChart
        data={mockData}
        estimatedDaysToComplete={10}
        currentWordsLearned={35}
      />
    );

    expect(screen.getByText('Progress Over Time')).toBeInTheDocument();
  });

  it('should render view selector buttons', () => {
    render(
      <ProgressChart
        data={mockData}
        estimatedDaysToComplete={10}
        currentWordsLearned={35}
      />
    );

    expect(screen.getByRole('button', { name: 'Words Learned' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Accuracy' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Reviews' })).toBeInTheDocument();
  });

  it('should show words learned view by default', () => {
    render(
      <ProgressChart
        data={mockData}
        estimatedDaysToComplete={10}
        currentWordsLearned={35}
      />
    );

    const button = screen.getByRole('button', { name: 'Words Learned' });
    expect(button).toHaveClass('bg-blue-600');
  });

  it('should switch to accuracy view when clicked', async () => {
    const user = userEvent.setup();

    render(
      <ProgressChart
        data={mockData}
        estimatedDaysToComplete={10}
        currentWordsLearned={35}
      />
    );

    const accuracyButton = screen.getByRole('button', { name: 'Accuracy' });
    await user.click(accuracyButton);

    expect(accuracyButton).toHaveClass('bg-blue-600');
  });

  it('should switch to reviews view when clicked', async () => {
    const user = userEvent.setup();

    render(
      <ProgressChart
        data={mockData}
        estimatedDaysToComplete={10}
        currentWordsLearned={35}
      />
    );

    const reviewsButton = screen.getByRole('button', { name: 'Reviews' });
    await user.click(reviewsButton);

    expect(reviewsButton).toHaveClass('bg-blue-600');
  });

  it('should show empty state when no data', () => {
    render(
      <ProgressChart
        data={[]}
        estimatedDaysToComplete={null}
        currentWordsLearned={0}
      />
    );

    expect(screen.getByText('No progress data yet')).toBeInTheDocument();
    expect(screen.getByText('Start studying to see your progress')).toBeInTheDocument();
  });

  it('should show forecast info when available', () => {
    render(
      <ProgressChart
        data={mockData}
        estimatedDaysToComplete={15}
        currentWordsLearned={35}
      />
    );

    expect(screen.getByText(/complete this module in approximately/i)).toBeInTheDocument();
    expect(screen.getByText(/15 days/i)).toBeInTheDocument();
  });

  it('should not show forecast when not available', () => {
    render(
      <ProgressChart
        data={mockData}
        estimatedDaysToComplete={null}
        currentWordsLearned={35}
      />
    );

    expect(screen.queryByText(/complete this module in approximately/i)).not.toBeInTheDocument();
  });

  it('should not show forecast in non-words-learned view', async () => {
    const user = userEvent.setup();

    render(
      <ProgressChart
        data={mockData}
        estimatedDaysToComplete={15}
        currentWordsLearned={35}
      />
    );

    // Forecast should be visible initially
    expect(screen.getByText(/complete this module in approximately/i)).toBeInTheDocument();

    // Click accuracy view
    const accuracyButton = screen.getByRole('button', { name: 'Accuracy' });
    await user.click(accuracyButton);

    // Forecast should not be visible in accuracy view
    expect(screen.queryByText(/complete this module in approximately/i)).not.toBeInTheDocument();
  });

  it('should render chart with data', () => {
    const { container } = render(
      <ProgressChart
        data={mockData}
        estimatedDaysToComplete={10}
        currentWordsLearned={35}
      />
    );

    // Check for recharts elements
    const chart = container.querySelector('.recharts-responsive-container');
    expect(chart).toBeInTheDocument();
  });

  it('should handle minimal data', () => {
    const minimalData: ProgressDataPoint[] = [
      { date: '2025-01-01', wordsLearned: 5, reviewsCompleted: 10, accuracy: 80 },
    ];

    const { container } = render(
      <ProgressChart
        data={minimalData}
        estimatedDaysToComplete={null}
        currentWordsLearned={5}
      />
    );

    const chart = container.querySelector('.recharts-responsive-container');
    expect(chart).toBeInTheDocument();
  });
});
