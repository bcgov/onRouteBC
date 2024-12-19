describe('Crud for trailer', () => {
  it('Should create, update or delete a trailer', () => {
    // Retrieve the environment variables
    const username = Cypress.env('bceid_username');
    const password = Cypress.env('bceid_password');
    const new_trailer_url = '/manage-vehicles/add-trailer';
    const update_trailer_url = Cypress.env('update_trailer_url');
    const manage_vehicle_url = '/manage-vehicles';

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

    cy.visit(new_trailer_url);
    cy.wait(5000);

    // create new trailer
    // cy.get('[name="unitNumber"]').type('TCL37');
    // cy.wait(5000);

    cy.get('[name="make"]').type('NISSAN');
    cy.wait(5000);

    cy.get('[name="year"]').type('2005');
    cy.wait(5000);

    cy.get('[name="vin"]').type('TCL37A');
    cy.wait(5000);

    cy.get('[name="plate"]').type('VT0007');
    cy.wait(5000);

    cy.get('[id="mui-component-select-trailerTypeCode"]').click({ force: true });
    cy.wait(5000);

    cy.get('[data-value="BOOSTER"]').click();
    cy.wait(5000);

    cy.get('[id="mui-component-select-countryCode"]').scrollIntoView().click();
    cy.wait(5000);

    cy.get('[data-value="CA"]').click();
    cy.wait(5000);

    cy.get('[id="mui-component-select-provinceCode"]').click();
    cy.wait(5000);

    cy.get('[data-value="BC"]').click();
    cy.wait(5000);

    cy.get('.css-xie432').click();
    cy.wait(5000);

    // update power unit
    cy.visit(manage_vehicle_url);
    cy.wait(5000);

    cy.get('.tab__label').contains('Trailer').click();
    cy.wait(5000);

    cy.get('.css-15mydm5').first().scrollIntoView().wait(3000).click({ force: true });
    cy.wait(5000);

    cy.xpath("//li[text()='Edit']").click();
    cy.wait(5000);

    cy.get('[name="make"]').clear().type('BMW');
    cy.wait(5000);

    // cy.get('[name="unitNumber"]').clear().type('TCL37');
    // cy.wait(5000);

    cy.get('[name="year"]').clear().type('2021');
    cy.wait(5000);

    cy.get('.css-xie432').click();
    cy.wait(5000);


    // delete trailer
    cy.visit(manage_vehicle_url);
    cy.wait(5000);

    cy.get('.tab__label').contains('Trailer').click();
    cy.wait(5000);

    cy.xpath("(//input[@type='checkbox'])[2]")
    .then(($checkbox) => {
      if (!$checkbox.prop('checked')) { // Check if it's not selected
        cy.wrap($checkbox).click(); // Select it if not already checked
      }
    });
    cy.wait(5000);

    cy.get('.delete-btn--active').click();
    cy.wait(5000);

    cy.get('.css-1a53fri').click();
    cy.wait(5000);

  });
});

