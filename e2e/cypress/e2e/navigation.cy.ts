describe('Navigation', () => {
  beforeEach(() => {
    cy.visit('/');
  });

  it('should have correct navigation links', () => {
    cy.get('a[href="/"]').should('contain', 'Home');
    cy.get('a[href="/about"]').should('contain', 'About');
    cy.get('a[href="/contact"]').should('contain', 'Contact');
  });

  it('should have header visible on all pages', () => {
    cy.get('header nav').should('be.visible');
    cy.get('header').within(() => {
      cy.contains('Kipnuni').should('be.visible');
    });
  });

  it('should have proper styling and layout', () => {
    // Check main content container
    cy.get('main').should('have.class', 'container');
    
    // Check button styling
    cy.get('button')
      .should('have.class', 'bg-blue-600')
      .and('be.visible');
  });
});
