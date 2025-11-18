import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ImageCard } from './ImageCard';
import { mockImageCard } from '@/test/mockCards';

describe('ImageCard', () => {
  const mockOnAnswer = vi.fn();

  afterEach(() => {
    mockOnAnswer.mockClear();
  });

  describe('Content Display', () => {
    it('should render prompt', () => {
      render(<ImageCard card={mockImageCard} onAnswer={mockOnAnswer} />);

      expect(screen.getByText(mockImageCard.prompt)).toBeInTheDocument();
    });

    it('should render hint when provided', () => {
      render(<ImageCard card={mockImageCard} onAnswer={mockOnAnswer} />);

      if (mockImageCard.hint) {
        expect(screen.getByText(new RegExp(mockImageCard.hint, 'i'))).toBeInTheDocument();
      }
    });

    it('should render image with correct src and alt', () => {
      render(<ImageCard card={mockImageCard} onAnswer={mockOnAnswer} />);

      const image = screen.getByAltText(mockImageCard.altText) as HTMLImageElement;
      expect(image).toBeInTheDocument();
      expect(image.src).toContain(mockImageCard.imageUrl);
    });

    it('should render tags when provided', () => {
      render(<ImageCard card={mockImageCard} onAnswer={mockOnAnswer} />);

      if (mockImageCard.tags && mockImageCard.tags.length > 0) {
        mockImageCard.tags.forEach((tag) => {
          expect(screen.getByText(tag)).toBeInTheDocument();
        });
      }
    });
  });

  describe('Image Loading States', () => {
    it('should show loading state initially', () => {
      render(<ImageCard card={mockImageCard} onAnswer={mockOnAnswer} />);

      expect(screen.getByText(/loading image/i)).toBeInTheDocument();
    });

    it('should hide loading state when image loads', async () => {
      render(<ImageCard card={mockImageCard} onAnswer={mockOnAnswer} />);

      const image = screen.getByAltText(mockImageCard.altText);

      // Simulate image load
      fireEvent.load(image);

      await waitFor(() => {
        expect(screen.queryByText(/loading image/i)).not.toBeInTheDocument();
      });
    });

    it('should show error state when image fails to load', async () => {
      render(<ImageCard card={mockImageCard} onAnswer={mockOnAnswer} />);

      const image = screen.getByAltText(mockImageCard.altText);

      // Simulate image error
      fireEvent.error(image);

      await waitFor(() => {
        expect(screen.getByText(/failed to load image/i)).toBeInTheDocument();
      });
    });

    it('should disable input while image is loading', () => {
      render(<ImageCard card={mockImageCard} onAnswer={mockOnAnswer} />);

      const input = screen.getByPlaceholderText(/type your answer/i);
      expect(input).toBeDisabled();
    });

    it('should enable input when image loads', async () => {
      render(<ImageCard card={mockImageCard} onAnswer={mockOnAnswer} />);

      const image = screen.getByAltText(mockImageCard.altText);
      const input = screen.getByPlaceholderText(/type your answer/i);

      // Initially disabled
      expect(input).toBeDisabled();

      // Simulate image load
      fireEvent.load(image);

      await waitFor(() => {
        expect(input).not.toBeDisabled();
      });
    });
  });

  describe('Answer Submission', () => {
    it('should call onAnswer when answer is submitted', async () => {
      render(<ImageCard card={mockImageCard} onAnswer={mockOnAnswer} />);

      // Load image first
      const image = screen.getByAltText(mockImageCard.altText);
      fireEvent.load(image);

      await waitFor(() => {
        const input = screen.getByPlaceholderText(/type your answer/i);
        expect(input).not.toBeDisabled();
      });

      const input = screen.getByPlaceholderText(/type your answer/i);
      const submitButton = screen.getByRole('button', { name: /submit answer/i });

      fireEvent.change(input, { target: { value: 'dog' } });
      fireEvent.click(submitButton);

      expect(mockOnAnswer).toHaveBeenCalledWith('dog');
    });
  });

  describe('Disabled and Loading States', () => {
    it('should disable input when disabled prop is true', async () => {
      render(<ImageCard card={mockImageCard} onAnswer={mockOnAnswer} disabled />);

      // Load image
      const image = screen.getByAltText(mockImageCard.altText);
      fireEvent.load(image);

      await waitFor(() => {
        const input = screen.getByPlaceholderText(/type your answer/i);
        expect(input).toBeDisabled();
      });
    });

    it('should show loading state on submit button', async () => {
      render(<ImageCard card={mockImageCard} onAnswer={mockOnAnswer} loading />);

      // Load image
      const image = screen.getByAltText(mockImageCard.altText);
      fireEvent.load(image);

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: /submit answer/i });
        expect(submitButton).toBeDisabled();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should have responsive max-width', () => {
      const { container } = render(<ImageCard card={mockImageCard} onAnswer={mockOnAnswer} />);

      const cardContainer = container.querySelector('.max-w-2xl');
      expect(cardContainer).toBeInTheDocument();
    });

    it('should have aspect-video for image container', () => {
      const { container } = render(<ImageCard card={mockImageCard} onAnswer={mockOnAnswer} />);

      const imageContainer = container.querySelector('.aspect-video');
      expect(imageContainer).toBeInTheDocument();
    });
  });
});
