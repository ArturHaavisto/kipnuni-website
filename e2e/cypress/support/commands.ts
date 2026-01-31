// ***********************************************
// Custom Cypress commands
// ***********************************************

// Example custom command
Cypress.Commands.add('login', (email: string, password: string) => {
  // Custom login implementation
  cy.log(`Logging in as ${email}`);
});

// Declare types for custom commands
declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>;
    }
  }
}

export {};
