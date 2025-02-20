describe('Crud for trailer', () => {
  it('Should company info displayed', () => {
    // Retrieve the environment variables
    const username = Cypress.env('bceid_username');
    const password = Cypress.env('bceid_password');
    const manage_profiles_url = '/manage-profiles';
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

    // 1.	Company info displayed – check
    cy.visit(manage_profiles_url);
    cy.wait(wait_time);

    cy.contains('Doing Business As (DBA)')
      .next() // Select the next sibling
      .should('exist') // Ensure the next sibling exists
      .and('not.be.empty') // Ensure it's not empty
      .invoke('text') // Get the text content
      .should('not.match', /^\s*$/); // Ensure it is not just whitespace

    cy.contains('Company Mailing Address')
      .next()
      .should('exist')
      .and('not.be.empty')
      .invoke('text') 
      .should('not.match', /^\s*$/); 

    cy.contains('Company Contact Details')
      .next()
      .should('exist')
      .and('not.be.empty')
      .invoke('text') 
      .should('not.match', /^\s*$/); 

    cy.contains('Company Primary Contact')
      .next()
      .should('exist')
      .and('not.be.empty')
      .invoke('text') 
      .should('not.match', /^\s*$/); 

    // 2.	Can update company info – check
    cy.contains('button', 'Edit').should('exist').click();
    cy.wait(wait_time);

    cy.get('[name="alternateName"]').clear().type('onRouteBC Test 1');
    cy.wait(wait_time);

    cy.get('[name="mailingAddress.addressLine1"]').clear().type('123 Main Street');
    cy.wait(wait_time);

    cy.contains('button', 'Save').should('exist').click();
    cy.wait(wait_time);

    // 3.	My information displayed – check
    cy.visit(manage_profiles_url);
    cy.wait(wait_time);

    cy.contains('.tab__label', 'My Information').should('exist').click();
    cy.wait(wait_time);

    cy.get('h3.css-jbf51a').should('exist')
      .next()
      .should('exist')
      .and('not.be.empty')
      .invoke('text') 
      .should('not.match', /^\s*$/); 


    // 4.	Can update my info – check
    cy.contains('button', 'Edit').should('exist').click();
    cy.wait(wait_time);

    cy.get('[name="firstName"]').clear().type('ORBC');
    cy.wait(wait_time);

    cy.contains('button', 'Save').should('exist').click();
    cy.wait(wait_time);

    // 5.	Users displayed – check
    cy.contains('.tab__label', 'Add / Manage Users').should('exist').click();
    cy.wait(wait_time);
    cy.contains('td', 'ORBCTST1').should('exist');

    // 6.	Can edit users – check
    cy.get('#actions-button').click();
    cy.wait(wait_time);

    cy.get('.onroutebc-table-row-actions__menu-item').click();
    cy.wait(wait_time);

    cy.get('[name="phone1Extension"]').clear().type('1234');
    cy.wait(wait_time);

    cy.contains('button', 'Save').should('exist').click();
    cy.wait(wait_time);

    // 7.	User sort works - check
    cy.get('div.Mui-TableHeadCell-Content-Wrapper').contains('First Name').click();
    cy.wait(wait_time);

    cy.get('div.Mui-TableHeadCell-Content-Wrapper').contains('Last Name').click();
    cy.wait(wait_time);

    cy.get('div.Mui-TableHeadCell-Content-Wrapper').contains('User Group').click();
    cy.wait(wait_time);

    cy.get('div.Mui-TableHeadCell-Content-Wrapper').contains('Date Created').click();
    cy.wait(wait_time);

  });
});

