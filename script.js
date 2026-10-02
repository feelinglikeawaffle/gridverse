const SIZE = 8;

const boardElement = document.getElementById("board");

let board = [];

let selected = null;

let phase = "day";

let food = 0;
let crystal = 0;

const dayTiles = [
    "circle",
    "square",
    "triangle",
    "diamond"
];

const nightTiles = [
    "sword",
    "shield",
    "skull",
    "fire"
];

function tilePool(){
    return phase === "day"
        ? dayTiles
        : nightTiles;
}

function randomTile(){

    const pool = tilePool();

    return pool[
        Math.floor(Math.random()*pool.length)
    ];
}

function createBoard(){

    board = [];

    for(let y=0;y<SIZE;y++){

        const row=[];

        for(let x=0;x<SIZE;x++){

            row.push(randomTile());

        }

        board.push(row);
    }

    drawBoard();

    resolveBoard();
}

function drawBoard(){

    boardElement.innerHTML="";

    for(let y=0;y<SIZE;y++){

        for(let x=0;x<SIZE;x++){

            const tile=document.createElement("div");

            tile.className=
                "tile " + board[y][x];

            if(
                selected &&
                selected.x===x &&
                selected.y===y
            ){
                tile.classList.add("selected");
            }

            tile.onclick=()=>tileClick(x,y);

            boardElement.appendChild(tile);
        }
    }

    document.getElementById("food").textContent=food;

    document.getElementById("crystal").textContent=crystal;

    document.getElementById("phase").textContent=
        phase==="day"
        ? "DAY ☀"
        : "NIGHT 🌙";
}

function tileClick(x,y){

    if(!selected){

        selected={x,y};

        drawBoard();

        return;
    }

    const dx=Math.abs(selected.x-x);
    const dy=Math.abs(selected.y-y);

    if(dx+dy===1){

        swap(
            selected.x,
            selected.y,
            x,
            y
        );

        drawBoard();

        setTimeout(resolveBoard,50);
    }

    selected=null;

    drawBoard();
}

function swap(x1,y1,x2,y2){

    const temp=board[y1][x1];

    board[y1][x1]=board[y2][x2];

    board[y2][x2]=temp;
}

function findMatches(){

    const matches=[];

    for(let y=0;y<SIZE;y++){

        let streak=1;

        for(let x=1;x<SIZE;x++){

            if(
                board[y][x] &&
                board[y][x]===board[y][x-1]
            ){
                streak++;
            }
            else{

                if(streak>=3){

                    for(let i=0;i<streak;i++){

                        matches.push({
                            x:x-1-i,
                            y
                        });
                    }
                }

                streak=1;
            }
        }

        if(streak>=3){

            for(let i=0;i<streak;i++){

                matches.push({
                    x:SIZE-1-i,
                    y
                });
            }
        }
    }

    for(let x=0;x<SIZE;x++){

        let streak=1;

        for(let y=1;y<SIZE;y++){

            if(
                board[y][x] &&
                board[y][x]===board[y-1][x]
            ){
                streak++;
            }
            else{

                if(streak>=3){

                    for(let i=0;i<streak;i++){

                        matches.push({
                            x,
                            y:y-1-i
                        });
                    }
                }

                streak=1;
            }
        }

        if(streak>=3){

            for(let i=0;i<streak;i++){

                matches.push({
                    x,
                    y:SIZE-1-i
                });
            }
        }
    }

    return matches;
}

function resolveBoard(){

    const matches=findMatches();

    if(matches.length===0){

        drawBoard();

        return;
    }

    matches.forEach(pos=>{

        const type=board[pos.y][pos.x];

        if(phase==="day"){

            if(type==="circle") food++;
            if(type==="diamond") crystal++;

        }

        board[pos.y][pos.x]=null;
    });

    drawBoard();

    setTimeout(()=>{

        dropTiles();

        drawBoard();

        setTimeout(resolveBoard,120);

    },150);
}

function dropTiles(){

    for(let x=0;x<SIZE;x++){

        let stack=[];

        for(let y=SIZE-1;y>=0;y--){

            if(board[y][x]){

                stack.push(
                    board[y][x]
                );
            }
        }

        for(let y=SIZE-1;y>=0;y--){

            if(stack.length){

                board[y][x]=stack.shift();

            }else{

                board[y][x]=randomTile();
            }
        }
    }
}

document
.getElementById("phaseBtn")
.addEventListener(
"click",
()=>{

    phase=
        phase==="day"
        ? "night"
        : "day";

    createBoard();

});

createBoard();
