// start slingin' some d3 here.
var rangeFunction = function (start, stop, step) {
  if (arguments.length <= 1) {
    stop = start || 0;
    start = 0;
  }
  step = arguments[2] || 1;

  var len = Math.max(Math.ceil((stop - start) / step), 0);
  var idx = 0;
  var range = new Array(len);

  while(idx < len) {
    range[idx++] = start;
    start += step;
  }

  return range;
};

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

var axes = {
  x: d3.scale.linear().domain([0,100]).range([0,environment.width]),
  y: d3.scale.linear().domain([0,100]).range([0,environment.height])
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

Player.prototype.constructor = function(environment) {
  this.environment = environment;
};

Player.prototype.render = function(to) {
  this.el = to.append('svg:path').attr('d', this.path).attr('fill', this.fill);
  this.transform = {
    x: this.width * 0.5,
    y: this.height * 0.5
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

var players = [];
var player = new Player(environment);

players.push(player);
player.render(gameBoard);

var createEnemies = function() {
  return rangeFunction(0,environment.numEnemies).map(function(i){
    return {
      id: i,
      x: Math.random()*100,
      y: Math.random()*100
    };
  });
};

var render = function(enemyData) {
  var enemies = gameBoard.selectAll('circle.enemy')
    .data(enemyData, function(d) {
      return d.id;
    });

  enemies.enter()
    .append('svg:circle')
      .attr('class', 'enemy')
      .attr('cx', function(enemy) { return axes.x(enemy.x); })
      .attr('cy', function(enemy) { return axes.y(enemy.y); })
      .attr('r',0);

  enemies.exit().remove();


  var each = function(obj, iterator, context) {
    if (obj === null) return;
    if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        iterator.call(context, obj[i], i, obj);
      }
    } else {
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          iterator.call(context, obj[key], key, obj);
        }
      }
    }
  };

  var checkCollision = function(enemy, collidedCallback) {
    each(players, function(player) {
      var radiusSum = parseFloat(enemy.attr('r')) + player.r;
      var xDiff = parseFloat(enemy.attr('cx')) - player.x;
      var yDiff = parseFloat(enemy.attr('cy')) - player.y;

      var separation = Math.sqrt(Math.pow(xDiff, 2) + Math.pow(yDiff, 2));
      if(separation < radiusSum) {
        collidedCallback(player, enemy);
      }
    });
  };

  var onCollision = function() {
    updateHighScore();
    score.currentScore = 0;
    updateCurrentScore();
  };

  var tweenWithCollisionDetection = function(endData) {

    var enemy = d3.select(this);
    var startPos = {
      x: parseFloat(enemy.attr('cx')),
      y: parseFloat(enemy.attr('cy'))
    };
    var endPos = {
      x: axes.x(endData.x),
      y: axes.y(endData.y)
    };

    return function(t) {
      checkCollision(enemy, onCollision);

      var enemyNextPos = {
        x: startPos.x + (endPos.x - startPos.x) * t,
        y: startPos.y + (endPos.y - startPos.y) * t
      };

      enemy.attr('cx', enemyNextPos.x).attr('cy', enemyNextPos.y);
    };
  };

  enemies.transition().duration(500).attr('r', 10).transition()
    .duration(2000).tween('custom', tweenWithCollisionDetection);
};

var play = function() {
  var gameTurn = function() {
    var newEnemyPositions = createEnemies();
    render(newEnemyPositions);
  };

  var increaseScore = function() {
    score.currentScore++;
    updateCurrentScore();
  };

  gameTurn();
  setInterval(gameTurn, 2000);

  setInterval(increaseScore, 50);

};

play();













