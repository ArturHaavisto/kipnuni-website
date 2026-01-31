describe('API Health Check', () => {
  const apiUrl = 'http://localhost:3001';

  it('should return healthy status from API', () => {
    cy.request(`${apiUrl}/api/health`).then((response) => {
      expect(response.status).to.eq(200);
      expect(response.body).to.have.property('status', 'ok');
      expect(response.body).to.have.property('timestamp');
    });
  });

  it('should return 404 for unknown API routes', () => {
    cy.request({
      url: `${apiUrl}/api/unknown-route`,
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(404);
      expect(response.body).to.have.property('success', false);
    });
  });
});
