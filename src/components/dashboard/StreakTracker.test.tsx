import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StreakTracker } from './StreakTracker';
import type { StudyDay } from '../../hooks/useStatistics';

describe('StreakTracker', () => {
  const mockStudyDays: StudyDay[] = [
    { date: '2025-01-01', reviewCount: 20, isStudied: true },
    { date: '2025-01-02', reviewCount: 25, isStudied: true },
    { date: '2025-01-03', reviewCount: 30, isStudied: true },
    { date: '2025-01-04', reviewCount: 0, isStudied: false },
    { date: '2025-01-05', reviewCount: 40, isStudied: true },
  ];

  it('should render streak title', () => {
    render(
      <StreakTracker currentStreak={3} bestStreak={5} studyDays={mockStudyDays} />
    );

    expect(screen.getByText('Study Streak')).toBeInTheDocument();
  });

  it('should display current streak', () => {
    render(
      <StreakTracker currentStreak={7} bestStreak={10} studyDays={mockStudyDays} />
    );

    expect(screen.getByText('7')).toBeInTheDocument();
    expect(screen.getByText('Current Streak')).toBeInTheDocument();
  });

  it('should display best streak', () => {
    render(
      <StreakTracker currentStreak={5} bestStreak={15} studyDays={mockStudyDays} />
    );

    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('Best Streak')).toBeInTheDocument();
  });

  it('should show fire emoji for current streak', () => {
    render(
      <StreakTracker currentStreak={3} bestStreak={5} studyDays={mockStudyDays} />
    );

    expect(screen.getByText('🔥')).toBeInTheDocument();
  });

  it('should show last 90 days label', () => {
    render(
      <StreakTracker currentStreak={3} bestStreak={5} studyDays={mockStudyDays} />
    );

    expect(screen.getByText('Last 90 Days')).toBeInTheDocument();
  });

  it('should show empty state when no study history', () => {
    render(
      <StreakTracker currentStreak={0} bestStreak={0} studyDays={[]} />
    );

    expect(screen.getByText('No study history yet')).toBeInTheDocument();
    expect(screen.getByText('Start studying to build your streak!')).toBeInTheDocument();
  });

  it('should show motivational message for streak of 1', () => {
    render(
      <StreakTracker currentStreak={1} bestStreak={1} studyDays={mockStudyDays} />
    );

    expect(screen.getByText(/Great start! Keep going to build your streak/i)).toBeInTheDocument();
  });

  it('should show different motivational message for streak 2-6', () => {
    render(
      <StreakTracker currentStreak={5} bestStreak={5} studyDays={mockStudyDays} />
    );

    expect(screen.getByText(/Nice! You're on a roll/i)).toBeInTheDocument();
  });

  it('should show different motivational message for streak 7-29', () => {
    render(
      <StreakTracker currentStreak={10} bestStreak={10} studyDays={mockStudyDays} />
    );

    expect(screen.getByText(/Impressive streak! Keep it up/i)).toBeInTheDocument();
  });

  it('should show different motivational message for streak 30-99', () => {
    render(
      <StreakTracker currentStreak={50} bestStreak={50} studyDays={mockStudyDays} />
    );

    expect(screen.getByText(/Amazing dedication! You're crushing it/i)).toBeInTheDocument();
  });

  it('should show different motivational message for streak 100+', () => {
    render(
      <StreakTracker currentStreak={150} bestStreak={150} studyDays={mockStudyDays} />
    );

    expect(screen.getByText(/Legendary streak! You're an inspiration/i)).toBeInTheDocument();
  });

  it('should not show motivational message when streak is 0', () => {
    render(
      <StreakTracker currentStreak={0} bestStreak={5} studyDays={mockStudyDays} />
    );

    expect(screen.queryByText(/Great start!/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Nice!/i)).not.toBeInTheDocument();
  });

  it('should display day of week labels', () => {
    render(
      <StreakTracker currentStreak={3} bestStreak={5} studyDays={mockStudyDays} />
    );

    expect(screen.getByText('Sun')).toBeInTheDocument();
    expect(screen.getByText('Mon')).toBeInTheDocument();
    expect(screen.getByText('Tue')).toBeInTheDocument();
    expect(screen.getByText('Wed')).toBeInTheDocument();
    expect(screen.getByText('Thu')).toBeInTheDocument();
    expect(screen.getByText('Fri')).toBeInTheDocument();
    expect(screen.getByText('Sat')).toBeInTheDocument();
  });

  it('should display legend', () => {
    render(
      <StreakTracker currentStreak={3} bestStreak={5} studyDays={mockStudyDays} />
    );

    expect(screen.getByText('Less')).toBeInTheDocument();
    expect(screen.getByText('More')).toBeInTheDocument();
  });

  it('should render calendar heatmap', () => {
    const { container } = render(
      <StreakTracker currentStreak={3} bestStreak={5} studyDays={mockStudyDays} />
    );

    // Check for calendar grid squares
    const squares = container.querySelectorAll('.w-3.h-3');
    expect(squares.length).toBeGreaterThan(0);
  });

  it('should handle zero streaks', () => {
    render(
      <StreakTracker currentStreak={0} bestStreak={0} studyDays={mockStudyDays} />
    );

    const zeros = screen.getAllByText('0');
    expect(zeros.length).toBe(2); // Current and best streak both show 0
  });

  it('should show correct colors for different review counts', () => {
    const variedDays: StudyDay[] = [
      { date: '2025-01-01', reviewCount: 0, isStudied: false },   // gray
      { date: '2025-01-02', reviewCount: 3, isStudied: true },    // lightest orange
      { date: '2025-01-03', reviewCount: 10, isStudied: true },   // light orange
      { date: '2025-01-04', reviewCount: 20, isStudied: true },   // medium orange
      { date: '2025-01-05', reviewCount: 35, isStudied: true },   // dark orange
      { date: '2025-01-06', reviewCount: 55, isStudied: true },   // darkest orange
    ];

    const { container } = render(
      <StreakTracker currentStreak={5} bestStreak={5} studyDays={variedDays} />
    );

    // Check for different color classes
    expect(container.querySelector('.bg-gray-100')).toBeInTheDocument();
    expect(container.querySelector('.bg-orange-100')).toBeInTheDocument();
    expect(container.querySelector('.bg-orange-200')).toBeInTheDocument();
    expect(container.querySelector('.bg-orange-300')).toBeInTheDocument();
    expect(container.querySelector('.bg-orange-400')).toBeInTheDocument();
    expect(container.querySelector('.bg-orange-500')).toBeInTheDocument();
  });
});
