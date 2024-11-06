import { render, screen, fireEvent } from '@testing-library/react';
import ConfirmModal from '../myjs/confirmmodal.jsx';
import '@testing-library/jest-dom';

describe('ConfirmModal Component', () => {
  // Define title and message for the modal
  const title = 'Delete Item';
  const message = 'Are you sure you want to delete this item?';

  // Mock functions for confirm and cancel actions
  const onConfirmMock = vi.fn();
  const onCancelMock = vi.fn();

  beforeEach(() => {
    // Clear all mock calls before each test to ensure clean test state
    onConfirmMock.mockClear();
    onCancelMock.mockClear();
  });

  // Helper function to render ConfirmModal component with provided props
  const renderConfirmModal = () =>
    render(
      <ConfirmModal
        title={title}
        message={message}
        onConfirm={onConfirmMock}
        onCancel={onCancelMock}
      />
    );

  test('renders the modal with correct title and message', () => {
    // Render the modal and check that it displays the correct title and message
    renderConfirmModal();
    
    // Assert that the title is displayed in the document
    expect(screen.getByText(title)).toBeInTheDocument();
    
    // Assert that the message is displayed in the document
    expect(screen.getByText(message)).toBeInTheDocument();
  });

  test('calls onConfirm when Confirm button is clicked', () => {
    // Render the modal and simulate a click on the Confirm button
    renderConfirmModal();

    // Click the Confirm button to trigger the onConfirm function
    fireEvent.click(screen.getByText('Confirm'));

    // Assert that the onConfirm mock function is called exactly once
    expect(onConfirmMock).toHaveBeenCalledTimes(1);
  });

  test('calls onCancel when Cancel button is clicked', () => {
    // Render the modal and simulate a click on the Cancel button
    renderConfirmModal();

    // Click the Cancel button to trigger the onCancel function
    fireEvent.click(screen.getByText('Cancel'));

    // Assert that the onCancel mock function is called exactly once
    expect(onCancelMock).toHaveBeenCalledTimes(1);
  });
});