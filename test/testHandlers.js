const request = require('supertest');
const {app} = require('../src/router');

describe('Handlers', () => {
  context('Requests for static files', () => {
    it('Should serve the index.html page', done => {
      request(app)
        .get('/index.html')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=UTF-8', done)
        .expect(/\.\/scripts\/map\.js/);
    });

    it('Should serve the index.html page for /', done => {
      request(app)
        .get('/')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=UTF-8', done)
        .expect(/\.\/scripts\/map\.js/);
    });
  });

  context('Requests for game status', () => {
    it('Should give remainingMilitaryCount in game status', done => {
      request(app)
        .get('/gameStatus')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8', done)
        .expect(/remainingMilitaryCount/);
    });

    it('Should give currentStage in game status', done => {
      request(app)
        .get('/gameStatus')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8', done)
        .expect(/currentStage/);
    });
  });

  context('Request for claim territory', () => {
    it('Should claim the given territory if the fields are valid', done => {
      request(app)
        .post('/claimTerritory')
        .send({territory: 'india'})
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8', done)
        .expect(/status/);
    });

    it('Should respond with "Bad Request" if the fields are invalid', done => {
      request(app)
        .post('/claimTerritory')
        .send({country: 'india'})
        .expect(400, done);
    });
  });
});
