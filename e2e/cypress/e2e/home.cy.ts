describe('Homepage', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should display the welcome message', () => {
    cy.contains('Welcome to Kipnuni').should('be.visible');
  });

  it('should display the header with navigation', () => {
    cy.get('header').should('be.visible');
    cy.contains('Home').should('be.visible');
    cy.contains('About').should('be.visible');
    cy.contains('Contact').should('be.visible');
  });

  it('should have working counter functionality', () => {
    // Check initial count
    cy.contains('Count: 0').should('be.visible');

    // Click increment button
    cy.contains('button', 'Increment').click();
    cy.contains('Count: 1').should('be.visible');

    // Click multiple times
    cy.contains('button', 'Increment').click();
    cy.contains('button', 'Increment').click();
    cy.contains('Count: 3').should('be.visible');
  });

  it('should have responsive layout', () => {
    // Test mobile viewport
    cy.viewport('iphone-x');
    cy.get('header').should('be.visible');
    cy.contains('Welcome to Kipnuni').should('be.visible');

    // Test tablet viewport
    cy.viewport('ipad-2');
    cy.get('header').should('be.visible');

    // Test desktop viewport
    cy.viewport(1280, 720);
    cy.get('header').should('be.visible');
  });
});
