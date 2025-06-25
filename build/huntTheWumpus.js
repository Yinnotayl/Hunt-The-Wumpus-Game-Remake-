// Configurable grid size
let gridWidth = 5;
let gridHeight = 5;
const minGridX = 3;
const minGridY = 3;
const maxGridX = 100;
const maxGridY = 100;

const maxArrows = 6;
let arrows = 5;
const grid = document.getElementById('grid');
let cells = [];
let posX, posY;

let gameFinished = false;

// Shoot direction
let shootDirection = 0; // 0: none, 1: left, 2: right, 3: up, 4: down

// Entity positions
let wumpusX, wumpusY;
let holeX, holeY;
let batX, batY;
let arrowX, arrowY;
let statusMessages = [];

// User configuration
let toggleEntities = document.getElementById("toggleEntities").checked;
let gridX = parseInt(document.getElementById("gridX").value) || minGridX;
let gridY = parseInt(document.getElementById("gridY").value) || minGridY;
if (gridX < minGridX) gridX = minGridX;
if (gridY < minGridY) gridY = minGridY;

// Utils
function simulateKey(key) { // Mobile users
    const event = new KeyboardEvent("keydown", {
        key: key,
        bubbles: true
    });
    document.dispatchEvent(event);
}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function deleteItem(item, list) {
    const index = list.indexOf(item);
    if (index !== -1) list.splice(index, 1);
}

function isInList(item, list) {
    return list.includes(item);
}

function isNearIncludingDiagonals(x1, y1, x2, y2) {
    const dx = Math.abs(x1 - x2);
    const dy = Math.abs(y1 - y2);
    return (dx <= 1 && dy <= 1) && !(dx === 0 && dy === 0);
}

function updateStatusMessage(condition, message, list = statusMessages) {
    const exists = list.includes(message);
    if (condition && !exists) list.push(message);
    else if (!condition && exists) deleteItem(message, list);
}

function player_loose(message) {
    gameFinished = true;
    renderEntities();
    statusMessages.push(message);
    setTimeout(() => {
        alert(message);
        init();
        deleteItem(message, statusMessages);
        gameFinished = false;
        gameLoop();
    }, 50);
}

function player_win() {
    gameFinished = true;
    renderEntities();
    const message = "You win! You shot the wumpus!";
    statusMessages.push(message);
    setTimeout(() => {
        alert(message);
        init();
        deleteItem(message, statusMessages);
        gameFinished = false;
        gameLoop();
    }, 50);
}

function dratsMissed() {
    if (!isInList("Drats! You missed!", statusMessages)) {
        statusMessages.push("Drats! You missed!");
        setTimeout(() => deleteItem("Drats! You missed!", statusMessages), 2000);
    }

    if (arrows != maxArrows) {
        do {
            arrowX = randInt(0, gridWidth - 1);
            arrowY = randInt(0, gridHeight - 1);
        } while (
            (arrowX === posX && arrowY === posY) ||
            (arrowX === wumpusX && arrowY === wumpusY) ||
            (arrowX === holeX && arrowY === holeY) ||
            (arrowX === batX && arrowY === batY)
        );
    }

    do {
        wumpusX = randInt(0, gridWidth - 1);
        wumpusY = randInt(0, gridHeight - 1);
    } while (
        (wumpusX === posX && wumpusY === posY) ||
        (wumpusX === arrowX && wumpusY === arrowY) ||
        (wumpusX === holeX && wumpusY === holeY) ||
        (wumpusX === batX && wumpusY === batY)
    );
}

function shoot() {
    if (arrows <= 0) {
        if (!isInList("You're out of arrows!", statusMessages)) {
            statusMessages.push("You're out of arrows!");
            setTimeout(() => deleteItem("You're out of arrows!", statusMessages), 2000);
        }
        shootDirection = 0;
        return;
    }

    arrows--;
    let hit = false;
    switch (shootDirection) {
        case 1: if (wumpusY === posY && wumpusX === posX - 1) hit = true; break;
        case 2: if (wumpusY === posY && wumpusX === posX + 1) hit = true; break;
        case 3: if (wumpusX === posX && wumpusY === posY - 1) hit = true; break;
        case 4: if (wumpusX === posX && wumpusY === posY + 1) hit = true; break;
    }

    if (hit) player_win();
    else dratsMissed();

    shootDirection = 0;
}

function changeGridSize() {
    const newGridX = parseInt(document.getElementById("gridX").value, 10) || minGridX;
    const newGridY = parseInt(document.getElementById("gridY").value, 10) || minGridY;

    if (newGridX < minGridX || newGridX > maxGridX || newGridY < minGridY || newGridY > maxGridY) {
        alert(`Grid size must be between ${minGridX}x${minGridY} and ${maxGridX}x${maxGridY}`);
        return;
    }

    let proceed = confirm("This will also reset your game. Proceed?");
    if (proceed) {
        gridWidth = newGridX;
        gridHeight = newGridY;
        init();
    }
}

function updatePosition() {
    cells.forEach(cell => cell.classList.remove('red'));
    const index = posY * gridWidth + posX;
    cells[index].classList.add('red');
}

function renderEntities() {
    cells.forEach(cell => cell.classList.remove('wumpus', 'hole', 'bat', 'arrow'));

    function validPos(x, y) {
        return x >= 0 && x < gridWidth && y >= 0 && y < gridHeight;
    }

    if (validPos(wumpusX, wumpusY)) cells[wumpusY * gridWidth + wumpusX].classList.add('wumpus');
    if (validPos(holeX, holeY)) cells[holeY * gridWidth + holeX].classList.add('hole');
    if (validPos(batX, batY)) cells[batY * gridWidth + batX].classList.add('bat');
    if (validPos(arrowX, arrowY)) cells[arrowY * gridWidth + arrowX].classList.add('arrow');
}

function clearEntities() {
    cells.forEach(cell => {
        cell.classList.remove('wumpus', 'hole', 'bat', 'arrow');
    });
}

function init() {
    posX = randInt(0, gridWidth - 1);
    posY = randInt(0, gridHeight - 1);
    shootDirection = 0;

    do { wumpusX = randInt(0, gridWidth - 1); wumpusY = randInt(0, gridHeight - 1); }
    while (wumpusX === posX && wumpusY === posY);

    do { holeX = randInt(0, gridWidth - 1); holeY = randInt(0, gridHeight - 1); }
    while ((holeX === posX && holeY === posY) || (holeX === wumpusX && holeY === wumpusY));

    do { batX = randInt(0, gridWidth - 1); batY = randInt(0, gridHeight - 1); }
    while ((batX === posX && batY === posY) || (batX === wumpusX && batY === wumpusY) || (batX === holeX && batY === holeY));

    if (arrows !== maxArrows) {
        do {
            arrowX = randInt(0, gridWidth - 1);
            arrowY = randInt(0, gridHeight - 1);
        } while (
            (arrowX === posX && arrowY === posY) ||
            (arrowX === wumpusX && arrowY === wumpusY) ||
            (arrowX === holeX && arrowY === holeY) ||
            (arrowX === batX && arrowY === batY)
        );
    }

    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${gridWidth}, 1fr)`;
    cells = [];
    for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.dataset.x = x;
            cell.dataset.y = y;
            cells.push(cell);
            grid.appendChild(cell);
        }
    }

    updatePosition();
}

document.addEventListener('keydown', (event) => {
    switch (event.key) {
        case 'w': case 'W': if (posY > 0) posY--; break;
        case 's': case 'S': if (posY < gridHeight - 1) posY++; break;
        case 'a': case 'A': if (posX > 0) posX--; break;
        case 'd': case 'D': if (posX < gridWidth - 1) posX++; break;

        case 'ArrowUp': shootDirection = 3; shoot(); break;
        case 'ArrowDown': shootDirection = 4; shoot(); break;
        case 'ArrowLeft': shootDirection = 1; shoot(); break;
        case 'ArrowRight': shootDirection = 2; shoot(); break;
    }

    updatePosition();
});

// Drop handling for bats
let droppedX = null;
let droppedY = null;

function update() {
    updateStatusMessage(isNearIncludingDiagonals(posX, posY, wumpusX, wumpusY), "You smell a wumpus");
    updateStatusMessage(isNearIncludingDiagonals(posX, posY, batX, batY), "You hear flapping");
    updateStatusMessage(isNearIncludingDiagonals(posX, posY, holeX, holeY), "You feel a breeze");

    if (arrowX === posX && arrowY === posY) {
        arrows = maxArrows;
        if (!isInList("You found an arrow!", statusMessages)) statusMessages.push("You found an arrow!");
    } else {
        if (isInList("You found an arrow!", statusMessages)) {
            deleteItem("You found an arrow!", statusMessages);
            arrowX = -1;
            arrowY = -1;
        }
    }

    if (posX === wumpusX && posY === wumpusY) return player_loose("You lose! You met the wumpus!");
    if (posX === holeX && posY === holeY) return player_loose("You lose! You fell into the bottomless pit!");

    if (posX === batX && posY === batY) {
        posX = randInt(0, gridWidth - 1);
        posY = randInt(0, gridHeight - 1);
        droppedX = posX;
        droppedY = posY;

        do {
            batX = randInt(0, gridWidth - 1);
            batY = randInt(0, gridHeight - 1);
        } while (
            (batX === posX && batY === posY) ||
            (batX === wumpusX && batY === wumpusY) ||
            (batX === holeX && batY === holeY) ||
            (batX === arrowX && batY === arrowY)
        );

        if (!isInList("Bats carried you away!", statusMessages)) {
            statusMessages.push("Bats carried you away!");
        }
    }

    if (droppedX !== null && droppedY !== null && (posX !== droppedX || posY !== droppedY)) {
        deleteItem("Bats carried you away!", statusMessages);
        droppedX = null;
        droppedY = null;
    }

    const statusList = document.getElementById("statusListPosition");
    statusList.innerHTML = '';
    const positionText = document.createElement("li");
    positionText.textContent = `You are at ${posX},${posY}`;
    statusList.appendChild(positionText);

    const arrowsText = document.createElement("li");
    arrowsText.textContent = `Arrows: ${arrows}/${maxArrows}`;
    statusList.appendChild(arrowsText);

    for (let message of statusMessages) {
        const li = document.createElement('li');
        li.textContent = message;
        statusList.appendChild(li);
    }



    // User configuration
    toggleEntities = document.getElementById("toggleEntities").checked;
    gridX = parseInt(document.getElementById("gridX").value) || minGridX;
    gridY = parseInt(document.getElementById("gridY").value) || minGridY;
    if (gridX < minGridX) gridX = minGridX;
    if (gridY < minGridY) gridY = minGridY;
    if (gridX > maxGridX) gridX = maxGridX;
    if (gridY > maxGridY) gridY = maxGridY;
}

function render() {
    updatePosition();
    if (toggleEntities) {
        renderEntities();
    } else {
        clearEntities();
    }
}

function gameLoop() {
    update();
    render();
    if (!gameFinished) requestAnimationFrame(gameLoop);
}

// Start game
init();
gameLoop();
