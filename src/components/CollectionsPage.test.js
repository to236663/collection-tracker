import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CollectionsPage from './CollectionsPage';

const STORAGE_KEY = 'collectorsNotebook_collections';

const mockOnSelect = jest.fn();

const renderPage = () => render(<CollectionsPage onSelectCollection={mockOnSelect} />);

const seedStorage = (collections) =>
  localStorage.setItem(STORAGE_KEY, JSON.stringify(collections));

const makeCollection = (overrides = {}) => ({
  id: '1',
  name: 'Stamps',
  tag: 'postal',
  description: 'Old stamps',
  dateCreated: '2024-01-01T00:00:00.000Z',
  dateUpdated: null,
  ...overrides,
});

beforeEach(() => {
  localStorage.clear();
  mockOnSelect.mockClear();
});

// ─────────────────────────────────────────────
// Page structure
// ─────────────────────────────────────────────
describe('Page structure', () => {
  test('renders the page title', () => {
    renderPage();
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent("Collector's Notebook");
  });

  test('shows empty-state message when no collections exist', () => {
    renderPage();
    expect(screen.getByText('Add a collection to get started!')).toBeInTheDocument();
  });

  test('always shows Add New Collection button in the header', () => {
    renderPage();
    // At least one button with this label exists (header + empty state = 2)
    expect(screen.getAllByText('Add New Collection').length).toBeGreaterThanOrEqual(1);
  });

  test('hides empty-state once collections are loaded', () => {
    seedStorage([makeCollection()]);
    renderPage();
    expect(screen.queryByText('Add a collection to get started!')).not.toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// localStorage hydration
// ─────────────────────────────────────────────
describe('localStorage hydration', () => {
  test('loads and renders collections stored in localStorage on mount', () => {
    seedStorage([makeCollection({ name: 'Baseball Cards' })]);
    renderPage();
    expect(screen.getByText('Baseball Cards')).toBeInTheDocument();
  });

  test('renders all seeded collections', () => {
    seedStorage([
      makeCollection({ id: '1', name: 'Coins' }),
      makeCollection({ id: '2', name: 'Comics' }),
    ]);
    renderPage();
    expect(screen.getByText('Coins')).toBeInTheDocument();
    expect(screen.getByText('Comics')).toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// Add collection
// ─────────────────────────────────────────────
describe('Add collection', () => {
  test('opens the modal when Add New Collection is clicked', () => {
    renderPage();
    fireEvent.click(screen.getAllByText('Add New Collection')[0]);
    expect(screen.getByText('New Collection')).toBeInTheDocument();
  });

  test('modal closes when Cancel is clicked', () => {
    renderPage();
    fireEvent.click(screen.getAllByText('Add New Collection')[0]);
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('New Collection')).not.toBeInTheDocument();
  });

  test('modal closes when the overlay is clicked', () => {
    renderPage();
    fireEvent.click(screen.getAllByText('Add New Collection')[0]);
    // The overlay is the backdrop div; clicking it should close the modal
    const overlay = screen.getByText('New Collection').closest('div[class]').parentElement;
    fireEvent.click(overlay);
    expect(screen.queryByText('New Collection')).not.toBeInTheDocument();
  });

  test('shows a validation error when saving with an empty name', () => {
    renderPage();
    fireEvent.click(screen.getAllByText('Add New Collection')[0]);
    fireEvent.click(screen.getByText('Save'));
    expect(screen.getByText('Name is required.')).toBeInTheDocument();
  });

  test('does not add a collection when name is empty', () => {
    renderPage();
    fireEvent.click(screen.getAllByText('Add New Collection')[0]);
    fireEvent.click(screen.getByText('Save'));
    // The modal stays open and localStorage should remain empty
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  test('clears the validation error once the user starts typing', () => {
    renderPage();
    fireEvent.click(screen.getAllByText('Add New Collection')[0]);
    fireEvent.click(screen.getByText('Save'));
    expect(screen.getByText('Name is required.')).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText('Collection name *'), {
      target: { value: 'My Collection' },
    });
    expect(screen.queryByText('Name is required.')).not.toBeInTheDocument();
  });

  test('adds a collection and shows its name on the page', async () => {
    renderPage();
    fireEvent.click(screen.getAllByText('Add New Collection')[0]);
    fireEvent.change(screen.getByPlaceholderText('Collection name *'), {
      target: { value: 'Vinyl Records' },
    });
    fireEvent.click(screen.getByText('Save'));
    expect(await screen.findByText('Vinyl Records')).toBeInTheDocument();
  });

  test('closes the modal after a successful save', async () => {
    renderPage();
    fireEvent.click(screen.getAllByText('Add New Collection')[0]);
    fireEvent.change(screen.getByPlaceholderText('Collection name *'), {
      target: { value: 'Coins' },
    });
    fireEvent.click(screen.getByText('Save'));
    await waitFor(() =>
      expect(screen.queryByText('New Collection')).not.toBeInTheDocument()
    );
  });

  test('new collection shows a "Created" date label', async () => {
    renderPage();
    fireEvent.click(screen.getAllByText('Add New Collection')[0]);
    fireEvent.change(screen.getByPlaceholderText('Collection name *'), {
      target: { value: 'Books' },
    });
    fireEvent.click(screen.getByText('Save'));
    expect(await screen.findByText(/^Created:/)).toBeInTheDocument();
  });

  test('persists the new collection to localStorage', async () => {
    renderPage();
    fireEvent.click(screen.getAllByText('Add New Collection')[0]);
    fireEvent.change(screen.getByPlaceholderText('Collection name *'), {
      target: { value: 'Action Figures' },
    });
    fireEvent.click(screen.getByText('Save'));
    await screen.findByText('Action Figures');

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored).toHaveLength(1);
    expect(stored[0].name).toBe('Action Figures');
    expect(stored[0].dateCreated).toBeTruthy();
    expect(stored[0].dateUpdated).toBeNull();
  });

  test('trims whitespace from the saved name', async () => {
    renderPage();
    fireEvent.click(screen.getAllByText('Add New Collection')[0]);
    fireEvent.change(screen.getByPlaceholderText('Collection name *'), {
      target: { value: '  Comics  ' },
    });
    fireEvent.click(screen.getByText('Save'));
    await screen.findByText('Comics');

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored[0].name).toBe('Comics');
  });
});

// ─────────────────────────────────────────────
// Three-dot menu
// ─────────────────────────────────────────────
describe('Three-dot menu', () => {
  beforeEach(() => seedStorage([makeCollection()]));

  test('dropdown is hidden by default', () => {
    renderPage();
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
    expect(screen.queryByText('Delete')).not.toBeInTheDocument();
  });

  test('shows Edit and Delete when the menu button is clicked', () => {
    renderPage();
    fireEvent.click(screen.getByTitle('Options'));
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  test('clicking the menu button does not trigger card navigation', () => {
    renderPage();
    fireEvent.click(screen.getByTitle('Options'));
    expect(mockOnSelect).not.toHaveBeenCalled();
  });

  test('clicking outside closes the dropdown', () => {
    renderPage();
    fireEvent.click(screen.getByTitle('Options'));
    fireEvent.click(document.body);
    expect(screen.queryByText('Edit')).not.toBeInTheDocument();
  });
});

// ─────────────────────────────────────────────
// Edit collection
// ─────────────────────────────────────────────
describe('Edit collection', () => {
  beforeEach(() => seedStorage([makeCollection()]));

  const openEditModal = () => {
    fireEvent.click(screen.getByTitle('Options'));
    fireEvent.click(screen.getByText('Edit'));
  };

  test('opens the edit modal with the correct heading', () => {
    renderPage();
    openEditModal();
    expect(screen.getByText('Edit Collection')).toBeInTheDocument();
  });

  test('pre-fills the name input', () => {
    renderPage();
    openEditModal();
    expect(screen.getByDisplayValue('Stamps')).toBeInTheDocument();
  });

  test('pre-fills the tag input', () => {
    renderPage();
    openEditModal();
    expect(screen.getByDisplayValue('postal')).toBeInTheDocument();
  });

  test('pre-fills the description textarea', () => {
    renderPage();
    openEditModal();
    expect(screen.getByDisplayValue('Old stamps')).toBeInTheDocument();
  });

  test('saves the updated name and shows it on the card', async () => {
    renderPage();
    openEditModal();
    fireEvent.change(screen.getByDisplayValue('Stamps'), {
      target: { value: 'Rare Stamps' },
    });
    fireEvent.click(screen.getByText('Save'));
    expect(await screen.findByText('Rare Stamps')).toBeInTheDocument();
  });

  test('shows "Updated" date label after editing', async () => {
    renderPage();
    openEditModal();
    fireEvent.change(screen.getByDisplayValue('Stamps'), {
      target: { value: 'Rare Stamps' },
    });
    fireEvent.click(screen.getByText('Save'));
    expect(await screen.findByText(/^Updated:/)).toBeInTheDocument();
  });

  test('persists the edit to localStorage with a dateUpdated value', async () => {
    renderPage();
    openEditModal();
    fireEvent.change(screen.getByDisplayValue('Stamps'), {
      target: { value: 'Rare Stamps' },
    });
    fireEvent.click(screen.getByText('Save'));
    await screen.findByText('Rare Stamps');

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored[0].name).toBe('Rare Stamps');
    expect(stored[0].dateUpdated).not.toBeNull();
  });

  test('does not add a duplicate entry — collection count stays the same', async () => {
    renderPage();
    openEditModal();
    fireEvent.change(screen.getByDisplayValue('Stamps'), {
      target: { value: 'Rare Stamps' },
    });
    fireEvent.click(screen.getByText('Save'));
    await screen.findByText('Rare Stamps');

    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
    expect(stored).toHaveLength(1);
  });
});

// ─────────────────────────────────────────────
// Delete collection
// ─────────────────────────────────────────────
describe('Delete collection', () => {
  beforeEach(() => seedStorage([makeCollection()]));

  test('removes the collection from the page', async () => {
    renderPage();
    fireEvent.click(screen.getByTitle('Options'));
    fireEvent.click(screen.getByText('Delete'));
    await waitFor(() =>
      expect(screen.queryByText('Stamps')).not.toBeInTheDocument()
    );
  });

  test('shows the empty-state message after the last collection is deleted', async () => {
    renderPage();
    fireEvent.click(screen.getByTitle('Options'));
    fireEvent.click(screen.getByText('Delete'));
    expect(await screen.findByText('Add a collection to get started!')).toBeInTheDocument();
  });

  test('removes the collection from localStorage', async () => {
    renderPage();
    fireEvent.click(screen.getByTitle('Options'));
    fireEvent.click(screen.getByText('Delete'));
    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      expect(stored).toHaveLength(0);
    });
  });

  test('deletes only the targeted collection when multiple exist', async () => {
    seedStorage([
      makeCollection({ id: '1', name: 'Stamps' }),
      makeCollection({ id: '2', name: 'Coins' }),
    ]);
    renderPage();
    // Open menu for the first Options button (Stamps is sorted first — same date, id order)
    fireEvent.click(screen.getAllByTitle('Options')[0]);
    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      expect(stored).toHaveLength(1);
    });
  });
});

// ─────────────────────────────────────────────
// Sorting
// ─────────────────────────────────────────────
describe('Sorting', () => {
  test('shows the most recently created collection first', () => {
    seedStorage([
      makeCollection({ id: '1', name: 'Older', dateCreated: '2024-01-01T00:00:00.000Z' }),
      makeCollection({ id: '2', name: 'Newer', dateCreated: '2024-06-01T00:00:00.000Z' }),
    ]);
    renderPage();
    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings[0]).toHaveTextContent('Newer');
    expect(headings[1]).toHaveTextContent('Older');
  });

  test('bumps an older-but-recently-updated collection above a newer-but-unedited one', () => {
    seedStorage([
      makeCollection({ id: '1', name: 'Old but Updated', dateCreated: '2024-01-01T00:00:00.000Z', dateUpdated: '2024-12-01T00:00:00.000Z' }),
      makeCollection({ id: '2', name: 'Newer Created', dateCreated: '2024-06-01T00:00:00.000Z', dateUpdated: null }),
    ]);
    renderPage();
    const headings = screen.getAllByRole('heading', { level: 2 });
    expect(headings[0]).toHaveTextContent('Old but Updated');
    expect(headings[1]).toHaveTextContent('Newer Created');
  });
});

// ─────────────────────────────────────────────
// Card navigation
// ─────────────────────────────────────────────
describe('Card navigation', () => {
  test('calls onSelectCollection with the correct collection when a card is clicked', () => {
    const col = makeCollection({ id: '42', name: 'Vintage Posters' });
    seedStorage([col]);
    renderPage();
    fireEvent.click(screen.getByText('Vintage Posters'));
    expect(mockOnSelect).toHaveBeenCalledTimes(1);
    expect(mockOnSelect).toHaveBeenCalledWith(expect.objectContaining({ id: '42', name: 'Vintage Posters' }));
  });
});
