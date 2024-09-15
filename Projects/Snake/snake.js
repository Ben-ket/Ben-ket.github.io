const canvas = document.querySelector('.main_canvas');
const ctx = canvas.getContext('2d');
let n = 10000;
let time = 10;
let y = 10;
let x = 10;



function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function drawRect() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = 'red';
  ctx.fillRect(x, y, 50, 50);
  ctx.strokeStyle = 'black';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, 50, 50);
}
function control(event){
  switch (event.keyCode) {
    case 37: // Left arrow key
        x -= 10;
        break;
    case 38: // Up arrow key
        y -= 10;
        break;
    case 39: // Right arrow key
        x += 10;
        break;
    case 40: // Down arrow key
        y += 10;
        break;
  }
  drawRect();
  event.preventDefault();
}



async function main(){
  


  
  

  document.addEventListener('keydown', control)
  drawRect();
}

main();
