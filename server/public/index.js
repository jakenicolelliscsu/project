buttons = [document.getElementById("mover"), document.getElementById("guide")];

for (let i=0; i<buttons.length; i++)
{
    buttons[i].addEventListener("click", ()=>
    {
        let playertype = buttons[i].attributes.playertype.value;
        window.location.href = "board.html?playertype=" + playertype;
    })
}

mapsel = document.getElementById("map");
mapselCallback = new XMLHttpRequest();
mapselCallback.onload = () =>
{
}

mapqueryCallback = new XMLHttpRequest();
mapqueryCallback.onload = () =>
{
    response = JSON.parse(mapqueryCallback.responseText);   

    mapsel.innerHTML = "";
    mapsel.length = response.length;

    for (i=0; i<mapsel.length; i++)
    {
        mapsel.options[i].text = response[i];
        mapsel.value = response[i];
    }
}

//select map on change.
mapsel.addEventListener("change", () =>
{
    mapselCallback.open("GET", "/mapselect?mapname=" + mapsel.value);
    mapselCallback.send();
})

//query available maps and populate dropdown.
mapqueryCallback.open("GET", "/mapquery");
mapqueryCallback.send();