buttons = [document.getElementById("mover"), document.getElementById("guide")];

for (let i=0; i<buttons.length; i++)
{
    buttons[i].addEventListener("click", ()=>
    {
        let playertype = buttons[i].attributes.playertype.value;
        window.location.href = "board.html?playertype=" + playertype;
    })
}