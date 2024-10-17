const gridSize = 5;
let playerPosition = { x: 0, y: 0 };
let wumpusPosition = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
let goldPosition = { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
let pitPositions = [];
while (pitPositions.length < 2) {
    const pit = { 
        x: Math.floor(Math.random() * gridSize), 
        y: Math.floor(Math.random() * gridSize) 
    };
    if (!isSamePosition(pit, playerPosition) && 
        !isSamePosition(pit, wumpusPosition) && 
        !isSamePosition(pit, goldPosition) && 
        !pitPositions.some(pos => isSamePosition(pos, pit))) {
        pitPositions.push(pit);
    }
}

let messageElement = document.getElementById('message');
let gridElement = document.getElementById('grid');

function isSamePosition(pos1, pos2) {
    return pos1.x === pos2.x && pos1.y === pos2.y;
}

function initGrid() {
    gridElement.innerHTML = '';
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            if (isSamePosition({ x, y }, playerPosition)) {
                const img = document.createElement('img');
                img.src = 'image.player.png';
                cell.appendChild(img);
            } else if (isSamePosition({ x, y }, wumpusPosition)) {
                const img = document.createElement('img');
                img.src = 'images.wumpus.png';
                cell.appendChild(img);
            } else if (isSamePosition({ x, y }, goldPosition)) {
                const img = document.createElement('img');
                img.src = 'images.bone.jpeg';
                cell.appendChild(img);
            } else if (pitPositions.some(pos => isSamePosition(pos, { x, y }))) {
                const img = document.createElement('img');
                img.src = 'image.placePits.jpeg';
                cell.appendChild(img);
            }
            gridElement.appendChild(cell);
        }
    }
}

function move(direction) {
    switch (direction) {
        case 'left':
            if (playerPosition.x > 0) playerPosition.x--;
            break;
        case 'right':
            if (playerPosition.x < gridSize - 1) playerPosition.x++;
            break;
        case 'up':
            if (playerPosition.y > 0) playerPosition.y--;
            break;
        case 'down':
            if (playerPosition.y < gridSize - 1) playerPosition.y++;
            break;
    }

    checkGameStatus();
    initGrid();
}

function shoot() {
    if (playerPosition.x === wumpusPosition.x && playerPosition.y === wumpusPosition.y) {
        messageElement.innerText = 'You shot the Wumpus! You win!';
    } else {
        messageElement.innerText = 'You missed the Wumpus!';
    }
}

function checkGameStatus() {
    if (playerPosition.x === wumpusPosition.x && playerPosition.y === wumpusPosition.y) {
        messageElement.innerText = 'You have been eaten by the Wumpus!';
        disableGame();
    } else if (pitPositions.some(pos => isSamePosition(pos, playerPosition))) {
        messageElement.innerText = 'You fell into a pit!';
        disableGame();
    } else if (isSamePosition(playerPosition, goldPosition)) {
        messageElement.innerText = 'You found the gold! You win!';
        disableGame();
    }
}

function disableGame() {
    const buttons = document.querySelectorAll('button');
    buttons.forEach(button => button.disabled = true);
}

initGrid();