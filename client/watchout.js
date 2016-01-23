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

var updateCurrentScore = function() {
  d3.select('.current').text(score.currentScore.toString());
};

var updateHighScore = function() {
  score.highScore = Math.max(score.currentScore, score.highScore);
  d3.select('.highscore').text(score.highScore.toString());
};

// create the player

var Player = function() {
  this.fill = '#00bfff';
  this.x = 0;
  this.y = 0;
  this.angle = 0;
  this.r = 5;
  this.path = 'm-7.5,1.62413c0,-5.04095 4.08318,-9.12413 9.12414,-9.12413c5.04096,0 9.70345,5.53145 11.87586,9.12413c-2.02759,2.72372 -6.8349,9.12415 -11.87586,9.12415c-5.04096,0 -9.12414,-4.08318 -9.12414,-9.12415z';
};

Player.prototype.restrictMotion = function() {
  this.environment = environment;
};

Player.prototype.render = function(to) {
  this.el = to.append('svg:path').attr('d', this.path).attr('fill', this.fill);
  this.transform = {
    x: this.environment.width * 0.5,
    y: this.environment.height * 0.5
  };
  this.setupDragging();
};

Player.prototype.getX = function() {
  return this.x; 
};

Player.prototype.setX = function(x) {
  this.minX = this.environment.padding;
  this.maxX = this.environment.width - this.environment.padding;
  if (x <= this.minX) {
    x = minX;
  } else if (x >= this.maxX) {
    x = maxX;
  }
  this.x = x;
};

Player.prototype.getY = function() {
  return this.y; 
};

Player.prototype.setY = function(y) {
  this.minY = this.environment.padding;
  this.maxY = this.environment.height - this.environment.padding;
  if (y <= this.minY) {
    y = minY;
  } else if (y >= this.maxY) {
    y = maxY;
  }
  this.y = y;
};

Player.prototype.transform = function(opts) {
  this.setX(opts.x || this.x);
  this.setY(opts.y || this.y);
  this.el.attr('transform','translate'+this.getX+","+this.getY);
};

Player.prototype.moveAbsolute = function(x,y) {
  this.transform({x:x, y:y});
};

Player.prototype.moveRelative = function(dx,dy) {
  this.transform({x:this.getX()+dx, y:this.getY()+dy});
};

Player.prototype.setupDragging = function() {
  var dragMove = function() {
    this.moveRelative(d3.event.dx, d3.event.dy);
  };

  var drag = d3.behavior.drag().on('drag', dragMove);

  this.el.call(drag);
};
