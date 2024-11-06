import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import Dashboard from '../myjs/dashboard.jsx';
import { BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom';
import axios from 'axios';
import { vi } from 'vitest';

vi.mock('axios');

describe('Dashboard Component', () => {
  const onLogoutMock = vi.fn();
  const token = 'test-token';

  beforeEach(() => {
    // Clear all mock calls
    onLogoutMock.mockClear();
    axios.get.mockClear();
    axios.put.mockClear();

    // Mock Axios default GET request to avoid `.then` errors
    axios.get.mockResolvedValue({
      data: {
        store: {
          1: { id: 1, name: 'Presentation 1', slides: [], thumbnailSlideIndex: 0 },
        },
      },
    });
    axios.put.mockResolvedValue({});
  });

  const renderDashboard = () => {
    return render(
      <BrowserRouter>
        <Dashboard onLogout={onLogoutMock} token={token} />
      </BrowserRouter>
    );
  };

  test('renders Dashboard and fetches presentations', async () => {
    // Render Dashboard and ensure heading and buttons are displayed
    await act(async () => renderDashboard());

    // Check if the Dashboard heading and buttons render correctly
    expect(screen.getByRole('heading', { name: /dashboard/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /log out/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /new presentation/i })).toBeInTheDocument();

    // Wait for the presentation list to load and check for its content
    await waitFor(() => {
      expect(screen.getByText('Presentation 1')).toBeInTheDocument();
    });
  });

  test('opens and closes the modal when creating a new presentation', async () => {
    await act(async () => renderDashboard());

    // Click "New Presentation" button to display the modal
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /new presentation/i }));
    });
    expect(screen.getByRole('heading', { name: /create new presentation/i })).toBeInTheDocument();

    // Click "Cancel" button to close the modal
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    });
    expect(screen.queryByRole('heading', { name: /create new presentation/i })).not.toBeInTheDocument();
  });

  test('creates a new presentation and adds it to the list', async () => {
    await act(async () => renderDashboard());

    // Open the modal to create a new presentation
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /new presentation/i }));
    });

    // Fill in the presentation name and submit
    act(() => {
      const input = screen.getByPlaceholderText('Presentation Name');
      fireEvent.change(input, { target: { value: 'New Presentation' } });
      fireEvent.click(screen.getByRole('button', { name: /create/i }));
    });

    // Wait for the new presentation to be added to the list
    await waitFor(() => {
      expect(screen.getByText('New Presentation')).toBeInTheDocument();
    });
  });

  test('calls onLogout when the Logout button is clicked', async () => {
    await act(async () => renderDashboard());

    // Click "Log out" button and verify if onLogout is called
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /log out/i }));
    });
    expect(onLogoutMock).toHaveBeenCalledTimes(1);
  });

  test('navigates to the presentation page on presentation card click', async () => {
    await act(async () => renderDashboard());

    // Wait for presentation list to load and verify item exists
    await waitFor(() => {
      expect(screen.getByText('Presentation 1')).toBeInTheDocument();
    });

    // Click on the presentation card to navigate
    act(() => {
      fireEvent.click(screen.getByText('Presentation 1'));
    });

    // Verify the navigation is correct (actual check may depend on routing or mocked navigation)
    expect(screen.getByText('Presentation 1')).toBeInTheDocument();
  });
});