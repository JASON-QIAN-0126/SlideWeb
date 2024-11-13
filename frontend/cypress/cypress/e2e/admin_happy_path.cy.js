describe('Admin Happy Path', () => {
  const adminUser = {
    username: 'adminUser',
    password: 'SecurePass123',
    email: `admin${Date.now()}@example.com`,
  };

  const presentation = {
    name: 'Quarterly Report',
    updatedName: 'Annual Report',
  };

  it('Registers successfully', () => {
    cy.visit('/register');
    cy.get('input[placeholder="Name"]').type(adminUser.username);
    cy.get('input[placeholder="Email"]').type(adminUser.email);
    cy.get('input[placeholder="Password"]').type(adminUser.password);
    cy.get('input[placeholder="Confirm Password"]').type(adminUser.password);
    cy.get('button[type="submit"]').click();

    // Assert registration success and redirect to dashboard
    cy.url().should('include', '/dashboard');
  });

  beforeEach(() => {
    // make sure log in
    cy.visit('/login');
    cy.get('input[placeholder="Email"]').type(adminUser.email);
    cy.get('input[placeholder="Password"]').type(adminUser.password);
    cy.get('button[type="submit"]').click();
    cy.wait(1000);
  });

  it('Creates a new presentation successfully', () => {
    cy.get('button').contains('New Presentation').should('exist').click();
    cy.get('input[placeholder="Presentation Name"]').type(presentation.name);
    cy.get('button').contains('Create').click();

    cy.contains(presentation.name).should('be.visible');
  });

  it('Updates the thumbnail and name of the presentation successfully', () => {
    cy.contains(presentation.name).click();
    cy.get('button').contains('Edit Title').click();

    // Update title
    cy.get('input').clear().type(presentation.updatedName);
    cy.wait(1000);
    cy.contains('button', /^Update$/).click();

    // Assert title
    cy.contains(presentation.updatedName).should('be.visible');

    // Update thumbnail
    cy.get('button').contains('Add Slide').click();
    cy.get('button').contains('Change Background').click();
    cy.get('button').contains('Apply').click();
    cy.get('button').contains('Update Thumbnail').click();
    cy.contains('Slide 2').click();
    cy.get('button').contains('Back').click();
    cy.get('[style*="background-color"]')
      .should('exist');
  });

  it('Add some slides in a slideshow deck successfully', () => {
    cy.contains(presentation.updatedName).click();
    cy.get('button').contains('Add Slide').click();
    cy.wait(1000);
    cy.get('button').contains('Add Slide').click();
    cy.wait(1000);
    cy.contains('4').should('be.visible');
  });

  it('Switch between slides successfully', () => {
    cy.contains(presentation.updatedName).click();
    cy.get('button').contains('>').click();
    cy.contains('2').should('be.visible');
  });

  it('Delete a presentation successfully', () => {
    cy.contains(presentation.updatedName).click();
    cy.get('button').contains('Delete Presentation').click();
    cy.get('button').contains('Confirm').click();
    cy.contains(presentation.updatedName).should('not.exist');
  });

  it('Logs out of the application successfully', () => {
    cy.get('button').contains('Log out').click();
    cy.contains('Log in').should('be.visible');
  });

  it('Logs back into the application successfully', () => {
    cy.get('button').contains('Log out').click();
    cy.visit('/login');
    cy.get('input[placeholder="Email"]').type(adminUser.email);
    cy.get('input[placeholder="Password"]').type(adminUser.password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });
});