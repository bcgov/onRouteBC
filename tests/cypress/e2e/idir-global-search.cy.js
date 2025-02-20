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

    // 1.	Can search permits by permit number (checked with active and expired permits) – check
    cy.get('.search-button').click();
    cy.wait(wait_time);

    cy.get('input[type="text"]')
      .should('be.visible')
      .type('1');
    cy.wait(wait_time);

    cy.get('.search-by__search').click();
    cy.wait(wait_time);

    cy.get('.onroutebc-chip.permit-chip.permit-chip--expired').should('exist');
    cy.wait(wait_time);

    cy.get('.PrivateSwitchBase-input.MuiSwitch-input').click();
    cy.wait(wait_time);

    cy.contains('p', 'No records to display').should('exist');
    cy.wait(wait_time);

    cy.get('.PrivateSwitchBase-input.MuiSwitch-input').click();
    cy.wait(wait_time);

    // Can view permit pdf
    cy.get('.MuiTypography-root.MuiTypography-body2.MuiLink-root.MuiLink-underlineAlways.MuiLink-button.custom-action-link')
      .first()
      .click();
    cy.wait(wait_time);

    // Can view receipt pdf
    cy.get('button#actions-button')
      .first()
      .click({force: true});
    cy.wait(wait_time);

    cy.get('li[data-option-value="viewReceipt"]')
      .click({force: true});
    cy.wait(wait_time);

    cy.visit(home_url);
    cy.wait(wait_time);

    cy.get('.search-button').click();
    cy.wait(wait_time);

    cy.get('input[type="text"]')
      .should('be.visible')
      .type('1');
    cy.wait(wait_time);

    cy.get('.search-by__search').click();
    cy.wait(wait_time);

    cy.get('button#actions-button')
      .first()
      .click({force: true});
    cy.wait(wait_time);

    cy.get('li[data-option-value="resend"]')
      .click({force: true});
    cy.wait(wait_time);

    cy.get('input.PrivateSwitchBase-input[type="checkbox"]').eq(1).click({ force: true });
    cy.wait(wait_time);

    cy.get('input[data-testid="input-email"]').type('bruce.wang@bc.gov.ca');
    cy.wait(wait_time);

    // cy.get('button').contains('Resend').click();
    // cy.wait(wait_time);

    // cy.get('button#actions-button')
    //   .first()
    //   .click({force: true});
    // cy.wait(wait_time);

    // cy.get('li[data-option-value="resend"]')
    //   .click({force: true});
    // cy.wait(wait_time);

    // Can cancel the resend
    cy.get('button')
      .contains('Cancel')
      .click();
    cy.wait(wait_time);

    
  });
});
