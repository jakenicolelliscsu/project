board = {};

table = document.getElementById("table");

boardCallback = new XMLHttpRequest();
boardCallback.onload = () =>
{
    if (boardCallback.status == 200)
    {
        board = JSON.parse(boardCallback.responseText);   
        
        table.innerHTML = "";
    
        for(j=0; j<board.height; j++)
        {
            row = table.insertRow();
            row.style.height = "20px";
            for(i=0; i<board.width; i++)
            {
                cell = row.insertCell();
                cell.style.width = "20px";
                tiletype = board.grid[i*board.width + j];
                
                color = "grey";
                if (tiletype == 0) color = "green";
                if (tiletype == 1) color = "grey";
                if (tiletype == 2) color = "yellow";

                if (board.seesplayer && board.posx == i && board.posy == j)
                    color = "red";

                cell.style.backgroundColor = color;
            }
        }

        if (board.won)
           alert ("Winner!!!!");
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
    title = document.getElementById("title");
    name = title.attributes.name.value;
    url = "/board?playertype=" + name;

    boardCallback.open("GET", url);
    boardCallback.send();
}

document.addEventListener("keydown", (event) =>
{
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
    
    title = document.getElementById("title");
    name = title.attributes.name.value;
    url = "/move?playertype=" + name + "&dir=" + dir;
    moveCallback.open("GET", url);
    moveCallback.send();

    UpdateBoard();
})