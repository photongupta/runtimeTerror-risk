const {assert} = require('chai');
const Game = require('../src/game');
const Country = require('../src/country');

describe('Game', function() {
  it('should give instance of game class', function() {
    const game = new Game(['india', 'china']);
    assert.instanceOf(game, Game);
  });

  context('status', () => {
    it('should give current status of the game', () => {
      const game = new Game(['india', 'china']);
      game.addPlayer('John');
      assert.deepStrictEqual(game.status, {
        currentStage: 1,
        remainingMilitaryCount: 25,
        activities: [{ msg: 'John has joined.' }]
      });
    });
  });

  context('addPlayer', () => {
    it('should add a new player in player list', () => {
      const game = new Game(['india', 'china']);
      assert.strictEqual(game.addPlayer('Player1'), 1);
    });
  });

  context('addActivity', () => {
    it('should add a new activity', () => {
      const game = new Game(['india', 'china']);
      assert.strictEqual(game.addActivity('New game started'), 1);
    });
  });

  context('reinforcement', () => {
    it('should give false status when the stage is not 2 ', () => {
      const game = new Game(new Country('india', ['china']));
      assert.deepStrictEqual(game.reinforcement('india', 1), {
        status: false
      });
    });
  });
});
