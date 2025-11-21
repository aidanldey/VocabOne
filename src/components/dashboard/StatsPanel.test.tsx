import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StatsPanel } from './StatsPanel';

describe('StatsPanel', () => {
  const mockStats = {
    wordsLearned: 150,
    streak: 7,
    reviewsToday: 25,
    accuracy: 92,
  };

  it('should render all stat cards', () => {
    render(<StatsPanel {...mockStats} />);

    expect(screen.getByText('Words Learned')).toBeInTheDocument();
    expect(screen.getByText('Day Streak')).toBeInTheDocument();
    expect(screen.getByText("Today's Reviews")).toBeInTheDocument();
    expect(screen.getByText('Accuracy')).toBeInTheDocument();
  });

  it('should display words learned count', () => {
    render(<StatsPanel {...mockStats} />);

    expect(screen.getByText('150')).toBeInTheDocument();
  });

  it('should display streak count', () => {
    render(<StatsPanel {...mockStats} />);

    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('should display reviews today count', () => {
    render(<StatsPanel {...mockStats} />);

    expect(screen.getByText('25')).toBeInTheDocument();
  });

  it('should display accuracy percentage', () => {
    render(<StatsPanel {...mockStats} />);

    expect(screen.getByText('92%')).toBeInTheDocument();
  });

  it('should handle zero values', () => {
    render(
      <StatsPanel wordsLearned={0} streak={0} reviewsToday={0} accuracy={0} />
    );

    // Multiple zeros in different cards, so use getAllByText
    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBe(3); // Words learned, streak, reviews today
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('should handle 100% accuracy', () => {
    render(<StatsPanel {...mockStats} accuracy={100} />);

    expect(screen.getByText('100%')).toBeInTheDocument();
  });

  it('should display icons for each stat', () => {
    const { container } = render(<StatsPanel {...mockStats} />);

    // Each stat card should have an icon (svg)
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThanOrEqual(4);
  });

  it('should have responsive grid layout', () => {
    const { container } = render(<StatsPanel {...mockStats} />);

    const grid = container.querySelector('.grid');
    expect(grid).toHaveClass('grid-cols-1');
    expect(grid).toHaveClass('sm:grid-cols-2');
    expect(grid).toHaveClass('lg:grid-cols-4');
  });

  it('should apply correct color scheme to words learned', () => {
    const { container } = render(<StatsPanel {...mockStats} />);

    const blueIcons = container.querySelectorAll('.bg-blue-50');
    expect(blueIcons.length).toBeGreaterThan(0);
  });

  it('should apply correct color scheme to streak', () => {
    const { container } = render(<StatsPanel {...mockStats} />);

    const orangeIcons = container.querySelectorAll('.bg-orange-50');
    expect(orangeIcons.length).toBeGreaterThan(0);
  });

  it('should apply correct color scheme to reviews', () => {
    const { container } = render(<StatsPanel {...mockStats} />);

    const greenIcons = container.querySelectorAll('.bg-green-50');
    expect(greenIcons.length).toBeGreaterThan(0);
  });

  it('should apply correct color scheme to accuracy', () => {
    const { container } = render(<StatsPanel {...mockStats} />);

    const purpleIcons = container.querySelectorAll('.bg-purple-50');
    expect(purpleIcons.length).toBeGreaterThan(0);
  });

  it('should render with large numbers', () => {
    render(
      <StatsPanel
        wordsLearned={9999}
        streak={365}
        reviewsToday={999}
        accuracy={99}
      />
    );

    expect(screen.getByText('9999')).toBeInTheDocument();
    expect(screen.getByText('365')).toBeInTheDocument();
    expect(screen.getByText('999')).toBeInTheDocument();
    expect(screen.getByText('99%')).toBeInTheDocument();
  });
});
