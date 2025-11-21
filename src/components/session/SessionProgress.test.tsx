import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SessionProgress } from './SessionProgress';

describe('SessionProgress', () => {
  describe('Card count display', () => {
    it('should show current card and total', () => {
      render(
        <SessionProgress
          currentIndex={5}
          totalCards={10}
          correctCount={0}
          incorrectCount={0}
        />
      );

      expect(screen.getByText(/Card 6 of 10/i)).toBeInTheDocument();
    });

    it('should show cards remaining', () => {
      render(
        <SessionProgress
          currentIndex={3}
          totalCards={10}
          correctCount={0}
          incorrectCount={0}
        />
      );

      expect(screen.getByText(/7 remaining/i)).toBeInTheDocument();
    });

    it('should handle first card', () => {
      render(
        <SessionProgress
          currentIndex={0}
          totalCards={10}
          correctCount={0}
          incorrectCount={0}
        />
      );

      expect(screen.getByText(/Card 1 of 10/i)).toBeInTheDocument();
      expect(screen.getByText(/10 remaining/i)).toBeInTheDocument();
    });

    it('should handle last card', () => {
      render(
        <SessionProgress
          currentIndex={9}
          totalCards={10}
          correctCount={0}
          incorrectCount={0}
        />
      );

      expect(screen.getByText(/Card 10 of 10/i)).toBeInTheDocument();
      expect(screen.getByText(/1 remaining/i)).toBeInTheDocument();
    });
  });

  describe('Progress bar', () => {
    it('should render progress bar', () => {
      render(
        <SessionProgress
          currentIndex={5}
          totalCards={10}
          correctCount={0}
          incorrectCount={0}
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toBeInTheDocument();
    });

    it('should calculate correct progress percentage', () => {
      const { container } = render(
        <SessionProgress
          currentIndex={5}
          totalCards={10}
          correctCount={0}
          incorrectCount={0}
        />
      );

      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveStyle({ width: '50%' });
    });

    it('should show 0% at start', () => {
      const { container } = render(
        <SessionProgress
          currentIndex={0}
          totalCards={10}
          correctCount={0}
          incorrectCount={0}
        />
      );

      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveStyle({ width: '0%' });
    });

    it('should show 100% at end', () => {
      const { container } = render(
        <SessionProgress
          currentIndex={10}
          totalCards={10}
          correctCount={0}
          incorrectCount={0}
        />
      );

      const progressBar = container.querySelector('[role="progressbar"]');
      expect(progressBar).toHaveStyle({ width: '100%' });
    });
  });

  describe('Stats display', () => {
    it('should show stats when answers have been recorded', () => {
      render(
        <SessionProgress
          currentIndex={5}
          totalCards={10}
          correctCount={3}
          incorrectCount={2}
        />
      );

      expect(screen.getByText(/3 correct/i)).toBeInTheDocument();
      expect(screen.getByText(/2 incorrect/i)).toBeInTheDocument();
    });

    it('should not show stats when no answers recorded', () => {
      render(
        <SessionProgress
          currentIndex={0}
          totalCards={10}
          correctCount={0}
          incorrectCount={0}
        />
      );

      expect(screen.queryByText(/correct/i)).not.toBeInTheDocument();
      expect(screen.queryByText(/incorrect/i)).not.toBeInTheDocument();
    });

    it('should show stats with only correct answers', () => {
      render(
        <SessionProgress
          currentIndex={3}
          totalCards={10}
          correctCount={3}
          incorrectCount={0}
        />
      );

      expect(screen.getByText(/3 correct/i)).toBeInTheDocument();
      expect(screen.getByText(/0 incorrect/i)).toBeInTheDocument();
    });

    it('should show stats with only incorrect answers', () => {
      render(
        <SessionProgress
          currentIndex={3}
          totalCards={10}
          correctCount={0}
          incorrectCount={3}
        />
      );

      expect(screen.getByText(/0 correct/i)).toBeInTheDocument();
      expect(screen.getByText(/3 incorrect/i)).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA attributes on progress bar', () => {
      render(
        <SessionProgress
          currentIndex={5}
          totalCards={10}
          correctCount={0}
          incorrectCount={0}
        />
      );

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '5');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '10');
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <SessionProgress
          currentIndex={0}
          totalCards={10}
          correctCount={0}
          incorrectCount={0}
          className="custom-class"
        />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class');
    });
  });
});
