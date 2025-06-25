const gridSize = 5;
const maxArrows = 6;
let arrows = 5;
const grid = document.getElementById('grid');
let cells = [];
let posX, posY;

let gameFinished = false;

/*
0 -> Not shooting
1 -> Left
2 -> Right
3 -> Top
4 -> Down
*/
let shootDirection = 0;

let wumpusX, wumpusY;
let holeX, holeY;
let batX, batY;
let arrowX, arrowY;
let statusMessages = [];


// MARK: - Functions
// Function to get a random number
function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function deleteItem(item, list) {
    const index = list.indexOf(item);
    if (index !== -1) {
        list.splice(index, 1);
    }
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
    if (condition && !exists) {
        list.push(message);
    } else if (!condition && exists) {
        deleteItem(message, list);
    }
}

function player_loose(message) {
    gameFinished = true;
    renderEntities();
    statusMessages.push(message);

    // Let DOM render before showing alert
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
        // Remove the message after 2 seconds (2000 ms)
        setTimeout(() => {
            deleteItem("Drats! You missed!", statusMessages);
        }, 2000);
    }

    // Generate Arrow position only if arrows are not full, different from all above
    if (arrows != maxArrows) {
        do {
            arrowX = randInt(0, gridSize - 1);
            arrowY = randInt(0, gridSize - 1);
        } while (
            (arrowX === posX && arrowY === posY) ||
            (arrowX === wumpusX && arrowY === wumpusY) ||
            (arrowX === holeX && arrowY === holeY) ||
            (arrowX === batX && arrowY === batY)
        );
    }

    // Optionally move wumpus to new location
    do {
        wumpusX = randInt(0, gridSize - 1);
        wumpusY = randInt(0, gridSize - 1);
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
            // Remove the message after 2 seconds (2000 ms)
            setTimeout(() => {
                deleteItem("You're out of arrows!", statusMessages);
            }, 2000);
        }
        shootDirection = 0;
        return;
    }

    arrows--; // Use one arrow per shot
    let hit = false;

    switch (shootDirection) {
        case 1: // Left
            if (wumpusY === posY && wumpusX === posX - 1) {
                player_win();
                hit = true;
            }
            break;
        case 2: // Right
            if (wumpusY === posY && wumpusX === posX + 1) {
                player_win();
                hit = true;
            }
            break;
        case 3: // Up
            if (wumpusX === posX && wumpusY === posY - 1) {
                player_win();
                hit = true;
            }
            break;
        case 4: // Down
            if (wumpusX === posX && wumpusY === posY + 1) {
                player_win();
                hit = true;
            }
            break;
        default:
            console.log("No direction selected.");
            return;
    }

    if (!hit) {
        dratsMissed();
    }

    shootDirection = 0; // Reset shoot state after action
}




// Function to update the red square's position
function updatePosition() {
    cells.forEach(cell => cell.classList.remove('red'));
    const index = posY * gridSize + posX;
    cells[index].classList.add('red');
}

function renderEntities() {
    // First clear all entity classes from all cells
    cells.forEach(cell => {
        cell.classList.remove('wumpus', 'hole', 'bat', 'arrow');
    });

    // Helper to check valid coords
    function validPos(x, y) {
        return x >= 0 && x < gridSize && y >= 0 && y < gridSize;
    }

    if (validPos(wumpusX, wumpusY)) {
        cells[wumpusY * gridSize + wumpusX].classList.add('wumpus');
    }
    if (validPos(holeX, holeY)) {
        cells[holeY * gridSize + holeX].classList.add('hole');
    }
    if (validPos(batX, batY)) {
        cells[batY * gridSize + batX].classList.add('bat');
    }
    if (validPos(arrowX, arrowY)) {
        cells[arrowY * gridSize + arrowX].classList.add('arrow');
    }
}

// Restarting or Starting the game
function init() {
    // Reset position
    posX = randInt(0, gridSize - 1);
    posY = randInt(0, gridSize - 1);
    shootDirection = 0;

    // do {
    //     wumpusX = randInt(0, gridSize - 1);
    //     wumpusY = randInt(0, gridSize - 1);
    //     holeX = randInt(0, gridSize - 1);
    //     holeY = randInt(0, gridSize - 1);
    //     batX = randInt(0, gridSize - 1);
    //     batY = randInt(0, gridSize - 1);
    //     arrowX = randInt(0, gridSize - 1);
    //     arrowY = randInt(0, gridSize - 1);
    // } while (
    //     (wumpusX === posX && wumpusY === posY) ||
    //     (holeX === posX && holeY === posY) ||
    //     (batX === posX && batY === posY) ||
    //     (arrowX === posX && arrowY === posY)
    // );

    // Generate Wumpus position, different from player
    do {
        wumpusX = randInt(0, gridSize - 1);
        wumpusY = randInt(0, gridSize - 1);
    } while (wumpusX === posX && wumpusY === posY);

    // Generate Hole position, different from player and wumpus
    do {
        holeX = randInt(0, gridSize - 1);
        holeY = randInt(0, gridSize - 1);
    } while (
        (holeX === posX && holeY === posY) ||
        (holeX === wumpusX && holeY === wumpusY)
    );

    // Generate Bat position, different from player, wumpus, and hole
    do {
        batX = randInt(0, gridSize - 1);
        batY = randInt(0, gridSize - 1);
    } while (
        (batX === posX && batY === posY) ||
        (batX === wumpusX && batY === wumpusY) ||
        (batX === holeX && batY === holeY)
    );

    // Generate Arrow position only if arrows are not full, different from all above
    if (arrows != maxArrows) {
        do {
            arrowX = randInt(0, gridSize - 1);
            arrowY = randInt(0, gridSize - 1);
        } while (
            (arrowX === posX && arrowY === posY) ||
            (arrowX === wumpusX && arrowY === wumpusY) ||
            (arrowX === holeX && arrowY === holeY) ||
            (arrowX === batX && arrowY === batY)
        );
    }


    // Clear the grid
    grid.innerHTML = '';
    cells = [];

    // Rebuild the grid
    for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
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

// Key listener for WASD Movement
// document.addEventListener('keydown', (event) => {
//     switch (event.key.toLowerCase()) {
//         case 'w':
//             if (posY > 0) posY--;
//             break;
//         case 's':
//             if (posY < gridSize - 1) posY++;
//             break;
//         case 'a':
//             if (posX > 0) posX--;
//             break;
//         case 'd':
//             if (posX < gridSize - 1) posX++;
//             break;
//     }
//     updatePosition();
// });
// Key listener for Arrow Keys Shoot control
document.addEventListener('keydown', (event) => {
    switch (event.key) {
        // Movement
        case 'w':
        case 'W':
            if (posY > 0) posY--;
            break;
        case 's':
        case 'S':
            if (posY < gridSize - 1) posY++;
            break;
        case 'a':
        case 'A':
            if (posX > 0) posX--;
            break;
        case 'd':
        case 'D':
            if (posX < gridSize - 1) posX++;
            break;

        // Shooting
        case 'ArrowUp':
            shootDirection = 3;
            shoot();
            break;
        case 'ArrowDown':
            shootDirection = 4;
            shoot();
            break;
        case 'ArrowLeft':
            shootDirection = 1;
            shoot();
            break;
        case 'ArrowRight':
            shootDirection = 2;
            shoot();
            break;
    }

    updatePosition();
});


/*
Main game code:
Spawn wumpus, hole, bat, player at unique positions

check player shoot
    if wumpus next to player: WIN GAME, else: DRATS MISSED! and spawn arrow box and move wumpus
*/

// MARK: - RENDER
function render() {
    updatePosition(); // redraws player based on posX/posY
    // renderEntities();
}

// MARK: - UPDATE
// Track the drop position when bats carry the player
let droppedX = null;
let droppedY = null;

function update() {
    // Check for nearby entities
    updateStatusMessage(
        isNearIncludingDiagonals(posX, posY, wumpusX, wumpusY),
        "You smell a wumpus"
    );
    updateStatusMessage(
        isNearIncludingDiagonals(posX, posY, batX, batY),
        "You hear flapping"
    );
    updateStatusMessage(
        isNearIncludingDiagonals(posX, posY, holeX, holeY),
        "You feel a breeze"
    );

    // Arrow pickup logic
    if (arrowX === posX && arrowY === posY) {
        arrows = maxArrows;
        if (!isInList("You found an arrow!", statusMessages)) {
            statusMessages.push("You found an arrow!");
        }
    } else {
        if (isInList("You found an arrow!", statusMessages)) {
            deleteItem("You found an arrow!", statusMessages);
            arrowX = -1;
            arrowY = -1;
        }
    }

    // Game over conditions
    if (posX === wumpusX && posY === wumpusY) {
        player_loose("You lose! You met the wumpus!");
        return;
    } else if (posX === holeX && posY === holeY) {
        player_loose("You lose! You fell into the bottomless pit!");
        return;
    }

    // Bat logic
    if (posX === batX && posY === batY) {
        posX = randInt(0, gridSize - 1);
        posY = randInt(0, gridSize - 1);

        // Track dropped location
        droppedX = posX;
        droppedY = posY;

        // Move the bat somewhere else
        do {
            batX = randInt(0, gridSize - 1);
            batY = randInt(0, gridSize - 1);
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

    // Clear bat message once player moves away from drop
    if (droppedX !== null && droppedY !== null) {
        if (posX !== droppedX || posY !== droppedY) {
            deleteItem("Bats carried you away!", statusMessages);
            droppedX = null;
            droppedY = null;
        }
    }

    // Update status UI
    const statusList = document.getElementById("statusListPosition");
    statusList.innerHTML = ''; // Clear previous list
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
}


// MARK: - Main Game Loop
function gameLoop() {
    update();  // update game state
    render();  // draw the latest state
    if (!gameFinished) requestAnimationFrame(gameLoop); // schedule next frame
}




// MARK: - Start Game
init();
gameLoop();