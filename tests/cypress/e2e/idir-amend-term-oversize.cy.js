describe('Login Test for OnRouteBC', () => {
  it('Should navigate to the login page, find the login button, and enter credentials', () => {
    // Retrieve the environment variables
    const username = Cypress.env('idir_username');
    const password = Cypress.env('idir_password');
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

    // Step 5: Find the search button by its class name and click it
    cy.get('.search-button').click();
    cy.wait(wait_time);

    // Step 6: Find the element with value="companies" and interact with it
    cy.get('[value="companies"]').click();
    cy.wait(wait_time);

    // Step 7: Find elements to amend application
    cy.get('.css-1pog434').type('t');
    cy.wait(wait_time);
    cy.get('.search-by__search').click();
    cy.wait(wait_time);
    // cy.xpath("//button[text()='Test Transport Inc.']").click();
    cy.get('button.MuiTypography-root.MuiTypography-body2.MuiLink-root.MuiLink-underlineAlways.MuiLink-button.custom-action-link.css-mn35dv')
      .first()
      .click();
    cy.wait(wait_time);

    // create a new application in case there is no activate permit over there
    cy.get('[aria-label="Select"]').eq(1).click({ force: true });
    cy.wait(wait_time);

    // click term
    cy.get('.css-1hdidwq').eq(0).click({force: true});
    cy.wait(wait_time);
    
    // click term oversize
    cy.get('.css-1sucic7').eq(0).click({force: true});
    cy.wait(wait_time);

    cy.get('li.start-application-action__menu-item')
    .contains('p.MuiTypography-root', 'Term').first()
    .click({force: true});
    cy.wait(wait_time);

    cy.contains('li', 'Oversize').first().click();
    cy.wait(wait_time);

    cy.get('body').click({force: true});
    cy.wait(wait_time);

    // click "start application"
    cy.get('.start-application-action__btn').first().click({force: true});
    cy.wait(wait_time);

    cy.get('.start-application-action__btn').eq(1).click({force: true});
    cy.wait(wait_time);
    
    // fill out the form
    cy.get('[name="permitData.contactDetails.firstName"]').type('Load');
    cy.wait(wait_time);

    cy.get('[name="permitData.contactDetails.lastName"]').type('Test');
    cy.wait(wait_time);

    cy.get('[name="permitData.contactDetails.phone1"]').type('2501111234');
    cy.wait(wait_time);

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

    cy.get('input[type="checkbox"]').each(($checkbox) => {
      cy.wrap($checkbox).click({ force: true });
    });
    cy.wait(wait_time);

    cy.get('[data-testid="add-to-cart-btn"]').click({force: true});
    cy.wait(1000);

    // got to the cart and get the first item to edit
    cy.get('.shopping-cart-button').click({force: true});
          cy.wait(wait_time);

    cy.get('button.css-mn35dv')
      .contains("-A00")  
      .first()
      .click();

    cy.wait(wait_time);

    cy.get('button')
      .contains("Edit Application")
      .click();
    cy.wait(wait_time);
    cy.get('[name="permitData.vehicleDetails.year"').clear().type('2008');
    cy.wait(wait_time);
    cy.get('[data-testid="continue-application-button"]').click();
    cy.wait(wait_time);
    cy.get('[type="checkbox"]').check();
    cy.wait(wait_time);
    cy.xpath("//button[text()='Add to Cart']").click();
    cy.wait(wait_time);

    // let permit_number = '';
    // let real_permit_number = '';

    // cy.get('.MuiAlert-message') 
    //   .invoke('text') 
    //   .then((text) => {
    //     permit_number = text; 
    //     cy.log('Stored text:', permit_number); 
    //     const regex = /A1-(\d+-\d+)-A00/;
    //     const match = permit_number.match(regex);

    //     if (match && match[1]) {
    //       real_permit_number = match[1];
          
    //       cy.get('.shopping-cart-button').click({force: true});
    //       cy.wait(wait_time);

    //       cy.get('button')
    //         .contains(real_permit_number)
    //         .first() 
    //         .click(); 
    //       cy.wait(wait_time);

    //       cy.get('button')
    //         .contains("Edit Application")
    //         .click();
    //       cy.wait(wait_time);

    //       // Disable idir account payment
    //       // cy.get('div[role="combobox"]')
    //       // .contains('Select')  
    //       // .click(); 

    //       // cy.contains('li', 'Mastercard (Debit)').first().click();
    //       // cy.wait(wait_time);

    //       // cy.get('[name="additionalPaymentData.icepayTransactionId"]').type(1234);
    //       // cy.wait(wait_time);

    //       // cy.get('button[data-testid="pay-now-btn"]').click({force: true});
    //       // cy.wait(wait_time);

    //       // cy.visit('/');
    //       // cy.wait(wait_time);

    //       // // Find the search button by its class name and click it
    //       // cy.get('.search-button').click();
    //       // cy.wait(wait_time);

    //       // // Find the element with value="companies" and interact with it
    //       // cy.get('[value="companies"]').click();
    //       // cy.wait(wait_time);

    //       // // Find elements to amend application
    //       // cy.get('.css-1pog434').type('t');
    //       // cy.wait(wait_time);
    //       // cy.get('.search-by__search').click();
    //       // cy.wait(wait_time);
    //       // // cy.xpath("//button[text()='Test Transport Inc.']").click();
    //       // cy.get('button.MuiTypography-root.MuiTypography-body2.MuiLink-root.MuiLink-underlineAlways.MuiLink-button.custom-action-link.css-mn35dv')
    //       //   .first()
    //       //   .click();
    //       // cy.wait(wait_time);

    //       // cy.log('Extracted Part 3:', real_permit_number);

    //       // cy.xpath("//div[@class='tab__label' and text()='Active Permits']").click();
    //       // cy.wait(wait_time);

    //       // // Start the recursive search
    //       // findRowAndClick(real_permit_number, wait_time);

    //       // cy.xpath("//li[text()='Amend']").click();
    //       // cy.wait(wait_time);



    //       cy.get('[name="permitData.vehicleDetails.year"').clear().type('2008');
    //       cy.wait(wait_time);
    //       // cy.get('[name="comment"').clear().type('Make year updated');
    //       // cy.wait(wait_time);
    //       cy.get('[data-testid="continue-application-button"]').click();
    //       cy.wait(wait_time);
    //       cy.get('[type="checkbox"]').check();
    //       cy.wait(wait_time);
    //       cy.xpath("//button[text()='Add to Cart']").click();
    //       cy.wait(wait_time);
    //       // cy.xpath("//button[text()='Finish']").click();
    //       // cy.wait(wait_time);
    //     }
    //   });



  });
});

function findRowAndClick(real_permit_number, wait_time) {
  cy.get('tr') // Get all rows on the current page
    .then(($rows) => {
      // Check if any row matches the criteria
      const matchingRow = [...$rows].find((row) =>
        Cypress.$(row).find('td').first().text().includes(real_permit_number)
      );

      if (matchingRow) {
        // If a matching row is found, click the button inside it
        cy.wrap(matchingRow)
          .scrollIntoView()
          .find('.css-15mydm5')
          .click({ force: true }); 
      } else {
        // If no matching row is found, check if a "Next Page" button exists
        cy.get('button.css-wpmsjn') // "Next Page" button selector
          .last()
          .should('be.visible') // Ensure the button is visible
          .click({ force: true }) // Click the "Next Page" button
          .wait(wait_time); // Wait for the next page to load

        // Recursively call the function to search on the next page
        findRowAndClick(real_permit_number, wait_time);
      }
    });
}