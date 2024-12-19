describe('Login Test for OnRouteBC', () => {
  it('Should navigate to the login page, find the login button, and enter credentials', () => {
    // Retrieve the environment variables
    const username = Cypress.env('bceid_username');
    const password = Cypress.env('bceid_password');
    const new_trow_url = '/create-application/TROW';

    // Step 1: Visit the base URL
    cy.visit('/');

    // Step 2: Find and click the login button by its idir
    cy.get('#login-bceid').click();
    cy.wait(5000);

    // Step 3: Enter credentials
    cy.get('#user').type(username); 
    cy.get('#password').type(password);
    cy.wait(5000);

    // Step 4: Submit the login form
    cy.get('[name="btnSubmit"]').click();
    cy.wait(5000);

    cy.visit(new_trow_url);
    cy.wait(5000);

    // fill out the form
    cy.get('#application-select-vehicle').type('123');
    cy.wait(5000);

    cy.get('[name="permitData.vehicleDetails.vin"]').click({ force: true }).type('115588');
    cy.wait(5000);

    cy.get('[name="permitData.vehicleDetails.plate"]').type('1B25F');
    cy.wait(5000);

    cy.get('[name="permitData.vehicleDetails.make"]').type('PHIL');
    cy.wait(5000);

    cy.get('[name="permitData.vehicleDetails.year"]').type('1992');
    cy.wait(5000);

    cy.get('[id="mui-component-select-permitData.vehicleDetails.countryCode"]').scrollIntoView().click();
    cy.wait(5000);

    cy.get('[data-value="CA"]').click();
    cy.wait(5000);

    cy.get('[id="mui-component-select-permitData.vehicleDetails.provinceCode"]').click();
    cy.wait(5000);

    cy.get('[data-value="BC"]').click();
    cy.wait(5000);

    cy.get('[id="mui-component-select-permitData.vehicleDetails.vehicleType"]').click(({ force: true }));
    cy.wait(5000);

    cy.get('[data-value="trailer"]').click();
    cy.wait(5000);

    cy.get('[id="mui-component-select-permitData.vehicleDetails.vehicleSubType"]').click({ force: true });
    cy.wait(5000);
    
    cy.get('[data-value="DOLLIES"]').click();
    cy.wait(5000);

    cy.get('[data-testid="continue-application-button"]').click({ force: true });
    cy.wait(5000);

    cy.get('input[type="checkbox"]').each(($checkbox) => {
      cy.wrap($checkbox).click({ force: true });
    });
    cy.wait(5000);

    cy.get('[data-testid="add-to-cart-btn"]').click({force: true});
    cy.wait(5000);

    cy.get('.shopping-cart-button').click({force: true});
    cy.wait(5000);

    cy.get('[data-testid="pay-now-btn"]').scrollIntoView().click({force: true});
    cy.wait(5000);

  });
});
