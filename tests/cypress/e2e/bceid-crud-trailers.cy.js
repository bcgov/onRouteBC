describe('Crud for trailer', () => {
  it('Should create, update or delete a trailer', () => {
    // Retrieve the environment variables
    const username = Cypress.env('bceid_username');
    const password = Cypress.env('bceid_password');
    const new_trailer_url = '/manage-vehicles/add-trailer';
    const update_trailer_url = Cypress.env('update_trailer_url');
    const manage_vehicle_url = '/manage-vehicles';
    const wait_time = Cypress.env('wait_time');

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

    cy.visit(new_trailer_url);
    cy.wait(wait_time);

    // create new trailer
    // cy.get('[name="unitNumber"]').type('TCL37');
    // cy.wait(wait_time);

    cy.get('[name="make"]').type('NISSAN');
    cy.wait(wait_time);

    cy.get('[name="year"]').type('2005');
    cy.wait(wait_time);

    cy.get('[name="vin"]').type('TCL37A');
    cy.wait(wait_time);

    cy.get('[name="plate"]').type('VT0007');
    cy.wait(wait_time);

    cy.get('[id="mui-component-select-trailerTypeCode"]').click({ force: true });
    cy.wait(wait_time);

    cy.get('[data-value="BOOSTER"]').click();
    cy.wait(wait_time);

    cy.get('[id="mui-component-select-countryCode"]').scrollIntoView().click();
    cy.wait(wait_time);

    cy.get('[data-value="CA"]').click();
    cy.wait(wait_time);

    cy.get('[id="mui-component-select-provinceCode"]').click();
    cy.wait(wait_time);

    cy.get('[data-value="BC"]').click();
    cy.wait(wait_time);

    cy.get('.css-xie432').click();
    cy.wait(wait_time);

    // update power unit
    cy.visit(manage_vehicle_url);
    cy.wait(wait_time);

    cy.get('.tab__label').contains('Trailer').click();
    cy.wait(wait_time);

    cy.get('.css-15mydm5').first().scrollIntoView().wait(3000).click({ force: true });
    cy.wait(wait_time);

    cy.xpath("//li[text()='Edit']").click();
    cy.wait(wait_time);

    cy.get('[name="make"]').clear().type('BMW');
    cy.wait(wait_time);

    // cy.get('[name="unitNumber"]').clear().type('TCL37');
    // cy.wait(wait_time);

    cy.get('[name="year"]').clear().type('2021');
    cy.wait(wait_time);

    cy.get('.css-xie432').click();
    cy.wait(wait_time);


    // delete trailer
    cy.visit(manage_vehicle_url);
    cy.wait(wait_time);

    cy.get('.tab__label').contains('Trailer').click();
    cy.wait(wait_time);

    cy.xpath("(//input[@type='checkbox'])[2]")
    .then(($checkbox) => {
      if (!$checkbox.prop('checked')) { // Check if it's not selected
        cy.wrap($checkbox).click(); // Select it if not already checked
      }
    });
    cy.wait(wait_time);

    cy.get('.delete-btn--active').click();
    cy.wait(wait_time);

    cy.get('.css-1a53fri').click();
    cy.wait(wait_time);

  });
});

