describe('Login Test for OnRouteBC', () => {
  it('Should navigate to the login page, find the login button, and enter credentials', () => {
    // Retrieve the environment variables
    const username = Cypress.env('idir_username');
    const password = Cypress.env('idir_password');
    const home_url = '/idir/welcome';
    const report_url = 'idir/reports';
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

    // 1.	Sticky sidebar appears – check
    cy.get('button.nav-button.nav-button--home.nav-button--active').should('exist');
    cy.wait(wait_time);

    cy.get('button.nav-button.nav-button--report').should('exist');
    cy.wait(wait_time);

    cy.get('button.nav-button.nav-button--bfct').should('exist');
    cy.wait(wait_time);

    // 2.	Global search available – check
    cy.get('button.search-button').should('exist');
    cy.wait(wait_time);

    // Sticky sidebar
    // 1.	Home button works – check
    cy.get('button.nav-button.nav-button--home').click();
    cy.wait(wait_time);

    // 2.	Report button works – check
    cy.get('button.nav-button.nav-button--report').click();
    cy.wait(wait_time);

    cy.get('button[aria-label="View Report"]').click();
    cy.wait(wait_time);

    cy.visit(report_url);
    cy.wait(wait_time);

    cy.contains('span', 'Payment and Refund Detail').should('be.visible').click();
    cy.wait(wait_time);

    cy.get('button[aria-label="View Report"]').click();
    cy.wait(wait_time);









    
  });
});
