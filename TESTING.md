**"npm run test" will run component testing then UI testing**
## component testing
1. Register component testing (Have 5 test)
1.1 First test renders register form
    To Render the form and verify presence of all input fields and button
1.2 Displays error when passwords do not match
    Render the form and enter mismatched passwords to trigger validation error
1.3 Displays error when registration fails
    Use already registerd email to show error: 'Email already in use'
1.4 Simulate successful registration
    Render the form and enter valid details to simulate successful registration then got token
1.5 Redirects to dashboard if already authenticated

2. Dashboard component testing (Have 5 test)
2.1 Renders Dashboard and fetches presentations
    Render Dashboard and ensure heading, buttons and presentation cards are displayed
2.2 Opens and closes the modal when creating a new presentation
    Click "New Presentation" button to display the modal and "Cancel" button to close the modal
2.3 Creates a new presentation and adds it to the list
    Open the modal to create a new presentation then 
    Wait for the new presentation to be added to the list
2.4 Calls onLogout when the Logout button is clicked
    Click "Log out" button and verify if onLogout is called
2.5 Navigates to the presentation page on presentation card click
    Click on the presentation card to navigate to presentation page

3. Confirmmodal component testing (Have 3 test)
3.1 Renders the modal with correct title and message
    Render the modal and check that it displays the correct title and message
3.2 Calls onConfirm when Confirm button is clicked
    Click the Confirm button to trigger the onConfirm function
3.3 Calls onCancel when Cancel button is clicked
    Click the Cancel button to trigger the onCancel function

## UI testing (using cypress located in presto/frontend/cypress/cypress/e2e/admin_happy_path.cy.js)
1. Registers successfully
    Visit('/register'); Then get all input and type in then click submit to see if it redirect to dashboard

    **Before each test below, will call login to login first.**
2. Creates a new presentation successfully
    Get"New Presentation" button and create a new presentation to see if it is visible then.
3. Updates the thumbnail and name of the presentation successfully
    First in dashboard click the presentation name to get in presentation page, then edit title
    to see if new title can be seen. 
    Then update thumbnail by change one slide background color and back to dashboard to see if the new thumbnail can be seen in dashboard.
4. Add some slides in a slideshow deck successfully
    Click "Add slide" to see if page number change.
5. Switch between slides successfully
    Click ">" to see if page number change.
6. Delete a presentation successfully
    Click "Delete presentation" and to see if presentation disappear in dashboard.
7. Logs out of the application successfully
    Click "Log out" and to see if turn to landpage.
8. Logs back into the application successfully
    Click "Log in" and to see if turn to dashboard.
