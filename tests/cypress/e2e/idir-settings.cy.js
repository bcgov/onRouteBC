describe('Login Test for OnRouteBC', () => {
  it('Should navigate to the login page, find the login button, and enter credentials', () => {
    // Retrieve the environment variables
    const username = Cypress.env('idir_username');
    const password = Cypress.env('idir_password');
    const home_url = '/idir/welcome';
    const applications_url = Cypress.env('/applications');
    const vehicles_url = Cypress.env('/manage-vehicles');
    const profiles_url = Cypress.env('/manage-profiles');
    const wait_time = Cypress.env('wait_time');

    // Step 1: Visit the base URL
    cy.visit('/');

    // Step 2: Find and click the login button by its idir
    cy.get('#login-idir').click();
    cy.wait(wait_time);

    
    // Step 3: Enter credentials
    cy.get('#user').type(username); 
    cy.get('#password').type(password);
    cy.wait(wait_time);

    // Step 4: Submit the login form
    cy.get('[name="btnSubmit"]').click();
    cy.wait(wait_time);


    // Home page – check
    cy.visit(home_url);
    cy.wait(wait_time);

    // 1.	Can suspend or unsespend company – check
    cy.get('.search-button').click();
    cy.wait(wait_time);

    // Find the element with value="companies" and interact with it
    cy.get('[value="companies"]').click();
    cy.wait(wait_time);

    // Find elements to amend application
    cy.get('.css-1pog434').type('t');
    cy.wait(wait_time);

    cy.get('.search-by__search').click();
    cy.wait(wait_time);

    cy.get('button.MuiTypography-root.MuiTypography-body2.MuiLink-root.MuiLink-underlineAlways.MuiLink-button.custom-action-link.css-mn35dv')
      .first()
      .click();
    cy.wait(wait_time);

    cy.contains('a', 'Settings').click();
    cy.wait(wait_time);

    cy.contains('.tab__label', 'Suspend').should('exist').click();
    cy.wait(wait_time);

    cy.get('input[type="checkbox"]')
      .click();
    cy.wait(wait_time);

    cy.get('textarea[name="comment"]')
      .type('This is a test comment');
    cy.wait(wait_time);

    cy.get('button[aria-label="Suspend Company"]').click();
    cy.wait(wait_time);

    // unsespend company
    cy.get('input[type="checkbox"]')
      .click();
    cy.wait(wait_time);

    // re-suspend company
    cy.get('input[type="checkbox"]')
      .click();
    cy.wait(wait_time);

    cy.get('textarea[name="comment"]')
      .type('This is a test comment for re-suspend');
    cy.wait(wait_time);

    cy.get('button[aria-label="Suspend Company"]').click();
    cy.wait(wait_time);

    // Check if the company is suspended on permit screen
    cy.contains('a', 'Permits').click();
    cy.wait(wait_time);

    cy.get('.bc-gov-alertbanner.bc-gov-alertbanner--error.suspend-snackbar')
      .should('exist')
      .and('have.attr', 'role', 'alert')
      .within(() => {
        cy.get('.bc-gov-alertbanner__msg')
          .should('have.text', 'Company suspended');
      });
    cy.wait(wait_time);

    // Check if the company is suspended on vehicles screen
    cy.contains('a', 'Vehicle Inventory').click();
    cy.wait(wait_time);

    cy.get('.bc-gov-alertbanner.bc-gov-alertbanner--error.suspend-snackbar')
      .should('exist')
      .and('have.attr', 'role', 'alert')
      .within(() => {
        cy.get('.bc-gov-alertbanner__msg')
          .should('have.text', 'Company suspended');
      });
    cy.wait(wait_time);

  // Check if the company is suspended on profiles screen
  cy.contains('a', 'Profile').click();
    cy.wait(wait_time);

  cy.get('.bc-gov-alertbanner.bc-gov-alertbanner--error.suspend-snackbar')
    .should('exist')
    .and('have.attr', 'role', 'alert')
    .within(() => {
      cy.get('.bc-gov-alertbanner__msg')
        .should('have.text', 'Company suspended');
    });
  cy.wait(wait_time);

  // unsuspend company
  cy.contains('a', 'Settings').click();
    cy.wait(wait_time);

    cy.contains('.tab__label', 'Suspend').should('exist').click();
    cy.wait(wait_time);

    cy.get('input[type="checkbox"]')
      .click();
    cy.wait(wait_time);
    
  });
});
