import { render, fireEvent, screen } from '@testing-library/react';
import Register from '../myjs/register.jsx';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import '@testing-library/jest-dom';
import axios from 'axios';

// Mock axios for network request handling in tests
vi.mock('axios');

describe('Register Component', () => {
  // Mock function to simulate registration success callback
  const onRegisterMock = vi.fn();

  // Clear mocks before each test to ensure isolated test cases
  beforeEach(() => {
    onRegisterMock.mockClear();
    axios.post.mockClear();
  });

  // Utility function to render the Register component with required context
  const renderRegister = (isAuthenticated = false) => {
    return render(
      <BrowserRouter>
        <Register onRegister={onRegisterMock} isAuthenticated={isAuthenticated} />
      </BrowserRouter>
    );
  };

  test('renders register form', () => {
    // Render the form and verify presence of all input fields and button
    renderRegister();
    expect(screen.getByRole('heading', { name: /register/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('name')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('email')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('confirmed password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /register/i })).toBeInTheDocument();
  });

  test('displays error when passwords do not match', async () => {
    // Render the form and enter mismatched passwords to trigger validation error
    renderRegister();
    fireEvent.change(screen.getByPlaceholderText('name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('confirmed password'), { target: { value: 'password321' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));
  
    // Assert that the "passwords do not match" error message is displayed
    const errorMessage = await screen.findByText('Password does not match!');
    expect(errorMessage).toBeInTheDocument();
  });

  test('displays error when registration fails', async () => {
    // Mock failed registration response from server
    axios.post.mockRejectedValue({
      response: {
        data: { error: 'Email already in use' },
      },
    });

    // Render the form and enter valid details to simulate failed registration
    renderRegister();
    fireEvent.change(screen.getByPlaceholderText('name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('confirmed password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    // Assert that the "Email already in use" error message is displayed
    expect(await screen.findByText('Email already in use')).toBeInTheDocument();
  });

  test('calls onRegister on successful registration', async () => {
    // Mock successful registration response with a token
    axios.post.mockResolvedValue({
      data: { token: 'fake_token' },
    });

    // Render the form and enter valid details to simulate successful registration
    renderRegister();
    fireEvent.change(screen.getByPlaceholderText('name'), { target: { value: 'Test User' } });
    fireEvent.change(screen.getByPlaceholderText('email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByPlaceholderText('confirmed password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /register/i }));

    // Wait for registration to complete and verify that onRegister was called with the token
    await screen.findByRole('button', { name: /register/i });
    expect(onRegisterMock).toHaveBeenCalledWith('fake_token');
  });

  test('redirects to dashboard if already authenticated', () => {
    // Render the form with user already authenticated
    renderRegister(true);
    
    // Assert that the registration form is not displayed and user is redirected
    expect(screen.queryByRole('heading', { name: /register/i })).not.toBeInTheDocument();
  });
});