import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the Collector\'s Notebook title', () => {
  render(<App />);
  expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent("Collector's Notebook");
});

test('renders the Add New Collection button', () => {
  render(<App />);
  expect(screen.getAllByText('Add New Collection').length).toBeGreaterThan(0);
});
