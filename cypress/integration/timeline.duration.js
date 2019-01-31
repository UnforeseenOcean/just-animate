/// <reference types="Cypress" />
/// <reference types="../../dist/types" />

context('timeline.duration', () => {
  beforeEach(() => {
    cy.visit('cypress/index.html');
  });

  it('is as long as the latest keyframe', () => {
    /** @type {typeof window.just} */
    let just;
    cy.window()
      .then(win => (just = win.just))
      .then(() => {
        const t1 = new just.Timeline().animate('target', 2000, { x: 0 });
        expect(t1.duration).to.equal(2000);
      });
  });

  it('is as long as the latest animation', () => {
    /** @type {typeof window.just} */
    let just;
    cy.window()
      .then(win => (just = win.just))
      .then(() => {
        const mockAnimation = {
          duration: 900,
        };
        const t1 = new just.Timeline().add(mockAnimation, 100);
        expect(t1.duration).to.equal(1000);
      });
  });
});