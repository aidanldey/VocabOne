import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CardPresenter } from './CardPresenter';
import {
  mockImageCard,
  mockDefinitionCard,
  mockAudioCard,
  mockClozeCard,
} from '@/test/mockCards';

describe('CardPresenter', () => {
  const mockOnAnswer = vi.fn();

  afterEach(() => {
    mockOnAnswer.mockClear();
  });

  describe('Card Type Routing', () => {
    it('should render ImageCard for image type', () => {
      render(<CardPresenter card={mockImageCard} onAnswer={mockOnAnswer} />);

      expect(screen.getByText(/image card/i)).toBeInTheDocument();
      expect(screen.getByText(mockImageCard.prompt)).toBeInTheDocument();
    });

    it('should render DefinitionCard for definition type', () => {
      render(<CardPresenter card={mockDefinitionCard} onAnswer={mockOnAnswer} />);

      expect(screen.getByText(/definition card/i)).toBeInTheDocument();
      expect(screen.getByText(/What word matches this definition/i)).toBeInTheDocument();
    });

    it('should render AudioCard for audio type', () => {
      render(<CardPresenter card={mockAudioCard} onAnswer={mockOnAnswer} />);

      expect(screen.getByText(/audio card/i)).toBeInTheDocument();
      expect(screen.getByText(mockAudioCard.prompt)).toBeInTheDocument();
    });

    it('should render ClozeCard for cloze type', () => {
      render(<CardPresenter card={mockClozeCard} onAnswer={mockOnAnswer} />);

      expect(screen.getByText(/cloze card/i)).toBeInTheDocument();
      expect(screen.getByText(/fill in the blank/i)).toBeInTheDocument();
    });
  });

  describe('Card Transitions', () => {
    it('should fade in on mount', async () => {
      const { container } = render(<CardPresenter card={mockImageCard} onAnswer={mockOnAnswer} />);

      const wrapper = container.firstChild as HTMLElement;
      await waitFor(() => {
        expect(wrapper).toHaveClass('opacity-100');
      });
    });

    it('should transition when card changes', async () => {
      const { rerender } = render(
        <CardPresenter card={mockImageCard} onAnswer={mockOnAnswer} />
      );

      await waitFor(() => {
        expect(screen.getByText(/image card/i)).toBeInTheDocument();
      });

      // Change card
      rerender(<CardPresenter card={mockDefinitionCard} onAnswer={mockOnAnswer} />);

      // Should eventually show new card
      await waitFor(() => {
        expect(screen.getByText(/definition card/i)).toBeInTheDocument();
      });
    });
  });

  describe('Answer Submission', () => {
    it('should call onAnswer when answer is submitted from DefinitionCard', async () => {
      render(<CardPresenter card={mockDefinitionCard} onAnswer={mockOnAnswer} />);

      const input = screen.getByPlaceholderText(/type the word/i);
      const submitButton = screen.getByRole('button', { name: /submit answer/i });

      fireEvent.change(input, { target: { value: 'test answer' } });
      fireEvent.click(submitButton);

      expect(mockOnAnswer).toHaveBeenCalledWith('test answer');
    });

    it('should call onAnswer when Enter is pressed', async () => {
      render(<CardPresenter card={mockDefinitionCard} onAnswer={mockOnAnswer} />);

      const input = screen.getByPlaceholderText(/type the word/i);

      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.submit(input.closest('form')!);

      expect(mockOnAnswer).toHaveBeenCalledWith('test');
    });
  });

  describe('Loading and Disabled States', () => {
    it('should disable input when disabled prop is true', () => {
      render(<CardPresenter card={mockDefinitionCard} onAnswer={mockOnAnswer} disabled />);

      const input = screen.getByPlaceholderText(/type the word/i);
      expect(input).toBeDisabled();
    });

    it('should show loading state', () => {
      render(<CardPresenter card={mockDefinitionCard} onAnswer={mockOnAnswer} loading />);

      expect(screen.getByRole('button', { name: /submit answer/i })).toBeDisabled();
    });
  });

  describe('Responsive Design', () => {
    it('should apply responsive padding classes', () => {
      const { container } = render(<CardPresenter card={mockImageCard} onAnswer={mockOnAnswer} />);

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('p-4', 'sm:p-6', 'md:p-8');
    });

    it('should have max-width constraint', () => {
      const { container } = render(<CardPresenter card={mockImageCard} onAnswer={mockOnAnswer} />);

      const cardContainer = container.querySelector('.max-w-4xl');
      expect(cardContainer).toBeInTheDocument();
    });
  });

  describe('Custom className', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <CardPresenter card={mockImageCard} onAnswer={mockOnAnswer} className="custom-class" />
      );

      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper).toHaveClass('custom-class');
    });
  });

  describe('Keyboard Navigation', () => {
    it('should handle Escape key to blur input', () => {
      render(<CardPresenter card={mockDefinitionCard} onAnswer={mockOnAnswer} />);

      const input = screen.getByPlaceholderText(/type the word/i);
      input.focus();
      expect(input).toHaveFocus();

      fireEvent.keyDown(window, { code: 'Escape' });

      expect(input).not.toHaveFocus();
    });
  });

  describe('Development Mode', () => {
    it('should show card ID in development mode', () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'development';

      render(<CardPresenter card={mockImageCard} onAnswer={mockOnAnswer} />);

      expect(screen.getByText(/Card ID:/i)).toBeInTheDocument();
      expect(screen.getByText(mockImageCard.cardId)).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });
  });
});
