import { render, screen } from '@testing-library/react';
import Header from './Header';

describe('Header', () => {
  it('renders the default title', () => {
    render(<Header />);
    expect(screen.getByText('Kipnuni')).toBeInTheDocument();
  });

  it('renders custom title when provided', () => {
    render(<Header title="Custom Title" />);
    expect(screen.getByText('Custom Title')).toBeInTheDocument();
  });

  it('renders navigation links', () => {
    render(<Header />);
    expect(screen.getByText('Home')).toBeInTheDocument();
    expect(screen.getByText('About')).toBeInTheDocument();
    expect(screen.getByText('Contact')).toBeInTheDocument();
  });

  it('has correct href attributes on links', () => {
    render(<Header />);
    expect(screen.getByText('Home').closest('a')).toHaveAttribute('href', '/');
    expect(screen.getByText('About').closest('a')).toHaveAttribute('href', '/about');
    expect(screen.getByText('Contact').closest('a')).toHaveAttribute('href', '/contact');
  });
});
