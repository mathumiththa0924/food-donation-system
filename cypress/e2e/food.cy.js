describe('Namma Food Donation E2E Test', () => {
  it('Website open aagi, Login button click aaganum', () => {
    
    // 1. Website-ah open pannu
    cy.visit('http://localhost:5173/') 
    
    // 2. 'Login' nu ezhuthi irukka button-ah thedi click pannu!
    cy.contains('Login').click()

    // 3. Konjam neram ninnu paapom magic-ah
    cy.wait(2000)
    
  })
})