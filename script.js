const gridSize = 8;
let playerPosition = { x: 0, y: 0 };
let visitedPositions = [];
let wumpusPositions, goldPositions, pitPositions;
let percepts = {};
let arrows = 1;

function isSamePosition(pos1, pos2) {
    return pos1.x === pos2.x && pos1.y === pos2.y;
}

function getRandomPosition() {
    return { x: Math.floor(Math.random() * gridSize), y: Math.floor(Math.random() * gridSize) };
}

function getMultipleRandomPositions(count, avoidPositions = []) {
    const positions = [];
    while (positions.length < count) {
        const position = getRandomPosition();
        if (!avoidPositions.some(pos => isSamePosition(pos, position)) &&
            !positions.some(pos => isSamePosition(pos, position))) {
            positions.push(position);
        }
    }
    return positions;
}

function initializeGame() {
    wumpusPositions = getMultipleRandomPositions(1);
    goldPositions = getMultipleRandomPositions(1);
    pitPositions = getMultipleRandomPositions(5, [...wumpusPositions, ...goldPositions]);
    updatePercepts();
}

function updatePercepts() {
    percepts = {};
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const pos = { x, y };
            percepts[`${x},${y}`] = {
                breeze: isAdjacentTo(pos, pitPositions),
                stench: isAdjacentTo(pos, wumpusPositions),
                glitter: goldPositions.some(gold => isSamePosition(gold, pos))
            };
        }
    }
}

function isAdjacentTo(pos, dangerPositions) {
    return dangerPositions.some(danger =>
        (Math.abs(pos.x - danger.x) + Math.abs(pos.y - danger.y)) === 1
    );
}

function getPerceptsAt(pos) {
    return percepts[`${pos.x},${pos.y}`] || { breeze: false, stench: false, glitter: false };
}

function senseCurrentPosition(position) {
    const percept = getPerceptsAt(position);
    let messages = [];
    if (percept.glitter) messages.push('You sense glitter nearby!');
    if (percept.breeze) messages.push('You feel a breeze...');
    if (percept.stench) messages.push('You smell a stench...');
    return { gameOver: false, message: messages.join(' ') };
}

function checkGameOver(position) {
    if (wumpusPositions.some(pos => isSamePosition(pos, position))) {
        return { gameOver: true, message: 'You have been eaten by the Wumpus!' };
    } else if (pitPositions.some(pos => isSamePosition(pos, position))) {
        return { gameOver: true, message: 'You fell into a pit!' };
    } else if (goldPositions.some(pos => isSamePosition(pos, position))) {
        const goldIndex = goldPositions.findIndex(pos => isSamePosition(pos, position));
        goldPositions.splice(goldIndex, 1);
        updatePercepts();
        return { gameOver: false, message: 'You found gold! Keep going!' };
    }
    return senseCurrentPosition(position);
}

function evaluate(position) {
    const currentPercepts = getPerceptsAt(position);
    let score = 0;

    if (currentPercepts.glitter) score += 2000;
    if (currentPercepts.breeze) score -= 800;
    if (currentPercepts.stench) score -= 600;

    const visitCount = visitedPositions.filter(pos => isSamePosition(pos, position)).length;
    if (visitCount === 0) {
        score += 1000;
    } else {
        score -= visitCount * 100;
    }

    const lastMove = visitedPositions.length > 1 ? {
        x: position.x - visitedPositions[visitedPositions.length - 1].x,
        y: position.y - visitedPositions[visitedPositions.length - 1].y
    } : null;

    const secondLastMove = visitedPositions.length > 2 ? {
        x: visitedPositions[visitedPositions.length - 1].x - visitedPositions[visitedPositions.length - 2].x,
        y: visitedPositions[visitedPositions.length - 1].y - visitedPositions[visitedPositions.length - 2].y
    } : null;

    if (lastMove && secondLastMove &&
        (lastMove.x !== secondLastMove.x || lastMove.y !== secondLastMove.y)) {
        score += 200;
    }

    const distanceToEdge = Math.min(position.x, position.y, gridSize - 1 - position.x, gridSize - 1 - position.y);
    score += distanceToEdge * 50;

    return score;
}

function getAllMoves(position) {
    const moves = [];
    if (position.x > 0) moves.push({ x: position.x - 1, y: position.y });
    if (position.x < gridSize - 1) moves.push({ x: position.x + 1, y: position.y });
    if (position.y > 0) moves.push({ x: position.x, y: position.y - 1 });
    if (position.y < gridSize - 1) moves.push({ x: position.x, y: position.y + 1 });
    return moves;
}

function alphaBetaPruning(position, depth, alpha, beta, isMaximizingPlayer) {
    if (depth === 0 || checkGameOver(position).gameOver) {
        return evaluate(position);
    }

    const moves = getAllMoves(position);

    if (isMaximizingPlayer) {
        let maxEval = -Infinity;
        for (let move of moves) {
            let eval = alphaBetaPruning(move, depth - 1, alpha, beta, false);
            maxEval = Math.max(maxEval, eval);
            alpha = Math.max(alpha, eval);
            if (beta <= alpha) break;
        }
        return maxEval;
    } else {
        let minEval = Infinity;
        for (let move of moves) {
            let eval = alphaBetaPruning(move, depth - 1, alpha, beta, true);
            minEval = Math.min(minEval, eval);
            beta = Math.min(beta, eval);
            if (beta <= alpha) break;
        }
        return minEval;
    }
}

function aiMakeMove() {
    let bestMove = null;
    let bestValue = -Infinity;
    const depth = 4;

    const allMoves = getAllMoves(playerPosition);

    for (let move of allMoves) {
        let moveValue = alphaBetaPruning(move, depth, -Infinity, Infinity, false);

        if (!visitedPositions.some(pos => isSamePosition(pos, move))) {
            moveValue += 500;
        }

        const percepts = getPerceptsAt(move);
        if (percepts.glitter) moveValue += 1000;
        if (percepts.breeze) moveValue -= 300;
        if (percepts.stench) moveValue -= 200;

        if (moveValue > bestValue) {
            bestValue = moveValue;
            bestMove = move;
        }
    }

    if (bestMove) {
        visitedPositions.push(playerPosition);
        playerPosition = bestMove;

        const gameState = checkGameOver(playerPosition);
        if (gameState.message) {
            messageElement.innerText = gameState.message;
        } else {
            messageElement.innerText = 'AI is exploring...';
        }

        if (gameState.gameOver) {
            disableGame();
        }
        initGrid();
    }
}

function shootArrow(direction) {
    let arrowPosition = {...playerPosition };
    let killedWumpus = false;

    while (arrowPosition.x >= 0 && arrowPosition.x < gridSize && arrowPosition.y >= 0 && arrowPosition.y < gridSize) {
        arrowPosition.x += direction.x;
        arrowPosition.y += direction.y;

        if (wumpusPositions.some(wumpus => isSamePosition(wumpus, arrowPosition))) {
            wumpusPositions = wumpusPositions.filter(wumpus => !isSamePosition(wumpus, arrowPosition));
            updatePercepts();
            killedWumpus = true;
            break;
        }
    }

    return killedWumpus ? "You killed the Wumpus!" : "Your arrow missed!";
}

function startGameAI() {
    messageElement.innerText = 'Game started! AI is exploring...';
    const gameInterval = setInterval(() => {
        const gameState = checkGameOver(playerPosition);
        if (gameState.gameOver) {
            clearInterval(gameInterval);
            messageElement.innerText = gameState.message + ' Game Over!';
            return;
        }
        aiMakeMove();
    }, 1000);
}

function disableGame() {
    messageElement.innerText += ' Game Over!';
}

let messageElement = document.getElementById('message');
let gridElement = document.getElementById('grid');

function initGrid() {
    gridElement.innerHTML = '';
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            const currentPos = { x, y };
            const percept = getPerceptsAt(currentPos);

            if (isSamePosition(currentPos, playerPosition)) {
                const img = document.createElement('img');
                img.src = 'image.player.png';
                cell.appendChild(img);
                cell.classList.add('player');
            } else if (wumpusPositions.some(pos => isSamePosition(pos, currentPos))) {
                const img = document.createElement('img');
                img.src = 'images.wumpus.jpg';
                cell.appendChild(img);
            } else if (goldPositions.some(pos => isSamePosition(pos, currentPos))) {
                const img = document.createElement('img');
                img.src = 'images.bone.jpeg';
                cell.appendChild(img);
            } else if (pitPositions.some(pos => isSamePosition(pos, currentPos))) {
                const img = document.createElement('img');
                img.src = 'image.pits.png';
                cell.appendChild(img);
            }

            if (percept.breeze) cell.classList.add('breeze');
            if (percept.stench) cell.classList.add('stench');
            if (percept.glitter) cell.classList.add('glitter');

            gridElement.appendChild(cell);
        }
    }
}

window.onload = function() {
    initializeGame();
    initGrid();
    startGameAI();
};