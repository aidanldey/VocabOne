import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ModuleManager, type ModuleWithProgress } from './ModuleManager';

describe('ModuleManager', () => {
  const mockModules: ModuleWithProgress[] = [
    {
      moduleId: 'spanish-basics',
      title: 'Spanish Basics',
      language: 'es',
      version: '1.0.0',
      description: 'Basic Spanish vocabulary',
      entries: [
        {
          entryId: 'es-001',
          term: 'hola',
          cards: [
            {
              cardId: 'es-001-def-01',
              type: 'definition' as any,
              definition: 'hello',
              expectedAnswer: 'hola',
            },
          ],
        },
        {
          entryId: 'es-002',
          term: 'adiós',
          cards: [
            {
              cardId: 'es-002-def-01',
              type: 'definition' as any,
              definition: 'goodbye',
              expectedAnswer: 'adiós',
            },
          ],
        },
      ],
      stats: {
        totalWords: 2,
        masteredWords: 1,
        progressPercentage: 50,
        lastStudied: '2 days ago',
      },
    },
    {
      moduleId: 'french-basics',
      title: 'French Basics',
      language: 'fr',
      version: '1.0.0',
      entries: [
        {
          entryId: 'fr-001',
          term: 'bonjour',
          cards: [
            {
              cardId: 'fr-001-def-01',
              type: 'definition' as any,
              definition: 'hello',
              expectedAnswer: 'bonjour',
            },
          ],
        },
      ],
      stats: {
        totalWords: 1,
        masteredWords: 0,
        progressPercentage: 0,
      },
    },
  ];

  const mockCallbacks = {
    onImport: vi.fn(),
    onDelete: vi.fn(),
    onResetProgress: vi.fn(),
    onViewDetails: vi.fn(),
    onStudy: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Empty State', () => {
    it('should show empty state when no modules', () => {
      render(<ModuleManager modules={[]} />);

      expect(screen.getByText('No Modules Yet')).toBeInTheDocument();
      expect(screen.getByText(/Get started by importing/i)).toBeInTheDocument();
    });

    it('should show import button in empty state when onImport provided', () => {
      render(<ModuleManager modules={[]} onImport={mockCallbacks.onImport} />);

      expect(screen.getByText('Import Module')).toBeInTheDocument();
    });

    it('should show sample modules link in empty state', () => {
      render(<ModuleManager modules={[]} />);

      const link = screen.getByText('Browse Sample Modules');
      expect(link).toBeInTheDocument();
      expect(link.closest('a')).toHaveAttribute('href', 'https://github.com/vocabone/sample-modules');
    });

    it('should call onImport when import button clicked in empty state', () => {
      render(<ModuleManager modules={[]} onImport={mockCallbacks.onImport} />);

      fireEvent.click(screen.getByText('Import Module'));
      expect(mockCallbacks.onImport).toHaveBeenCalledTimes(1);
    });
  });

  describe('Module Display', () => {
    it('should display modules in grid view by default', () => {
      render(<ModuleManager modules={mockModules} />);

      expect(screen.getByText('Spanish Basics')).toBeInTheDocument();
      expect(screen.getByText('French Basics')).toBeInTheDocument();
    });

    it('should show module count', () => {
      render(<ModuleManager modules={mockModules} />);

      expect(screen.getByText('2 of 2 modules')).toBeInTheDocument();
    });

    it('should show language badges', () => {
      render(<ModuleManager modules={mockModules} />);

      expect(screen.getAllByText('ES')).toHaveLength(1);
      expect(screen.getAllByText('FR')).toHaveLength(1);
    });

    it('should show entry and card counts', () => {
      render(<ModuleManager modules={mockModules} />);

      // Check that entry counts are displayed (text may be broken across elements)
      const entriesText = screen.getAllByText('entries');
      expect(entriesText.length).toBeGreaterThan(0);

      const cardsText = screen.getAllByText('cards');
      expect(cardsText.length).toBeGreaterThan(0);
    });

    it('should show progress bars when stats available', () => {
      const { container } = render(<ModuleManager modules={mockModules} />);

      const progressBars = container.querySelectorAll('.bg-orange-500');
      expect(progressBars.length).toBeGreaterThan(0);
    });

    it('should show progress percentages', () => {
      render(<ModuleManager modules={mockModules} />);

      expect(screen.getByText('50%')).toBeInTheDocument();
      expect(screen.getByText('0%')).toBeInTheDocument();
    });
  });

  describe('View Mode Toggle', () => {
    it('should start in grid view', () => {
      const { container } = render(<ModuleManager modules={mockModules} />);

      // Grid view uses grid layout
      const gridContainer = container.querySelector('.grid');
      expect(gridContainer).toBeInTheDocument();
    });

    it('should switch to list view', () => {
      render(<ModuleManager modules={mockModules} />);

      // Click list view button (second button)
      const buttons = screen.getAllByRole('button');
      const listViewButton = buttons.find((btn) => btn.title === 'List view');
      fireEvent.click(listViewButton!);

      // Should show modules in list format
      expect(screen.getByText('Spanish Basics')).toBeInTheDocument();
    });

    it('should highlight active view mode', () => {
      render(<ModuleManager modules={mockModules} />);

      const buttons = screen.getAllByRole('button');
      const gridViewButton = buttons.find((btn) => btn.title === 'Grid view');

      expect(gridViewButton?.className).toContain('bg-orange-100');
    });
  });

  describe('Search Functionality', () => {
    it('should filter modules by title', () => {
      render(<ModuleManager modules={mockModules} />);

      const searchInput = screen.getByPlaceholderText('Search modules...');
      fireEvent.change(searchInput, { target: { value: 'Spanish' } });

      expect(screen.getByText('Spanish Basics')).toBeInTheDocument();
      expect(screen.queryByText('French Basics')).not.toBeInTheDocument();
    });

    it('should filter modules by module ID', () => {
      render(<ModuleManager modules={mockModules} />);

      const searchInput = screen.getByPlaceholderText('Search modules...');
      fireEvent.change(searchInput, { target: { value: 'french-basics' } });

      expect(screen.queryByText('Spanish Basics')).not.toBeInTheDocument();
      expect(screen.getByText('French Basics')).toBeInTheDocument();
    });

    it('should filter modules by description', () => {
      render(<ModuleManager modules={mockModules} />);

      const searchInput = screen.getByPlaceholderText('Search modules...');
      fireEvent.change(searchInput, { target: { value: 'Basic Spanish' } });

      expect(screen.getByText('Spanish Basics')).toBeInTheDocument();
      expect(screen.queryByText('French Basics')).not.toBeInTheDocument();
    });

    it('should show no results message when no matches', () => {
      render(<ModuleManager modules={mockModules} />);

      const searchInput = screen.getByPlaceholderText('Search modules...');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      expect(screen.getByText('No modules match your search criteria')).toBeInTheDocument();
    });

    it('should show clear filters button when no results', () => {
      render(<ModuleManager modules={mockModules} />);

      const searchInput = screen.getByPlaceholderText('Search modules...');
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      const clearButton = screen.getByText('Clear filters');
      expect(clearButton).toBeInTheDocument();
    });

    it('should clear filters when button clicked', () => {
      render(<ModuleManager modules={mockModules} />);

      const searchInput = screen.getByPlaceholderText('Search modules...') as HTMLInputElement;
      fireEvent.change(searchInput, { target: { value: 'nonexistent' } });

      fireEvent.click(screen.getByText('Clear filters'));

      expect(searchInput.value).toBe('');
      expect(screen.getByText('Spanish Basics')).toBeInTheDocument();
    });
  });

  describe('Language Filter', () => {
    it('should show all languages option', () => {
      render(<ModuleManager modules={mockModules} />);

      const select = screen.getByLabelText('Language:') as HTMLSelectElement;
      expect(select.value).toBe('all');
      expect(screen.getByText('All Languages')).toBeInTheDocument();
    });

    it('should show unique languages in dropdown', () => {
      render(<ModuleManager modules={mockModules} />);

      const select = screen.getByLabelText('Language:');
      expect(select).toBeInTheDocument();

      // Check that ES and FR options exist
      const options = Array.from((select as HTMLSelectElement).options);
      expect(options.some((opt) => opt.value === 'es')).toBe(true);
      expect(options.some((opt) => opt.value === 'fr')).toBe(true);
    });

    it('should filter by selected language', () => {
      render(<ModuleManager modules={mockModules} />);

      const select = screen.getByLabelText('Language:');
      fireEvent.change(select, { target: { value: 'es' } });

      expect(screen.getByText('Spanish Basics')).toBeInTheDocument();
      expect(screen.queryByText('French Basics')).not.toBeInTheDocument();
    });

    it('should update module count when filtering', () => {
      render(<ModuleManager modules={mockModules} />);

      const select = screen.getByLabelText('Language:');
      fireEvent.change(select, { target: { value: 'es' } });

      expect(screen.getByText('1 of 2 modules')).toBeInTheDocument();
    });
  });

  describe('Sort Functionality', () => {
    it('should sort by name by default', () => {
      render(<ModuleManager modules={mockModules} />);

      const select = screen.getByLabelText('Sort by:') as HTMLSelectElement;
      expect(select.value).toBe('name');
    });

    it('should have sort options', () => {
      render(<ModuleManager modules={mockModules} />);

      const select = screen.getByLabelText('Sort by:');
      const options = Array.from((select as HTMLSelectElement).options);

      expect(options.some((opt) => opt.value === 'name')).toBe(true);
      expect(options.some((opt) => opt.value === 'progress')).toBe(true);
      expect(options.some((opt) => opt.value === 'date')).toBe(true);
      expect(options.some((opt) => opt.value === 'language')).toBe(true);
    });

    it('should sort by progress', () => {
      render(<ModuleManager modules={mockModules} />);

      const select = screen.getByLabelText('Sort by:');
      fireEvent.change(select, { target: { value: 'progress' } });

      // Modules should still be displayed
      expect(screen.getByText('Spanish Basics')).toBeInTheDocument();
      expect(screen.getByText('French Basics')).toBeInTheDocument();
    });
  });

  describe('Module Actions', () => {
    it('should show action menu button', () => {
      render(<ModuleManager modules={mockModules} />);

      // Actions menu button (three dots)
      const actionButtons = screen.getAllByRole('button').filter((btn) =>
        btn.querySelector('svg path[d*="M12 8c1.1"]')
      );
      expect(actionButtons.length).toBeGreaterThan(0);
    });

    it('should show study button', () => {
      render(<ModuleManager modules={mockModules} onStudy={mockCallbacks.onStudy} />);

      const studyButtons = screen.getAllByText('Study Now');
      expect(studyButtons.length).toBe(2); // One for each module
    });

    it('should call onStudy when study button clicked', () => {
      render(<ModuleManager modules={mockModules} onStudy={mockCallbacks.onStudy} />);

      const studyButtons = screen.getAllByText('Study Now');
      // Modules are sorted alphabetically, so French (index 0) and Spanish (index 1)
      fireEvent.click(studyButtons[1]);

      expect(mockCallbacks.onStudy).toHaveBeenCalledWith('spanish-basics');
    });

    it('should show delete confirmation modal', () => {
      render(<ModuleManager modules={mockModules} onDelete={mockCallbacks.onDelete} />);

      // Open action menu
      const actionButtons = screen.getAllByRole('button').filter((btn) =>
        btn.querySelector('svg path[d*="M12 8c1.1"]')
      );
      fireEvent.click(actionButtons[0]);

      // Click delete
      fireEvent.click(screen.getByText('Delete'));

      expect(screen.getByText('Delete Module?')).toBeInTheDocument();
      expect(screen.getByText(/This action cannot be undone/i)).toBeInTheDocument();
    });

    it('should call onDelete when confirmed', () => {
      render(<ModuleManager modules={mockModules} onDelete={mockCallbacks.onDelete} />);

      // Open action menu - use index 1 for Spanish (alphabetically sorted)
      const actionButtons = screen.getAllByRole('button').filter((btn) =>
        btn.querySelector('svg path[d*="M12 8c1.1"]')
      );
      fireEvent.click(actionButtons[1]);

      // Click delete
      fireEvent.click(screen.getByText('Delete'));

      // Confirm deletion
      const confirmButton = screen.getAllByText('Delete').find((btn) =>
        btn.className.includes('bg-red-600')
      );
      fireEvent.click(confirmButton!);

      expect(mockCallbacks.onDelete).toHaveBeenCalledWith('spanish-basics');
    });

    it('should cancel deletion', () => {
      render(<ModuleManager modules={mockModules} onDelete={mockCallbacks.onDelete} />);

      // Open action menu
      const actionButtons = screen.getAllByRole('button').filter((btn) =>
        btn.querySelector('svg path[d*="M12 8c1.1"]')
      );
      fireEvent.click(actionButtons[0]);

      // Click delete
      fireEvent.click(screen.getByText('Delete'));

      // Cancel
      const cancelButtons = screen.getAllByText('Cancel');
      fireEvent.click(cancelButtons[0]);

      expect(mockCallbacks.onDelete).not.toHaveBeenCalled();
      expect(screen.queryByText('Delete Module?')).not.toBeInTheDocument();
    });

    it('should show export options modal', () => {
      render(<ModuleManager modules={mockModules} />);

      // Open action menu
      const actionButtons = screen.getAllByRole('button').filter((btn) =>
        btn.querySelector('svg path[d*="M12 8c1.1"]')
      );
      fireEvent.click(actionButtons[0]);

      // Click export
      fireEvent.click(screen.getByText('Export'));

      expect(screen.getByText('Export Options')).toBeInTheDocument();
      expect(screen.getByText('Include progress data')).toBeInTheDocument();
      expect(screen.getByText('Include custom cards')).toBeInTheDocument();
      expect(screen.getByText('Include notes')).toBeInTheDocument();
    });

    it('should toggle export options', () => {
      render(<ModuleManager modules={mockModules} />);

      // Open action menu
      const actionButtons = screen.getAllByRole('button').filter((btn) =>
        btn.querySelector('svg path[d*="M12 8c1.1"]')
      );
      fireEvent.click(actionButtons[0]);

      // Click export
      fireEvent.click(screen.getByText('Export'));

      // Toggle progress option
      const progressCheckbox = screen.getByLabelText('Include progress data') as HTMLInputElement;
      expect(progressCheckbox.checked).toBe(false);

      fireEvent.click(progressCheckbox);
      expect(progressCheckbox.checked).toBe(true);
    });

    it('should show view details option when callback provided', () => {
      render(<ModuleManager modules={mockModules} onViewDetails={mockCallbacks.onViewDetails} />);

      // Open action menu
      const actionButtons = screen.getAllByRole('button').filter((btn) =>
        btn.querySelector('svg path[d*="M12 8c1.1"]')
      );
      fireEvent.click(actionButtons[0]);

      expect(screen.getByText('View Details')).toBeInTheDocument();
    });

    it('should call onViewDetails', () => {
      render(<ModuleManager modules={mockModules} onViewDetails={mockCallbacks.onViewDetails} />);

      // Open action menu - use index 1 for Spanish (alphabetically sorted)
      const actionButtons = screen.getAllByRole('button').filter((btn) =>
        btn.querySelector('svg path[d*="M12 8c1.1"]')
      );
      fireEvent.click(actionButtons[1]);

      fireEvent.click(screen.getByText('View Details'));

      expect(mockCallbacks.onViewDetails).toHaveBeenCalledWith('spanish-basics');
    });

    it('should show reset progress option when callback provided', () => {
      render(<ModuleManager modules={mockModules} onResetProgress={mockCallbacks.onResetProgress} />);

      // Open action menu
      const actionButtons = screen.getAllByRole('button').filter((btn) =>
        btn.querySelector('svg path[d*="M12 8c1.1"]')
      );
      fireEvent.click(actionButtons[0]);

      expect(screen.getByText('Reset Progress')).toBeInTheDocument();
    });

    it('should call onResetProgress', () => {
      render(<ModuleManager modules={mockModules} onResetProgress={mockCallbacks.onResetProgress} />);

      // Open action menu - use index 1 for Spanish (alphabetically sorted)
      const actionButtons = screen.getAllByRole('button').filter((btn) =>
        btn.querySelector('svg path[d*="M12 8c1.1"]')
      );
      fireEvent.click(actionButtons[1]);

      fireEvent.click(screen.getByText('Reset Progress'));

      expect(mockCallbacks.onResetProgress).toHaveBeenCalledWith('spanish-basics');
    });
  });

  describe('Import Button', () => {
    it('should show import button in header when onImport provided', () => {
      render(<ModuleManager modules={mockModules} onImport={mockCallbacks.onImport} />);

      // Should have import button in header (not in empty state)
      const importButtons = screen.getAllByText('Import Module');
      expect(importButtons).toHaveLength(1);
    });

    it('should call onImport when header import button clicked', () => {
      render(<ModuleManager modules={mockModules} onImport={mockCallbacks.onImport} />);

      fireEvent.click(screen.getByText('Import Module'));
      expect(mockCallbacks.onImport).toHaveBeenCalledTimes(1);
    });

    it('should not show import button when onImport not provided', () => {
      render(<ModuleManager modules={mockModules} />);

      expect(screen.queryByText('Import Module')).not.toBeInTheDocument();
    });
  });

  describe('CSS Classes', () => {
    it('should apply custom className', () => {
      const { container } = render(
        <ModuleManager modules={mockModules} className="custom-class" />
      );

      expect(container.querySelector('.custom-class')).toBeInTheDocument();
    });
  });
});
