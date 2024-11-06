import { render, fireEvent, screen } from '@testing-library/react';
import Register from '../myjs/register.jsx';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import axios from 'axios';

vi.mock('axios');

describe('Register Component', () => {
  const onRegisterMock = vi.fn();

  beforeEach(() => {
    onRegisterMock.mockClear();
    axios.post.mockClear();
  });

  const renderRegister = (isAuthenticated = false) => {
    return render(
      <BrowserRouter>
        <Register onRegister={onRegisterMock} isAuthenticated={isAuthenticated} />
      </BrowserRouter>
    );
  };

  test('renders register form', () => {
    renderRegister();
    expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('confirmed password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  test('displays error when passwords do not match', async () => {
    renderRegister();
    fireEvent.change(screen.getByPlaceholderText('name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('confirmed password'), { target: { value: 'password321' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
  
    const errorMessage = await screen.findByText('Password does not match!');
    expect(errorMessage).toBeInTheDocument();
  });

  test('displays error when registration fails', async () => {
    axios.post.mockRejectedValue({
      response: {
        data: { error: 'Email already in use' },
      },
    });

    renderRegister();

    fireEvent.change(screen.getByPlaceholderText('name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('confirmed password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    expect(await screen.findByText('Email already in use')).toBeInTheDocument();
  });

  test('calls onRegister on successful registration', async () => {
    axios.post.mockResolvedValue({
      data: { token: 'fake_token' },
    });

    renderRegister();

    fireEvent.change(screen.getByPlaceholderText('name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('confirmed password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    await screen.findByRole('button', { name: /register/i });

    expect(onRegisterMock).toHaveBeenCalledWith('fake_token');
  });

  test('redirects to dashboard if already authenticated', () => {
    renderRegister(true);
    expect(screen.queryByRole('heading', { name: /register/i })).not.toBeInTheDocument();
  });
});