describe('Login Test for OnRouteBC', () => {
  it('Should navigate to the login page, find the login button, and enter credentials', () => {
    // Retrieve the environment variables
    const username = Cypress.env('bceid_username');
    const password = Cypress.env('bceid_password');
    const wait_time = Cypress.env('wait_time');
    // const update_term_oversize_url = Cypress.env('update_term_oversize_url');

    // Step 1: Visit the base URL
    cy.visit('/');

    // Step 2: Find and click the login button by its idir
    cy.get('#login-bceid').click();
    cy.wait(wait_time);

    // Step 3: Enter credentials
    cy.get('#user').type(username); 
    cy.get('#password').type(password);
    cy.wait(wait_time);

    // Step 4: Submit the login form
    cy.get('[name="btnSubmit"]').click();
    cy.wait(wait_time);




    // new a TROS application first
    cy.visit('/create-application/TROS');
    cy.wait(wait_time);

    // fill out the form
    cy.get('#application-select-vehicle').type('MCL36');
    cy.wait(wait_time);

    cy.get('[name="permitData.vehicleDetails.vin"]').click({ force: true }).type('MCL36A');
    cy.wait(wait_time);

    cy.get('[name="permitData.vehicleDetails.plate"]').type('L4NDO');
    cy.wait(wait_time);

    cy.get('[name="permitData.vehicleDetails.make"]').type('BMW');
    cy.wait(wait_time);

    cy.get('[name="permitData.vehicleDetails.year"]').type('2020');
    cy.wait(wait_time);

    cy.get('[id="mui-component-select-permitData.vehicleDetails.countryCode"]').scrollIntoView().click();
    cy.wait(wait_time);

    cy.get('[data-value="CA"]').click();
    cy.wait(wait_time);

    cy.get('[id="mui-component-select-permitData.vehicleDetails.provinceCode"]').click();
    cy.wait(wait_time);

    cy.get('[data-value="BC"]').click();
    cy.wait(wait_time);

    cy.get('[id="mui-component-select-permitData.vehicleDetails.vehicleType"]').click(({ force: true }));
    cy.wait(wait_time);

    cy.get('[data-value="powerUnit"]').click();
    cy.wait(wait_time);

    cy.get('[id="mui-component-select-permitData.vehicleDetails.vehicleSubType"]').click({ force: true });
    cy.wait(wait_time);
    
    cy.get('[data-value="REGTRCK"]').click();
    cy.wait(wait_time);

    cy.get('[data-testid="continue-application-button"]').click({ force: true });
    cy.wait(wait_time);


    // get the application id just created
    cy.get('.MuiAlert-message').invoke('text').then((text) => {
      const match = text.match(/A2-\d{8}-\d{3}-\w{2}/);
      if (match) {
        const extractedValue = match[0];

        cy.visit('/applications');
        cy.wait(wait_time);
    
        cy.get('a.column-link--application-details').each(($el) => {
          cy.wrap($el).invoke('text').then((linkText) => {
            if (linkText.includes(extractedValue)) {
              cy.wrap($el).click();
              cy.get('[name="permitData.contactDetails.phone1Extension"]').clear().type('0003');
              cy.wait(wait_time);

              // save updates
              cy.get('[data-testid="save-application-button"]').click();
              cy.wait(wait_time);
              return false; // Breaks out of the .each() loop once the item is clicked
            }
          });
        });
      } else {
        cy.log('No matching value found in the alert message');
      }
    });
    
    

    

    // cy.get('a.column-link--application-details').first().click();
    // cy.wait(wait_time);

    // update phone ext
    // cy.get('[name="permitData.contactDetails.phone1Extension"]').clear().type('0003');
    // cy.wait(wait_time);

    // // save updates
    // cy.get('[data-testid="save-application-button"]').click();
    // cy.wait(wait_time);
  });
});
