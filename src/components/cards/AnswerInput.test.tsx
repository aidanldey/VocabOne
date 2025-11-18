import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AnswerInput } from './AnswerInput';

describe('AnswerInput', () => {
  const mockOnSubmit = vi.fn();

  afterEach(() => {
    mockOnSubmit.mockClear();
  });

  describe('Basic Functionality', () => {
    it('should render input with placeholder', () => {
      render(<AnswerInput onSubmit={mockOnSubmit} placeholder="Test placeholder" />);

      const input = screen.getByPlaceholderText('Test placeholder');
      expect(input).toBeInTheDocument();
    });

    it('should use default placeholder when not provided', () => {
      render(<AnswerInput onSubmit={mockOnSubmit} />);

      const input = screen.getByPlaceholderText(/type your answer/i);
      expect(input).toBeInTheDocument();
    });

    it('should auto-focus by default', () => {
      render(<AnswerInput onSubmit={mockOnSubmit} />);

      const input = screen.getByRole('textbox');
      expect(input).toHaveFocus();
    });

    it('should not auto-focus when autoFocus is false', () => {
      render(<AnswerInput onSubmit={mockOnSubmit} autoFocus={false} />);

      const input = screen.getByRole('textbox');
      expect(input).not.toHaveFocus();
    });
  });

  describe('Input Interaction', () => {
    it('should update value when typing', () => {
      render(<AnswerInput onSubmit={mockOnSubmit} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;

      fireEvent.change(input, { target: { value: 'test answer' } });

      expect(input.value).toBe('test answer');
    });

    it('should show clear button when text is entered', () => {
      render(<AnswerInput onSubmit={mockOnSubmit} />);

      const input = screen.getByRole('textbox');

      // Initially no clear button
      expect(screen.queryByLabelText(/clear input/i)).not.toBeInTheDocument();

      // Type something
      fireEvent.change(input, { target: { value: 'test' } });

      // Clear button appears
      expect(screen.getByLabelText(/clear input/i)).toBeInTheDocument();
    });

    it('should clear input when clear button is clicked', () => {
      render(<AnswerInput onSubmit={mockOnSubmit} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;

      fireEvent.change(input, { target: { value: 'test' } });
      expect(input.value).toBe('test');

      const clearButton = screen.getByLabelText(/clear input/i);
      fireEvent.click(clearButton);

      expect(input.value).toBe('');
    });

    it('should re-focus input after clearing', () => {
      render(<AnswerInput onSubmit={mockOnSubmit} />);

      const input = screen.getByRole('textbox');

      fireEvent.change(input, { target: { value: 'test' } });
      input.blur();

      const clearButton = screen.getByLabelText(/clear input/i);
      fireEvent.click(clearButton);

      expect(input).toHaveFocus();
    });
  });

  describe('Form Submission', () => {
    it('should call onSubmit when form is submitted', () => {
      render(<AnswerInput onSubmit={mockOnSubmit} />);

      const input = screen.getByRole('textbox');
      const form = input.closest('form')!;

      fireEvent.change(input, { target: { value: 'test answer' } });
      fireEvent.submit(form);

      expect(mockOnSubmit).toHaveBeenCalledWith('test answer');
    });

    it('should trim whitespace from answer', () => {
      render(<AnswerInput onSubmit={mockOnSubmit} />);

      const input = screen.getByRole('textbox');
      const form = input.closest('form')!;

      fireEvent.change(input, { target: { value: '  test answer  ' } });
      fireEvent.submit(form);

      expect(mockOnSubmit).toHaveBeenCalledWith('test answer');
    });

    it('should not submit empty or whitespace-only answers', () => {
      render(<AnswerInput onSubmit={mockOnSubmit} />);

      const input = screen.getByRole('textbox');
      const form = input.closest('form')!;

      // Try to submit empty
      fireEvent.submit(form);
      expect(mockOnSubmit).not.toHaveBeenCalled();

      // Try to submit whitespace only
      fireEvent.change(input, { target: { value: '   ' } });
      fireEvent.submit(form);
      expect(mockOnSubmit).not.toHaveBeenCalled();
    });

    it('should clear input after successful submission', () => {
      render(<AnswerInput onSubmit={mockOnSubmit} />);

      const input = screen.getByRole('textbox') as HTMLInputElement;
      const form = input.closest('form')!;

      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.submit(form);

      expect(input.value).toBe('');
    });

    it('should call onSubmit when submit button is clicked', () => {
      render(<AnswerInput onSubmit={mockOnSubmit} />);

      const input = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /submit answer/i });

      fireEvent.change(input, { target: { value: 'test' } });
      fireEvent.click(submitButton);

      expect(mockOnSubmit).toHaveBeenCalledWith('test');
    });
  });

  describe('Disabled State', () => {
    it('should disable input when disabled prop is true', () => {
      render(<AnswerInput onSubmit={mockOnSubmit} disabled />);

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should disable submit button when disabled', () => {
      render(<AnswerInput onSubmit={mockOnSubmit} disabled />);

      const submitButton = screen.getByRole('button', { name: /submit answer/i });
      expect(submitButton).toBeDisabled();
    });

    it('should not submit when disabled', () => {
      render(<AnswerInput onSubmit={mockOnSubmit} disabled />);

      const form = screen.getByRole('textbox').closest('form')!;
      fireEvent.submit(form);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Loading State', () => {
    it('should disable input when loading', () => {
      render(<AnswerInput onSubmit={mockOnSubmit} loading />);

      const input = screen.getByRole('textbox');
      expect(input).toBeDisabled();
    });

    it('should show loading spinner in submit button', () => {
      render(<AnswerInput onSubmit={mockOnSubmit} loading />);

      const submitButton = screen.getByRole('button', { name: /submit answer/i });
      const spinner = submitButton.querySelector('svg.animate-spin');

      expect(spinner).toBeInTheDocument();
    });

    it('should hide clear button when loading', () => {
      render(<AnswerInput onSubmit={mockOnSubmit} />);

      const input = screen.getByRole('textbox');
      fireEvent.change(input, { target: { value: 'test' } });

      // Clear button visible
      expect(screen.getByLabelText(/clear input/i)).toBeInTheDocument();

      // Re-render with loading
      const { rerender } = render(<AnswerInput onSubmit={mockOnSubmit} loading />);

      // Clear button hidden
      expect(screen.queryByLabelText(/clear input/i)).not.toBeInTheDocument();
    });

    it('should not submit when loading', () => {
      render(<AnswerInput onSubmit={mockOnSubmit} loading />);

      const form = screen.getByRole('textbox').closest('form')!;
      fireEvent.submit(form);

      expect(mockOnSubmit).not.toHaveBeenCalled();
    });
  });

  describe('Submit Button State', () => {
    it('should disable submit button when input is empty', () => {
      render(<AnswerInput onSubmit={mockOnSubmit} />);

      const submitButton = screen.getByRole('button', { name: /submit answer/i });
      expect(submitButton).toBeDisabled();
    });

    it('should enable submit button when input has text', () => {
      render(<AnswerInput onSubmit={mockOnSubmit} />);

      const input = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /submit answer/i });

      fireEvent.change(input, { target: { value: 'test' } });

      expect(submitButton).not.toBeDisabled();
    });

    it('should disable submit button for whitespace-only input', () => {
      render(<AnswerInput onSubmit={mockOnSubmit} />);

      const input = screen.getByRole('textbox');
      const submitButton = screen.getByRole('button', { name: /submit answer/i });

      fireEvent.change(input, { target: { value: '   ' } });

      expect(submitButton).toBeDisabled();
    });
  });

  describe('Accessibility', () => {
    it('should have proper aria labels', () => {
      render(<AnswerInput onSubmit={mockOnSubmit} />);

      expect(screen.getByLabelText(/answer input/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/submit answer/i)).toBeInTheDocument();
    });

    it('should show keyboard hint', () => {
      render(<AnswerInput onSubmit={mockOnSubmit} />);

      expect(screen.getByText(/press/i)).toBeInTheDocument();
      expect(screen.getByText(/enter/i)).toBeInTheDocument();
    });
  });
});
