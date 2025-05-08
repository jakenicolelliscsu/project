board = {};

table = document.getElementById("table");

boardCallback = new XMLHttpRequest();
boardCallback.onload = () =>
{
    if (boardCallback.status == 200)
    {
        board = JSON.parse(boardCallback.responseText);   
        
        table.innerHTML = "";
        table.style.borderCollapse = "collapse";
    
        for(j=0; j<board.height; j++)
        {
            row = table.insertRow();
            row.style.height = "20px";
            for(i=0; i<board.width; i++)
            {
                cell = row.insertCell();
                cell.style.width = "20px";
                tiletype = board.grid[j*board.width + i];
                
                color = "grey";
                if (tiletype == 0) color = "green";
                if (tiletype == 1) color = "grey";
                if (tiletype == 2) color = "yellow";

                cell.style.backgroundColor = color;
            }
        }

        for(j=0; j<board.moves.length; j++)
        {
            move = board.moves[j];
            table.rows[move.y].cells[move.x].style.backgroundColor = "DarkRed";
        }

        //do last
        if (board.seesplayer)
        {
            table.rows[board.posy].cells[board.posx].style.backgroundColor = "red";            
        }

        if (board.won)
           alert ("Winner! Moves: " + board.moves.length);
    }
    else
    {
       alert ("Server error.");
    }
};

moveCallback = new XMLHttpRequest();
moveCallback.onload = () =>
{

}

function UpdateBoard()
{
    playertype = new URLSearchParams(window.location.search).get("playertype");

    url = "/board?playertype=" + playertype;

    title = document.getElementById("title");
    title.text = "Player " + playertype;
    
    boardCallback.open("GET", url);
    boardCallback.send();
}

document.addEventListener("keydown", (event) =>
{
    playertype = new URLSearchParams(window.location.search).get("playertype");
    dir = "up";

    switch(event.key)
    {
        case "ArrowDown":
            dir = "down";
            break;
        case "ArrowUp":
            dir = "up";
            break;
        case "ArrowLeft":
            dir = "left";
            break;
        case "ArrowRight":
            dir = "right";
            break;
        default:
            return;
    }
    
    url = "/move?playertype=" + playertype + "&dir=" + dir;
    moveCallback.open("GET", url);
    moveCallback.send();

    UpdateBoard();
})

UpdateBoard();