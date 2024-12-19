describe('Crud for power unit', () => {
  it('Should create, update or delete a power unit', () => {
    // Retrieve the environment variables
    const username = Cypress.env('bceid_username');
    const password = Cypress.env('bceid_password');
    const new_power_unit_url = '/manage-vehicles/add-powerunit';
    const update_power_unit_url = Cypress.env('update_power_unit_url');
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

    cy.visit(new_power_unit_url);
    cy.wait(5000);

    // create new power unit
    // cy.get('[name="unitNumber"]').type('MCL37');
    // cy.wait(5000);

    cy.get('[name="make"]').type('Toyota');
    cy.wait(5000);

    cy.get('[name="year"]').type('2002');
    cy.wait(5000);

    cy.get('[name="vin"]').type('MCL37A');
    cy.wait(5000);

    cy.get('[name="plate"]').type('VB0007');
    cy.wait(5000);

    cy.get('[id="mui-component-select-powerUnitTypeCode"]').click({ force: true });
    cy.wait(5000);

    cy.get('[data-value="BUSCRUM"]').click();
    cy.wait(5000);

    cy.get('[id="mui-component-select-countryCode"]').scrollIntoView().click();
    cy.wait(5000);

    cy.get('[data-value="CA"]').click();
    cy.wait(5000);

    cy.get('[id="mui-component-select-provinceCode"]').click();
    cy.wait(5000);

    cy.get('[data-value="AB"]').click();
    cy.wait(5000);

    cy.get('[name="licensedGvw"]').type('2000');
    cy.wait(5000);

    cy.get('.css-xie432').click();
    cy.wait(5000);

    // update power unit
    cy.visit(manage_vehicle_url);
    cy.wait(5000);

    cy.get('.css-15mydm5').first().scrollIntoView().wait(3000).click({ force: true });
    cy.wait(5000);

    cy.xpath("//li[text()='Edit']").click();
    cy.wait(5000);

    cy.get('[name="make"]').clear().type('Toyota');
    cy.wait(5000);

    cy.get('[name="year"]').clear().type('2021');
    cy.wait(5000);

    cy.get('[name="licensedGvw"]').clear().type('3000');
    cy.wait(5000);

    cy.get('.css-xie432').click();
    cy.wait(5000);

    // delete power unit
    cy.visit(manage_vehicle_url);
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

