const BOARD_SIZE = 8;

const boardElement = document.getElementById("board");

const RESOURCE_TYPES = [
    "fe",
    "cu",
    "au",
    "ti",
    "al"
];

const resources = {
    fe: 0,
    cu: 0,
    au: 0,
    ti: 0,
    al: 0
};

let board = [];
let selected = null;
let busy = false;

/* -------------------- */
/* BOARD CREATION */
/* -------------------- */

function randomType() {
    return RESOURCE_TYPES[
        Math.floor(Math.random() * RESOURCE_TYPES.length)
    ];
}

function createBoard() {

    board = [];

    for(let y = 0; y < BOARD_SIZE; y++) {

        board[y] = [];

        for(let x = 0; x < BOARD_SIZE; x++) {
            board[y][x] = randomType();
        }
    }

    removeStartingMatches();

    renderBoard();
}

function removeStartingMatches() {

    while(true) {

        const matches = findMatches();

        if(matches.length === 0) {
            break;
        }

        matches.forEach(pos => {
            board[pos.y][pos.x] = randomType();
        });
    }
}

/* -------------------- */
/* RENDER */
/* -------------------- */

function renderBoard() {

    boardElement.innerHTML = "";

    for(let y = 0; y < BOARD_SIZE; y++) {

        for(let x = 0; x < BOARD_SIZE; x++) {

            const tile = document.createElement("div");

            tile.className = "tile";

            if(
                selected &&
                selected.x === x &&
                selected.y === y
            ) {
                tile.classList.add("selected");
            }

            const img = document.createElement("img");

            img.src = `assets/${board[y][x]}.png`;

            tile.appendChild(img);

            tile.dataset.x = x;
            tile.dataset.y = y;

            tile.addEventListener("click", () => {
                handleTileClick(x, y);
            });

            boardElement.appendChild(tile);
        }
    }

    updateUI();
}

/* -------------------- */
/* UI */
/* -------------------- */

function updateUI() {

    document.getElementById("feCount").textContent =
        resources.fe;

    document.getElementById("cuCount").textContent =
        resources.cu;

    document.getElementById("auCount").textContent =
        resources.au;

    document.getElementById("tiCount").textContent =
        resources.ti;

    document.getElementById("alCount").textContent =
        resources.al;
}

/* -------------------- */
/* INPUT */
/* -------------------- */

function handleTileClick(x,y) {

    if(busy) return;

    if(!selected) {

        selected = {x,y};

        renderBoard();

        return;
    }

    const dx =
        Math.abs(selected.x - x);

    const dy =
        Math.abs(selected.y - y);

    if(dx + dy !== 1) {

        selected = {x,y};

        renderBoard();

        return;
    }

    performSwap(
        selected.x,
        selected.y,
        x,
        y
    );

    selected = null;
}

/* -------------------- */
/* SWAP */
/* -------------------- */

function performSwap(x1,y1,x2,y2) {

    swapTiles(x1,y1,x2,y2);

    renderBoard();

    const matches = findMatches();

    if(matches.length === 0) {

        setTimeout(() => {

            swapTiles(
                x1,y1,
                x2,y2
            );

            renderBoard();

        },150);

        return;
    }

    resolveBoard();
}

function swapTiles(x1,y1,x2,y2) {

    const temp =
        board[y1][x1];

    board[y1][x1] =
        board[y2][x2];

    board[y2][x2] =
        temp;
}

/* -------------------- */
/* MATCH FINDING */
/* -------------------- */

function findMatches() {

    const matched =
        new Set();

    // Horizontal

    for(let y=0;y<BOARD_SIZE;y++) {

        let streak = 1;

        for(
            let x=1;
            x<BOARD_SIZE;
            x++
        ) {

            if(
                board[y][x] ===
                board[y][x-1]
            ) {

                streak++;

            } else {

                if(streak >= 3) {

                    for(
                        let i=0;
                        i<streak;
                        i++
                    ) {

                        matched.add(
                            `${x-1-i},${y}`
                        );
                    }
                }

                streak = 1;
            }
        }

        if(streak >= 3) {

            for(
                let i=0;
                i<streak;
                i++
            ) {

                matched.add(
                    `${BOARD_SIZE-1-i},${y}`
                );
            }
        }
    }

    // Vertical

    for(let x=0;x<BOARD_SIZE;x++) {

        let streak = 1;

        for(
            let y=1;
            y<BOARD_SIZE;
            y++
        ) {

            if(
                board[y][x] ===
                board[y-1][x]
            ) {

                streak++;

            } else {

                if(streak >= 3) {

                    for(
                        let i=0;
                        i<streak;
                        i++
                    ) {

                        matched.add(
                            `${x},${y-1-i}`
                        );
                    }
                }

                streak = 1;
            }
        }

        if(streak >= 3) {

            for(
                let i=0;
                i<streak;
                i++
            ) {

                matched.add(
                    `${x},${BOARD_SIZE-1-i}`
                );
            }
        }
    }

    return [...matched].map(str=>{

        const [x,y] =
            str.split(",");

        return {
            x:Number(x),
            y:Number(y)
        };

    });
}

/* -------------------- */
/* CASCADES */
/* -------------------- */

async function resolveBoard() {

    busy = true;

    while(true) {

        const matches =
            findMatches();

        if(matches.length === 0) {
            break;
        }

        matches.forEach(pos => {

            const type =
                board[pos.y][pos.x];

            resources[type]++;

            board[pos.y][pos.x] =
                null;
        });

        renderBoard();

        await delay(150);

        collapseBoard();

        renderBoard();

        await delay(200);
    }

    busy = false;
}

function collapseBoard() {

    for(
        let x=0;
        x<BOARD_SIZE;
        x++
    ) {

        let column = [];

        for(
            let y=BOARD_SIZE-1;
            y>=0;
            y--
        ) {

            const value =
                board[y][x];

            if(value !== null) {

                column.push(
                    value
                );
            }
        }

        for(
            let y=BOARD_SIZE-1;
            y>=0;
            y--
        ) {

            if(column.length > 0) {

                board[y][x] =
                    column.shift();

            } else {

                board[y][x] =
                    randomType();
            }
        }
    }
}

/* -------------------- */
/* HELPERS */
/* -------------------- */

function delay(ms) {

    return new Promise(resolve => {

        setTimeout(
            resolve,
            ms
        );

    });
}

/* -------------------- */
/* START */
/* -------------------- */

createBoard();
