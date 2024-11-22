const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const startButton = document.getElementById('startButton');

const gridSize = 20;
const tileCount = canvas.width / gridSize;
let snake = [{ x: 10, y: 10 }];
let direction = { x: 0, y: 0 };
let food = { x: 15, y: 15 };
let gameInterval;

function drawGame() {
    updateSnake();
    if (checkSelfCollision()) {
        clearInterval(gameInterval);
        alert('Game Over!');
        return;
    }
    clearCanvas();
    drawFood();
    drawSnake();
}

function updateSnake() {
    let head = { x: snake[0].x + direction.x, y: snake[0].y + direction.y };

    // Wrap the snake's position to the opposite side if it goes out of bounds
    if (head.x < 0) {
        head.x = tileCount - 1;
    } else if (head.x >= tileCount) {
        head.x = 0;
    }
    if (head.y < 0) {
        head.y = tileCount - 1;
    } else if (head.y >= tileCount) {
        head.y = 0;
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
        placeFood();
    } else {
        snake.pop();
    }
}

function checkSelfCollision() {
    const head = snake[0];
    for (let i = 1; i < snake.length; i++) {
        if (snake[i].x === head.x && snake[i].y === head.y) {
            return true;
        }
    }
    return false;
}

function clearCanvas() {
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

function drawSnake() {
    ctx.fillStyle = 'green';
    snake.forEach(part => {
        ctx.fillRect(part.x * gridSize, part.y * gridSize, gridSize, gridSize);
    });
}

function drawFood() {
    ctx.fillStyle = 'red';
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
}

function placeFood() {
    food = {
        x: Math.floor(Math.random() * tileCount),
        y: Math.floor(Math.random() * tileCount)
    };
}

function changeDirection(event) {
    switch (event.keyCode) {
        case 37:
            if (direction.x === 0) direction = { x: -1, y: 0 };
            break;
        case 38:
            if (direction.y === 0) direction = { x: 0, y: -1 };
            break;
        case 39:
            if (direction.x === 0) direction = { x: 1, y: 0 };
            break;
        case 40:
            if (direction.y === 0) direction = { x: 0, y: 1 };
            break;
    }
}

function startGame() {
    snake = [{ x: 10, y: 10 }];
    direction = { x: 0, y: 0 };
    placeFood();
    gameInterval = setInterval(drawGame, 100);
}

document.addEventListener('keydown', changeDirection);
startButton.addEventListener('click', startGame);