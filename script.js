
const canvas = document.getElementById('heroCanvas');
const ctx = canvas.getContext('2d');

const ColourPallete = ["#0f1526", "#03346E", "#6EACDA", "#E2E2B6"]; 
var circles = [];


const gradient = ctx.createLinearGradient(0,canvas.height, canvas.width, 0)
gradient.addColorStop(0, 'rgba(255, 75, 43, 0.1)');
gradient.addColorStop(1, 'rgba(155, 15, 43, 0.1)');

function initCircles() {
  circles.length = 0; 
  const numberOfCircles = 150; 
  for (let i = 0; i < numberOfCircles; i++) {
    const radius = getRandomInt(4, 10); 
    const x = canvas.width / 2;
    const y = canvas.height / 2;
    const colour = ColourPallete[Math.floor(Math.random() * ColourPallete.length)];
    const speed = getRandomInt(1, 5); 
    circles.push(new Circle(x, y, radius, colour, speed));
  }
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = document.querySelector('.hero').offsetHeight;
  initCircles(); 
}

function Circle(x, y, radius, colour, speed) {
  this.x = x;
  this.y = y;
  this.radius = radius;
  this.colour = colour;
  this.speed = speed;

  this.radians = getRandomInt(0, 360) * Math.PI / 180; 
  this.distanceFromCenter = getRandomInt(100, 400); 

  this.update = function () {
    const lastPoint = { x: this.x, y: this.y };

    // Update position based on rotation
    this.radians += this.speed / 100;
    this.x = canvas.width / 2 + Math.cos(this.radians) * this.distanceFromCenter;
    this.y = canvas.height / 2 + Math.sin(this.radians) * this.distanceFromCenter;

    this.draw(lastPoint);
  };

  this.draw = function (lastPoint) {
    ctx.beginPath();
    ctx.strokeStyle = this.colour;
    ctx.lineWidth = this.radius;
    ctx.moveTo(lastPoint.x, lastPoint.y);
    ctx.lineTo(this.x, this.y);
    ctx.stroke();
    ctx.closePath();
  };
}

function animate() {
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  circles.forEach(circle => circle.update());
  requestAnimationFrame(animate);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
animate();


function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
