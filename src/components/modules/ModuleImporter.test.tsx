import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ModuleImporter } from './ModuleImporter';
import type { VocabularyModule } from '../../models/types';

// Mock File.prototype.text() for the test environment
class MockFile extends File {
  text(): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(this);
    });
  }
}

describe('ModuleImporter', () => {
  const mockOnImportSuccess = vi.fn();
  const mockOnCancel = vi.fn();

  const validModuleJSON = JSON.stringify({
    schema_version: '1.0.0',
    module_metadata: {
      module_id: 'test-module',
      title: 'Test Module',
      version: '1.0.0',
      language: 'en',
      description: 'A test module',
    },
    vocabulary_entries: [
      {
        entry_id: 'test-001',
        term: 'test',
        cards: [
          {
            card_id: 'test-001-def-01',
            card_type: 'definition',
            content: {
              definition: 'A procedure to establish quality',
              expected_answer: 'test',
            },
          },
        ],
      },
    ],
  });

  const invalidModuleJSON = JSON.stringify({
    module_metadata: {
      title: 'Invalid Module',
    },
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render upload stage initially', () => {
    render(<ModuleImporter onImportSuccess={mockOnImportSuccess} />);

    expect(screen.getByText('Import Vocabulary Module')).toBeInTheDocument();
    expect(screen.getByText(/Drag and drop your JSON file/i)).toBeInTheDocument();
    expect(screen.getByText('Choose File')).toBeInTheDocument();
  });

  it('should show sample download link', () => {
    render(<ModuleImporter onImportSuccess={mockOnImportSuccess} />);

    expect(screen.getByText('Download sample format')).toBeInTheDocument();
  });

  it('should show cancel button when onCancel prop is provided', () => {
    render(<ModuleImporter onImportSuccess={mockOnImportSuccess} onCancel={mockOnCancel} />);

    expect(screen.getByText('Cancel')).toBeInTheDocument();
  });

  it('should not show cancel button when onCancel is not provided', () => {
    render(<ModuleImporter onImportSuccess={mockOnImportSuccess} />);

    expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
  });

  it('should handle valid file upload', async () => {
    const { container } = render(<ModuleImporter onImportSuccess={mockOnImportSuccess} />);

    const file = new MockFile([validModuleJSON], 'test-module.json', { type: 'application/json' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    // Should show validating stage
    await waitFor(() => {
      expect(screen.getByText('Validating module...')).toBeInTheDocument();
    });

    // Should show preview stage
    await waitFor(() => {
      expect(screen.getByText('Module Preview')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Module')).toBeInTheDocument();
    expect(screen.getByText(/Module ID: test-module/i)).toBeInTheDocument();
  });

  it('should handle invalid JSON file', async () => {
    const { container } = render(<ModuleImporter onImportSuccess={mockOnImportSuccess} />);

    const file = new MockFile(['not valid json'], 'invalid.json', { type: 'application/json' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Import Failed')).toBeInTheDocument();
    });

    expect(screen.getByText(/Invalid JSON format/i)).toBeInTheDocument();
  });

  it('should handle invalid module structure', async () => {
    const { container } = render(<ModuleImporter onImportSuccess={mockOnImportSuccess} />);

    const file = new MockFile([invalidModuleJSON], 'invalid-module.json', { type: 'application/json' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Import Failed')).toBeInTheDocument();
    });

    // Should show specific errors
    expect(screen.getByText(/fix the following errors/i)).toBeInTheDocument();
  });

  it('should show drag state when dragging over', () => {
    render(<ModuleImporter onImportSuccess={mockOnImportSuccess} />);

    const dropZone = screen.getByText(/Drag and drop your JSON file/i).closest('div');

    fireEvent.dragEnter(dropZone!);
    expect(screen.getByText('Drop file here')).toBeInTheDocument();
  });

  it('should handle file drop', async () => {
    render(<ModuleImporter onImportSuccess={mockOnImportSuccess} />);

    const file = new MockFile([validModuleJSON], 'test-module.json', { type: 'application/json' });
    const dropZone = screen.getByText(/Drag and drop your JSON file/i).closest('div');

    const dataTransfer = {
      files: [file],
      types: ['Files'],
    };

    fireEvent.drop(dropZone!, { dataTransfer });

    await waitFor(() => {
      expect(screen.getByText('Module Preview')).toBeInTheDocument();
    });
  });

  it('should show error when dropping non-JSON file', async () => {
    render(<ModuleImporter onImportSuccess={mockOnImportSuccess} />);

    const file = new MockFile(['test'], 'test.txt', { type: 'text/plain' });
    const dropZone = screen.getByText(/Drag and drop your JSON file/i).closest('div');

    const dataTransfer = {
      files: [file],
      types: ['Files'],
    };

    fireEvent.drop(dropZone!, { dataTransfer });

    await waitFor(() => {
      expect(screen.getByText('Import Failed')).toBeInTheDocument();
    });

    expect(screen.getByText(/Please drop a JSON file/i)).toBeInTheDocument();
  });

  it('should show preview with module stats', async () => {
    const { container } = render(<ModuleImporter onImportSuccess={mockOnImportSuccess} />);

    const file = new MockFile([validModuleJSON], 'test-module.json', { type: 'application/json' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Module Preview')).toBeInTheDocument();
    });

    expect(screen.getByText('Vocabulary Entries')).toBeInTheDocument();
    expect(screen.getByText('Total Cards')).toBeInTheDocument();
    expect(screen.getByText('Card Types')).toBeInTheDocument();
    // Check stats are displayed (both 1 entry and 1 card)
    const ones = screen.getAllByText('1');
    expect(ones.length).toBeGreaterThanOrEqual(2);
  });

  it('should show description when available', async () => {
    const { container } = render(<ModuleImporter onImportSuccess={mockOnImportSuccess} />);

    const file = new MockFile([validModuleJSON], 'test-module.json', { type: 'application/json' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('A test module')).toBeInTheDocument();
    });
  });

  it('should allow confirming import from preview', async () => {
    const { container } = render(<ModuleImporter onImportSuccess={mockOnImportSuccess} />);

    const file = new MockFile([validModuleJSON], 'test-module.json', { type: 'application/json' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Module Preview')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Confirm Import');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText('Module Imported Successfully!')).toBeInTheDocument();
    });

    expect(mockOnImportSuccess).toHaveBeenCalledTimes(1);
    expect(mockOnImportSuccess).toHaveBeenCalledWith(
      expect.objectContaining({
        moduleId: 'test-module',
        title: 'Test Module',
      })
    );
  });

  it('should allow canceling from preview', async () => {
    const { container } = render(<ModuleImporter onImportSuccess={mockOnImportSuccess} />);

    const file = new MockFile([validModuleJSON], 'test-module.json', { type: 'application/json' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Module Preview')).toBeInTheDocument();
    });

    const cancelButton = screen.getByText('Cancel');
    fireEvent.click(cancelButton);

    // Should reset to upload stage
    await waitFor(() => {
      expect(screen.getByText('Import Vocabulary Module')).toBeInTheDocument();
    });
  });

  it('should show success message after import', async () => {
    const { container } = render(<ModuleImporter onImportSuccess={mockOnImportSuccess} />);

    const file = new MockFile([validModuleJSON], 'test-module.json', { type: 'application/json' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Module Preview')).toBeInTheDocument();
    });

    const confirmButton = screen.getByText('Confirm Import');
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(screen.getByText('Module Imported Successfully!')).toBeInTheDocument();
    });

    expect(screen.getByText('Test Module')).toBeInTheDocument();
    expect(screen.getByText(/has been added to your library/i)).toBeInTheDocument();
  });

  it('should allow importing another module after success', async () => {
    const { container } = render(<ModuleImporter onImportSuccess={mockOnImportSuccess} />);

    const file = new MockFile([validModuleJSON], 'test-module.json', { type: 'application/json' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Module Preview')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Confirm Import'));

    await waitFor(() => {
      expect(screen.getByText('Module Imported Successfully!')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Import Another Module'));

    // Should reset to upload stage
    await waitFor(() => {
      expect(screen.getByText('Import Vocabulary Module')).toBeInTheDocument();
    });
  });

  it('should allow trying again after error', async () => {
    const { container } = render(<ModuleImporter onImportSuccess={mockOnImportSuccess} />);

    const file = new MockFile(['invalid'], 'invalid.json', { type: 'application/json' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Import Failed')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Try Again'));

    // Should reset to upload stage
    await waitFor(() => {
      expect(screen.getByText('Import Vocabulary Module')).toBeInTheDocument();
    });
  });

  it('should show download sample button in error stage', async () => {
    const { container } = render(<ModuleImporter onImportSuccess={mockOnImportSuccess} />);

    const file = new MockFile(['invalid'], 'invalid.json', { type: 'application/json' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Import Failed')).toBeInTheDocument();
    });

    expect(screen.getByText('Download Sample Module')).toBeInTheDocument();
  });

  it('should handle download sample click', () => {
    render(<ModuleImporter onImportSuccess={mockOnImportSuccess} />);

    // Mock URL and document methods
    const createObjectURL = vi.fn(() => 'blob:test');
    const revokeObjectURL = vi.fn();
    global.URL.createObjectURL = createObjectURL;
    global.URL.revokeObjectURL = revokeObjectURL;

    const downloadButton = screen.getByText('Download sample format');
    fireEvent.click(downloadButton);

    expect(createObjectURL).toHaveBeenCalled();
  });

  it('should display warnings in preview', async () => {
    const moduleWithWarnings = JSON.stringify({
      schema_version: '1.0', // Invalid format - will trigger warning
      module_metadata: {
        module_id: 'test-module',
        title: 'Test Module',
        version: '1.0.0',
        language: 'en',
      },
      vocabulary_entries: [
        {
          entry_id: 'test-001',
          term: 'test',
          cards: [
            {
              card_id: 'test-001-def-01',
              card_type: 'definition',
              content: {
                definition: 'A test',
                expected_answer: 'test',
              },
            },
          ],
        },
      ],
    });

    const { container } = render(<ModuleImporter onImportSuccess={mockOnImportSuccess} />);

    const file = new MockFile([moduleWithWarnings], 'test.json', { type: 'application/json' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Warnings')).toBeInTheDocument();
    });
  });

  it('should show card type distribution', async () => {
    const moduleWithMultipleCardTypes = JSON.stringify({
      schema_version: '1.0.0',
      module_metadata: {
        module_id: 'test-module',
        title: 'Test Module',
        version: '1.0.0',
        language: 'en',
      },
      vocabulary_entries: [
        {
          entry_id: 'test-001',
          term: 'test',
          cards: [
            {
              card_id: 'test-001-def-01',
              card_type: 'definition',
              content: { definition: 'A test', expected_answer: 'test' },
            },
            {
              card_id: 'test-001-img-01',
              card_type: 'image',
              content: { image_url: './test.jpg', prompt: 'What is this?', expected_answer: 'test' },
            },
          ],
        },
      ],
    });

    const { container } = render(<ModuleImporter onImportSuccess={mockOnImportSuccess} />);

    const file = new MockFile([moduleWithMultipleCardTypes], 'test.json', { type: 'application/json' });
    const input = container.querySelector('input[type="file"]') as HTMLInputElement;

    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText('Card Types')).toBeInTheDocument();
    });

    expect(screen.getByText('definition')).toBeInTheDocument();
    expect(screen.getByText('image')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    const { container } = render(
      <ModuleImporter onImportSuccess={mockOnImportSuccess} className="custom-class" />
    );

    expect(container.querySelector('.custom-class')).toBeInTheDocument();
  });
});
