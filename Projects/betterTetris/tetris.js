var lengthUnit = 25;
var canvas = document.getElementById("playArea");
var heldCanvas = document.getElementById("heldPiece");
var nextCanvas = document.getElementById("nextPiece");

var container = document.getElementById("canvases");

const speedRange = document.getElementById('speedRange');
const speedValue = document.getElementById('speedValue');


const Arrows = document.querySelectorAll('.arrow');;

console.log()
let gameOver = false;
const c_next = nextCanvas.getContext("2d");

const c = canvas.getContext("2d");

const ctxHeld = heldCanvas.getContext("2d");


let highScoreSav = +localStorage.getItem('highscore2');


heldCanvas.width = 4 * lengthUnit;
heldCanvas.height = 4 * lengthUnit;
nextCanvas.width = 4 * lengthUnit;
nextCanvas.height = 4 * lengthUnit;



container.style.width = (19 * lengthUnit + 30) + "px";

canvas.width = 10 * lengthUnit;
canvas.height = 20 * lengthUnit;

var grid = Array.from({ length: canvas.height / lengthUnit }, () => Array(canvas.width / lengthUnit).fill(null));

var CurrentTetriminos = [];
var speed;
var fps = 120;


let currentScore = 0;
let highScore = 0;

var paused = false;


if(isPhone()){
  Arrows.forEach(function(button) {
    button.style.display = 'block'
    });
}




var Song = document.getElementById("Tetris-music");



speedRange.addEventListener('input', () => {
    speedValue.textContent = speedRange.value;
    
});


speed = (500 / speedRange.value); 

const Tetriminos = {
  "L": { shape: [[1, 0], [1, 0], [1, 1]], color: "rgb(255, 0, 0)" },
  "J": { shape: [[0, 1], [0, 1], [1, 1]], color: "rgb(255, 165, 0)" },
  "T": { shape: [[0, 1, 0], [1, 1, 1]],   color: "rgb(0, 255, 0)" },
  "I": { shape: [[1], [1], [1], [1]],     color: "rgb(0, 0, 255)" },
  "Z": { shape: [[1, 1, 0], [0, 1, 1]],   color: "rgb(165, 0, 165)" },
  "S": { shape: [[0, 1, 1], [1, 1, 0]],   color: "#26F7FD" },
  "O": { shape: [[1, 1], [1, 1]],         color: "rgb(255, 255, 0)" }
};


var nextTetrimino = new Tetrimino(4 * lengthUnit, 0, Tetriminos[Object.keys(Tetriminos)[getRandomInt(0, 6)]])
var heldTetrimino = null;
var canHold = 1;


CurrentTetriminos.push(new Tetrimino(4 * lengthUnit, 0, Tetriminos[Object.keys(Tetriminos)[getRandomInt(0, 6)]]));

var gameInterval, animationInterval

drawGrid();

document.getElementById('high-score').textContent = highScoreSav;

Arrows.forEach(function(button) {
  button.addEventListener('click', handleButtonDown);
});










function otherLoop(){
  if (!gameOver) {
    c.clearRect(0, 0, canvas.width, canvas.height);
    drawTetriminos(); 
    drawGrid();
    drawGridWithLandedPieces();
    drawHeldTetrimino();
    checkLines();
    speed = (500 / speedRange.value);
  }
}


document.getElementById("restartButton").addEventListener("click", function () {
  restartGame();
});
document.getElementById("pauseButton").addEventListener("click", function () {
  pauseGame();
});



function restartGame() {
  updateScore(0);
 
  gameOver = false;
  clearInterval(gameInterval);
  clearInterval(animationInterval);
  c_next.clearRect(0, 0, nextCanvas.width, nextCanvas.height)
  Song.currentTime = 0
  Song.play()
  speed = (500 / speedRange.value);

  // Event listeners for Rotation and Movement and Holding
  document.addEventListener("keydown", handleKeyDown);
  Arrows.forEach(function(button) {
    button.addEventListener('click', handleButtonDown);
  });

  // Clear the grid
  grid = Array.from({ length: canvas.height / lengthUnit }, () => Array(canvas.width / lengthUnit).fill(null));

  // Hide the "Game Over" message and restart button
  // document.getElementById("restartButton").style.display = "none";

  // Restart the game (you may need to reset variables like `CurrentTetriminos`)
  CurrentTetriminos = [];
  nextTetrimino = new Tetrimino(lengthUnit, 0, Tetriminos[Object.keys(Tetriminos)[getRandomInt(0, 6)]]) // New random piece
  heldTetrimino = null;
  nextTetrimino.draw(c_next)



  CurrentTetriminos.push(new Tetrimino(4 * lengthUnit, 0, Tetriminos[Object.keys(Tetriminos)[getRandomInt(0, 6)]]))
  
  gameInterval = setInterval(moveDown, speed);
  animationInterval = setInterval(otherLoop, 1000 / fps);
  
  
  highScoreSav = +localStorage.getItem('highscore2');
  document.getElementById('high-score').textContent = highScoreSav;

}


function Tetrimino(x, y, shape){
  this.x = x;
  this.y = y;
  this.shape = shape.shape;
  this.color = shape.color;

  this.draw = function (ctx) {
    let A_x = this.x;
    let A_y = this.y;
    for (let i = 0; i < this.shape.length; i++) {
      for (let j = 0; j < this.shape[i].length; j++) {
        if (this.shape[i][j] === 1) {
          Square(A_x, A_y, lengthUnit, this.color, ctx);
        }
        A_x += lengthUnit;
      }
      A_x = this.x;
      A_y += lengthUnit;
    }
  };

  // Function to rotate the Tetrimino
  this.rotate = function () {
    const newShape = this.shape[0].map((val, index) =>
      this.shape.map(row => row[index]).reverse()
    );

    if (!this.wouldCollide(this.x, this.y, newShape)) {
      this.shape = newShape;
    }
  };

  // Function to check collision (with optional new shape)
  this.wouldCollide = function (nextX, nextY, newShape = this.shape) {
    for (let i = 0; i < newShape.length; i++) {
      for (let j = 0; j < newShape[i].length; j++) {
        if (newShape[i][j] === 1) {
          const xGrid = (nextX + j * lengthUnit) / lengthUnit;
          const yGrid = (nextY + i * lengthUnit) / lengthUnit;
  
          // Check boundaries and if the grid cell is occupied by a landed piece
          if (
            yGrid >= canvas.height / lengthUnit || // Bottom boundary
            xGrid < 0 || // Left boundary
            xGrid >= canvas.width / lengthUnit || // Right boundary
            (grid[yGrid] && grid[yGrid][xGrid] !== null) // Check if grid cell is occupied (not null)
          ) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Update the grid when a Tetrimino "lands"
  this.land = function () {
    for (let i = 0; i < this.shape.length; i++) {
      for (let j = 0; j < this.shape[i].length; j++) {
        if (this.shape[i][j] != 0 ) {
          const xGrid = (this.x + j * lengthUnit) / lengthUnit;
          const yGrid = (this.y + i * lengthUnit) / lengthUnit;
          grid[yGrid][xGrid] = this.color; // Store color in the grid
        }
      }
    }
    checkLines();
    checkGameOver();
    canHold = 1;
  }
}

function Square(x, y, length, color, ctx) {
  ctx.beginPath();
  ctx.rect(x, y, length, length);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = "black";
  ctx.lineWidth = 2;
  ctx.stroke();
}


function pauseGame() {
  if(!gameOver){
    if(!paused){
      clearInterval(gameInterval);
      clearInterval(animationInterval);
      document.removeEventListener("keydown", handleKeyDown);
      Arrows.forEach(function(button) {
        button.removeEventListener('click', handleButtonDown);
      });
      Song.pause()
      paused = true;
    }
    else{
      gameInterval = setInterval(moveDown, speed);
      animationInterval = setInterval(otherLoop, 1000 / fps);
      document.addEventListener("keydown", handleKeyDown);
      Arrows.forEach(function(button) {
        button.addEventListener('click', handleButtonDown);
      });
      Song.play()
      paused = false;

    }
  }
}

function drawGrid() {
  for (let i = 0; i < canvas.width / lengthUnit; i++) {
    c.beginPath();
    c.moveTo(i * lengthUnit, 0);
    c.lineTo(i * lengthUnit, canvas.height);
    c.strokeStyle = "rgba(0, 0, 0, 0.3)";
    c.stroke();
  }

  for (let j = 0; j < canvas.height / lengthUnit; j++) {
    c.beginPath();
    c.moveTo(0, j * lengthUnit);
    c.lineTo(canvas.width, j * lengthUnit);
    c.strokeStyle = "rgba(0, 0, 0, 0.3)";
    c.stroke();
  }
}

function moveDown() {
  for (let i = 0; i < CurrentTetriminos.length; i++) {
    let tetrimino = CurrentTetriminos[i];
    if (!tetrimino.wouldCollide(tetrimino.x, tetrimino.y + lengthUnit)) {
      tetrimino.y += lengthUnit;
    } else {
      tetrimino.land(); // Land the Tetrimino and stop it from moving
      CurrentTetriminos.splice(i, 1); // Remove the landed Tetrimino
      switchToNextTetrimino(); // Switch to the next piece
    }
  }
}

function moveRight() {
  for (let i = 0; i < CurrentTetriminos.length; i++) {
    let tetrimino = CurrentTetriminos[i];
    if (!tetrimino.wouldCollide(tetrimino.x + lengthUnit, tetrimino.y)) {
      tetrimino.x += lengthUnit;
    }
  }
}

function moveLeft() {
  for (let i = 0; i < CurrentTetriminos.length; i++) {
    let tetrimino = CurrentTetriminos[i];
    if (!tetrimino.wouldCollide(tetrimino.x - lengthUnit, tetrimino.y)) {
      tetrimino.x -= lengthUnit;
    }
  }
}



function handleKeyDown(event) {
  if (event.key === "ArrowUp") {
    CurrentTetriminos.forEach(tetrimino => tetrimino.rotate());
  }
  if (event.key === "ArrowLeft") {
    CurrentTetriminos.forEach(tetrimino => moveLeft());
  }
  if (event.key === "ArrowRight") {
    CurrentTetriminos.forEach(tetrimino => moveRight());
  }
  if (event.key === "ArrowDown") {
    CurrentTetriminos.forEach(tetrimino => moveDown());
  }
  if (event.key === " ") {
    slam();
  }
  if (event.key === "Shift") {
    if (canHold) {
      holdTetrimino();
      canHold = 0;
    }
  }
}

function handleButtonDown(event) {
  const button = event.currentTarget;
  if (button.classList.contains('up')) {
    CurrentTetriminos.forEach(tetrimino => tetrimino.rotate());
  } else if (button.classList.contains('down')) {
    CurrentTetriminos.forEach(tetrimino => moveDown());
  }
  if (button.classList.contains('right')) {
    CurrentTetriminos.forEach(tetrimino => moveRight());
  } else if (button.classList.contains('left')) {
    CurrentTetriminos.forEach(tetrimino => moveLeft());
  }
  if (button.classList.contains('hold')) {
    if (canHold) {
      holdTetrimino();
      canHold = 0;
    }
  } else if (button.classList.contains('slam')) {
    slam();
  }
}



function checkLines() {
  let linesCleared = 0;  // To count how many lines are cleared at once
  
  for (let y = grid.length - 1; y >= 0; y--) {
    if (grid[y].every(cell => cell !== null)) {
      // Remove the filled row
      grid.splice(y, 1); 
      // Add a new empty row at the top
      grid.unshift(Array(canvas.width / lengthUnit).fill(null)); 
      
      linesCleared++;  // Increment the count for each cleared line
      
      y++;  // Stay at the same row index since the rows have shifted
    }
  }

  // Update the score based on the number of lines cleared
  if (linesCleared > 0) {
    let points;
    switch (linesCleared) {
      case 1:
        points = 10;
        break;
      case 2:
        points = 40;
        break;
      case 3:
        points = 90;
        break;
      case 4:
        points = 150;
        break;
    }
    
    updateScore(currentScore + points);
  }
}

function drawTetriminos() {
  for (let i = 0; i < CurrentTetriminos.length; i++) {
    CurrentTetriminos[i].draw(c);
  }
}

function getRandomInt(min, max) {
  min = Math.ceil(min);   // Round up to the nearest integer
  max = Math.floor(max);  // Round down to the nearest integer
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function switchToNextTetrimino() {
  if(!gameOver){
  nextTetrimino.x = 4 * lengthUnit
  CurrentTetriminos[0] = nextTetrimino; // Replace the old piece with the new one
  nextTetrimino = new Tetrimino(4 * lengthUnit, 0, Tetriminos[Object.keys(Tetriminos)[getRandomInt(0, 6)]]); // Generate new next piece
  c_next.clearRect(0, 0, nextCanvas.width, nextCanvas.height); // Clear the next piece canvas
  
  nextTetrimino.x = lengthUnit
  nextTetrimino.draw(c_next); // Draw new next piece
  } 
}

function drawGridBlocks() {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === 1) {
        Square(x * lengthUnit, y * lengthUnit, lengthUnit, "gray", c); // Draw grid blocks with a fixed color
      }
    }
  }
}

function checkGameOver() {
  // If any block in the top row is occupied, the game ends
  if (grid[0].some(cell => cell !== null)) {
    endGame(); // Trigger game over
  }
}

function endGame() {
  gameOver = true;
  document.removeEventListener("keydown", handleKeyDown);
  Arrows.forEach(function(button) {
    button.removeEventListener('click', handleButtonDown);
  });
  c.clearRect(0, 0, canvas.width, canvas.height);
  c_next.clearRect(0, 0, nextCanvas.width, nextCanvas.height);
  ctxHeld.clearRect(0, 0, heldCanvas.width, heldCanvas.height);
  c.font = "48px Arial";
  c.fillStyle = "red";
  c.textAlign = "center";
  c.fillText("Game Over", canvas.width / 2, canvas.height / 2);
  Song.pause();
  heldTetrimino = null;
  updateHighScore();
  clearInterval(gameInterval);
  clearInterval(animationInterval);
  
}


function drawGridWithLandedPieces() {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x]) { // If there's a color in the grid
        Square(x * lengthUnit, y * lengthUnit, lengthUnit, grid[y][x], c); // Draw the square with the color
      }
    }
  }
}

function holdTetrimino() {
  
  if (heldTetrimino === null) {
    // Save the current piece to heldTetrimino and generate a new piece
    heldTetrimino = CurrentTetriminos[0];
    switchToNextTetrimino()
    drawHeldTetrimino(); // Draw the held piece
  } else {
    // Swap the current piece with the held piece
    let temp = CurrentTetriminos[0];
    CurrentTetriminos[0] = heldTetrimino;
    heldTetrimino = temp;
    CurrentTetriminos[0].x = 4 * lengthUnit; // Reset position for new piece
    CurrentTetriminos[0].y = 0;
    drawHeldTetrimino(); // Update held piece display
    
  }

}

function drawHeldTetrimino() {
  
  ctxHeld.clearRect(0, 0, heldCanvas.width, heldCanvas.height); // Clear the held canvas
  if (heldTetrimino) {
    // Draw held piece in a fixed position on the held canvas
    heldTetrimino.x = 0;
    heldTetrimino.y = 0;
    heldTetrimino.draw(ctxHeld); // Draw the held piece
  }
}

function updateScore(newScore) {
  currentScore = newScore;
  document.getElementById('current-score').textContent = currentScore;
  
}
function updateHighScore(){
  if (currentScore > highScoreSav) {
    let score1 = currentScore.toString()
    localStorage.setItem('highscore2', score1)

    highScoreSav = +localStorage.getItem('highscore2');
    document.getElementById('high-score').textContent = highScoreSav;
  }
}

function slam() {
  let currentPiece = CurrentTetriminos[0]; // Get the active Tetrimino

  // Keep moving the piece down until it hits something
  while (!currentPiece.wouldCollide(currentPiece.x, currentPiece.y + lengthUnit)) {
    currentPiece.y += lengthUnit;
  }

  // Once the piece hits the bottom, land it
  currentPiece.land();

  // Switch to the next Tetrimino after landing
  switchToNextTetrimino();
}

function sethighscore(score){
  localStorage.setItem('highscore2', score)
}

function isPhone() {
  const userAgent = navigator.userAgent.toLowerCase();
  
  if (userAgent.includes('mobi')) {
      return true;
  } else {
      return false;
  }
}


