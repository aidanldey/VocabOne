import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ModuleCard } from './ModuleCard';

describe('ModuleCard', () => {
  const mockModule = {
    moduleId: 'spanish-animals',
    title: 'Spanish Animals',
    description: 'Learn common animal names in Spanish',
    progress: 65,
    dueCount: 12,
    totalEntries: 50,
  };

  it('should render module information', () => {
    render(<ModuleCard {...mockModule} />);

    expect(screen.getByText('Spanish Animals')).toBeInTheDocument();
    expect(screen.getByText('Learn common animal names in Spanish')).toBeInTheDocument();
    expect(screen.getByText('50 words')).toBeInTheDocument();
    expect(screen.getByText('65% learned')).toBeInTheDocument();
  });

  it('should display due count badge when cards are due', () => {
    render(<ModuleCard {...mockModule} />);

    expect(screen.getByText('12 due')).toBeInTheDocument();
  });

  it('should not display due count badge when no cards are due', () => {
    render(<ModuleCard {...mockModule} dueCount={0} />);

    expect(screen.queryByText('due')).not.toBeInTheDocument();
  });

  it('should show progress bar with correct width', () => {
    const { container } = render(<ModuleCard {...mockModule} />);

    const progressBar = container.querySelector('[style*="width: 65%"]');
    expect(progressBar).toBeInTheDocument();
  });

  it('should use green color for 100% progress', () => {
    const { container } = render(<ModuleCard {...mockModule} progress={100} />);

    const progressBar = container.querySelector('.bg-green-500');
    expect(progressBar).toBeInTheDocument();
  });

  it('should use blue color for 50-99% progress', () => {
    const { container } = render(<ModuleCard {...mockModule} progress={75} />);

    const progressBar = container.querySelector('.bg-blue-500');
    expect(progressBar).toBeInTheDocument();
  });

  it('should use yellow color for <50% progress', () => {
    const { container } = render(<ModuleCard {...mockModule} progress={25} />);

    const progressBar = container.querySelector('.bg-yellow-500');
    expect(progressBar).toBeInTheDocument();
  });

  it('should call onClick when clicked', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<ModuleCard {...mockModule} onClick={onClick} />);

    const card = screen.getByRole('button');
    await user.click(card);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should call onClick when Enter key is pressed', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<ModuleCard {...mockModule} onClick={onClick} />);

    const card = screen.getByRole('button');
    card.focus();
    await user.keyboard('{Enter}');

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should call onClick when Space key is pressed', async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();

    render(<ModuleCard {...mockModule} onClick={onClick} />);

    const card = screen.getByRole('button');
    card.focus();
    await user.keyboard(' ');

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should show selected state when isSelected is true', () => {
    const { container } = render(<ModuleCard {...mockModule} isSelected={true} />);

    expect(container.querySelector('.border-blue-500')).toBeInTheDocument();
    expect(container.querySelector('.bg-blue-50')).toBeInTheDocument();
  });

  it('should not show selected state when isSelected is false', () => {
    const { container } = render(<ModuleCard {...mockModule} isSelected={false} />);

    expect(container.querySelector('.border-gray-200')).toBeInTheDocument();
    expect(container.querySelector('.bg-white')).toBeInTheDocument();
  });

  it('should display image when imageUrl is provided', () => {
    render(<ModuleCard {...mockModule} imageUrl="https://example.com/image.jpg" />);

    const img = screen.getByAltText('Spanish Animals');
    expect(img).toHaveAttribute('src', 'https://example.com/image.jpg');
  });

  it('should display placeholder when imageUrl is not provided', () => {
    const { container } = render(<ModuleCard {...mockModule} />);

    expect(container.querySelector('.bg-gradient-to-br')).toBeInTheDocument();
  });

  it('should have accessible label', () => {
    render(<ModuleCard {...mockModule} />);

    const card = screen.getByRole('button');
    expect(card).toHaveAttribute(
      'aria-label',
      'Spanish Animals module, 65% complete, 12 cards due'
    );
  });

  it('should handle missing description gracefully', () => {
    render(<ModuleCard {...mockModule} description={undefined} />);

    expect(screen.getByText('Spanish Animals')).toBeInTheDocument();
    expect(screen.queryByText('Learn common animal names in Spanish')).not.toBeInTheDocument();
  });
});
