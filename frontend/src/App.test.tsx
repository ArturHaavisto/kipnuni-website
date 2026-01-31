import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

describe('App', () => {
  it('renders the welcome message', () => {
    render(<App />);
    expect(screen.getByText('Welcome to Kipnuni')).toBeInTheDocument();
  });

  it('renders initial count as 0', () => {
    render(<App />);
    expect(screen.getByText('Count: 0')).toBeInTheDocument();
  });

  it('increments count when button is clicked', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const button = screen.getByRole('button', { name: /increment/i });
    await user.click(button);
    
    expect(screen.getByText('Count: 1')).toBeInTheDocument();
  });

  it('increments count multiple times', async () => {
    const user = userEvent.setup();
    render(<App />);
    
    const button = screen.getByRole('button', { name: /increment/i });
    await user.click(button);
    await user.click(button);
    await user.click(button);
    
    expect(screen.getByText('Count: 3')).toBeInTheDocument();
  });

  it('renders the Header component', () => {
    render(<App />);
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });
});
