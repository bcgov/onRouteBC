describe('Login Test for OnRouteBC', () => {
  it('Should navigate to the login page, find the login button, and enter credentials', () => {
    // Retrieve the environment variables
    const username = Cypress.env('idir_username');
    const password = Cypress.env('idir_password');
    const void_url = Cypress.env('void_url');
    const new_tros_url = '/create-application/TROS';

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
    cy.get('.css-1pog434').type('t');
    cy.wait(5000);

    cy.get('.search-by__search').click();
    cy.wait(5000);

    cy.xpath("//button[text()='Test Transport Inc.']").click();
    cy.wait(5000);

    cy.xpath("//div[@class='tab__label' and text()='Active Permits']").click();
    cy.wait(5000);

    // create a permit first
    // click select
    cy.get('[aria-label="Select"]').eq(1).click({ force: true });
    cy.wait(5000);

    // click term
    cy.get('.css-1hdidwq').eq(0).click({force: true});
    cy.wait(5000);
    
    // click term oversize
    cy.get('.css-1sucic7').eq(0).click({force: true});
    cy.wait(5000);

    cy.get('li.start-application-action__menu-item')
    .contains('p.MuiTypography-root', 'Term').first()
    .click({force: true});
    cy.wait(5000);

    cy.contains('li', 'Oversize').first().click();
    cy.wait(5000);

    cy.get('body').click({force: true});
    cy.wait(5000);

    // click "start application"
    cy.get('.start-application-action__btn').first().click({force: true});
    cy.wait(5000);

    cy.get('.start-application-action__btn').eq(1).click({force: true});
    cy.wait(5000);
    
    // fill out the form
    cy.get('[name="permitData.contactDetails.firstName"]').type('Load');
    cy.wait(5000);

    cy.get('[name="permitData.contactDetails.lastName"]').type('Test');
    cy.wait(5000);

    cy.get('[name="permitData.contactDetails.phone1"]').type('2501111234');
    cy.wait(5000);

    cy.get('#application-select-vehicle').type('MCL36');
    cy.wait(5000);

    cy.get('[name="permitData.vehicleDetails.vin"]').click({ force: true }).type('MCL36A');
    cy.wait(5000);

    cy.get('[name="permitData.vehicleDetails.plate"]').type('L4NDO');
    cy.wait(5000);

    cy.get('[name="permitData.vehicleDetails.make"]').type('BMW');
    cy.wait(5000);

    cy.get('[name="permitData.vehicleDetails.year"]').type('2020');
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

    cy.get('[data-value="powerUnit"]').click();
    cy.wait(5000);

    cy.get('[id="mui-component-select-permitData.vehicleDetails.vehicleSubType"]').click({ force: true });
    cy.wait(5000);
    
    cy.get('[data-value="REGTRCK"]').click();
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

    // cy.get('div.MuiSelect-select[aria-controls=":r1g:"]').click();
    // cy.wait(5000);
    cy.get('div[role="combobox"]')
    .contains('Select')  
    .click(); 

    cy.contains('li', 'Mastercard (Debit)').first().click();
    cy.wait(5000);

    cy.get('[name="additionalPaymentData.icepayTransactionId"]').type(1234);
    cy.wait(5000);

    cy.get('button[data-testid="pay-now-btn"]').click({force: true});
    cy.wait(5000);

    cy.visit('/');
    cy.wait(5000);

    // Search to find the search button by its class name and click it
    cy.get('.search-button').click();
    cy.wait(5000);

    // Find the element with value="companies" and interact with it
    cy.get('[value="companies"]').click();
    cy.wait(5000);

    // Find elements to amend application
    cy.get('.css-1pog434').type('t');
    cy.wait(5000);

    cy.get('.search-by__search').click();
    cy.wait(5000);

    cy.xpath("//button[text()='Test Transport Inc.']").click();
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