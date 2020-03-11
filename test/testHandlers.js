const request = require('supertest');
const {app} = require('../src/router');
const Controller = require('../src/controller');

describe('Handlers', () => {
  context('Requests for static files', () => {
    it('Should serve the index.html page', done => {
      request(app)
        .get('/index.html')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=UTF-8', done)
        .expect(/Host Game/);
    });

    it('Should serve the index.html page for /', done => {
      request(app)
        .get('/')
        .expect(200)
        .expect('Content-Type', 'text/html; charset=UTF-8', done)
        .expect(/Host Game/);
    });
  });

  context('Requests for game status', () => {
    beforeEach(() => {
      const controller = new Controller();
      controller.addGame(2);
      controller.getGame(1000).addPlayer('player1');
      app.locals = {controller};
    });
    it('Should give remainingMilitaryCount in game status', done => {
      request(app)
        .get('/gameStatus')
        .set('Cookie', '_gameId=1000;_playerId=indianred')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8', done)
        .expect(/leftMilitaryCount/);
    });

    it('Should give currentStage in game status', done => {
      request(app)
        .get('/gameStatus')
        .set('Cookie', '_gameId=1000;_playerId=indianred')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8', done)
        .expect(/currentStage/);
    });

    it('Should tell bad request if cookie is not present', done => {
      request(app)
        .get('/gameStatus')
        .expect(400, done)
        .expect({error: 'Game not found'});
    });

    it('Should tell bad request if invalid game id in cookie', done => {
      request(app)
        .get('/gameStatus')
        .set('Cookie', '_gameId=123')
        .expect(400, done)
        .expect({error: 'Game not found'});
    });
  });

  context('Request for claim territory', () => {
    it('Should claim the given territory if the fields are valid', done => {
      request(app)
        .post('/performClaim')
        .set('Cookie', '_gameId=1000;_playerId=indianred')
        .send({territory: 'india'})
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8', done)
        .expect(/status/);
    });

    it('Should respond with "Bad Request" if the fields are invalid', done => {
      request(app)
        .post('/performClaim')
        .set('Cookie', '_gameId=1000;_playerId=indianred')
        .send({country: 'india'})
        .expect(400, done);
    });
  });

  context('performReinforcement', () => {
    beforeEach(() => {
      const controller = new Controller();
      controller.addGame(2);
      controller.getGame(1000).addPlayer('player1');
      app.locals = {controller};
    });

    it('Should reinforce the given territory if the reinforcement is valid', done => {
      request(app)
        .post('/reinforcement')
        .set('Cookie', '_gameId=1000;_playerId=indianred')
        .send({territory: 'india', militaryCount: 1})
        .expect(200, done)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect(/status/);
    });

    it('Should respond with "Bad Request" if the fields are invalid', done => {
      request(app)
        .post('/reinforcement')
        .set('Cookie', '_gameId=1000;_playerId=indianred')
        .send({country: 'india'})
        .expect(400, done);
    });
  });

  context('JoinGame', () => {
    beforeEach(() => {
      const controller = new Controller();
      controller.addGame(2);
      controller.getGame(1000).addPlayer('player1');
      app.locals = {controller};
    });
    it('Should join the game for valid gameId', done => {
      request(app)
        .post('/joinGame')
        .send({playerName: 'india', gameId: 1000})
        .expect(200)
        .expect({joinStatus: true}, done);
    });

    it('Should not join the game for invalid gameId', done => {
      request(app)
        .post('/joinGame')
        .send({playerName: 'india', gameId: 3})
        .expect(200)
        .expect({joinStatus: false, errorMsg: 'Invalid Game Id(3)'}, done);
    });
    it('Should not join the game for invalid gameId', done => {
      app.locals.controller.join(1000, 'player2');
      request(app)
        .post('/joinGame')
        .send({playerName: 'india', gameId: 1000})
        .expect(200)
        .expect({joinStatus: false, errorMsg: 'Game already started'}, done);
    });
  });

  context('HostGame', () => {
    beforeEach(() => {
      const controller = new Controller();
      app.locals = {controller};
    });
    it('Should host a new game', done => {
      request(app)
        .post('/hostGame')
        .send({playerName: 'india', numOfPlayers: 2})
        .expect(200)
        .expect({gameId: 1000}, done);
    });
  });

  context('Request for game details', () => {
    beforeEach(() => {
      const controller = new Controller();
      controller.addGame(2);
      controller.getGame(1000).addPlayer('player1');
      app.locals = {controller};
    });
    it('Should give the gameId and number of players of a perticular game', done => {
      request(app)
        .get('/gameDetails')
        .set('Cookie', '_gameId=1000;')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8', done)
        .expect({gameId: '1000', numOfPlayers: 2});
    });
  });

  context('Request for waiting status', () => {
    beforeEach(() => {
      const controller = new Controller();
      controller.addGame(2);
      controller.getGame(1000).addPlayer('player1');
      app.locals = {controller};
    });
    it('Should give the number of joined players and status about starting of a perticular game', done => {
      request(app)
        .get('/waitingStatus')
        .set('Cookie', '_gameId=1000;')
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8', done)
        .expect({
          isAllPlayersJoined: false,
          numOfJoinedPlayers: 1,
          playerColorAndName: [
            {
              color: 'indianred',
              name: 'player1'
            }
          ]
        });
    });
  });

  context('validatePlayer', () => {
    beforeEach(() => {
      const controller = new Controller();
      controller.addGame(2);
      controller.getGame(1000).addPlayer('player1');
      app.locals = {controller};
    });

    it('Should claim the given territory if the requested player is current player', done => {
      request(app)
        .post('/performClaim')
        .set('Cookie', '_gameId=1000;_playerId=indianred')
        .send({territory: 'india'})
        .expect(200)
        .expect('Content-Type', 'application/json; charset=utf-8', done)
        .expect(/status/);
    });

    it('Should give 404 when the requested player is not the current player', done => {
      request(app)
        .post('/reinforcement')
        .set('Cookie', '_gameId=1000;_playerId=red')
        .send({territory: 'india', militaryCount: 1})
        .expect(404, done)
        .expect('Content-Type', 'application/json; charset=utf-8')
        .expect({error: 'Invalid Player'});
    });
  });

  context('hasGameStarted', () => {
    beforeEach(() => {
      const controller = new Controller();
      controller.addGame(2);
      controller.getGame(1000).addPlayer('player1');
      app.locals = { controller };
    });

    it('Should redirect to the waiting page when the game is not started', done => {
      request(app)
        .get('/game.html')
        .set('Cookie', '_gameId=1000;_playerId=indianred')
        .expect(302, done);
    });

    it('Should go to the next handler when the game is already started', done => {
      app.locals.controller.getGame(1000).addPlayer('player2');
      request(app)
        .get('/game.html')
        .set('Cookie', '_gameId=1000;_playerId="indianred"')
        .expect(200, done);
    });
  });
});
