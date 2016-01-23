// start slingin' some d3 here.


// setup the game environment

var environment = {
  height: 450,
  width: 700,
  numEnemies: 15,
  padding: 20
};

var score = {
  currentScore: 0,
  highScore: 0
};

// setup the game board

var gameBoard = d3.select('.board').append('svg:svg')
  .attr('width', environment.width).attr('height', environment.height);


// update current score and high score

d3.select('.current').text(score.currentScore.toString());

score.highScore = Math.max(score.currentScore, score.highScore);
d3.select('.highscore').text(score.highScore);