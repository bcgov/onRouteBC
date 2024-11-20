describe('Login Test for OnRouteBC', () => {
  it('Should navigate to the login page, find the login button, and enter credentials', () => {
    // Retrieve the environment variables
    const username = Cypress.env('idir_username');
    const password = Cypress.env('idir_password');
    const void_url = Cypress.env('void_url');

    // Step 1: Visit the base URL
    cy.visit('/');

    // Step 2: Find and click the login button by its idir
    cy.get('#login-idir').click();
    cy.wait(5000);

    // Step 3: Enter credentials
    cy.get('#user').type(username); 
    cy.get('#password').type(password);
    cy.wait(5000);

    // Step 4: Submit the login form
    cy.get('[name="btnSubmit"]').click();
    cy.wait(5000);

    // Step 5: Find the search button by its class name and click it
    cy.get('.search-button').click();
    cy.wait(5000);

    // Step 6: Find the element with value="companies" and interact with it
    cy.get('[value="companies"]').click();
    cy.wait(5000);

    // Step 7: Find elements to amend application
    cy.get('.css-1pog434').type('chief');
    cy.wait(5000);

    cy.get('.search-by__search').click();
    cy.wait(5000);

    cy.xpath("//button[text()='Chief, Master']").click();
    cy.wait(5000);

    cy.xpath("//div[@class='tab__label' and text()='Active Permits']").click();
    cy.wait(5000);

    cy.get('[id="actions-button"]').first().scrollIntoView().wait(3000).click({ force: true });
    cy.wait(5000);

    cy.xpath("//li[text()='Void/Revoke']").click();
    cy.wait(5000);

    cy.get('[name="reason"]').type('void it for test');
    cy.wait(5000);

    cy.xpath("//button[text()='Continue']").click();
    cy.wait(5000);

    cy.xpath("//button[text()='Finish']").click();
    cy.wait(5000);
  });
});