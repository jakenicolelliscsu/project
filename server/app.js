const http = require('http');
const url = require('url');
const rs = require('./ruleset.js');
const fs = require('fs');

rules = {};
rs.SetRuleMatrixSize(rules, 2, 3);
rs.SetBounds(rules, 15, 15);

rs.SetPlayerType(rules, 0, 1, _Player0MoveHandler, true);
rs.SetPlayerType(rules, 1, 1, (lrs, ox, oy, nx, ny) => {return false;}, false);

//blank
rs.SetPlayerTypeRule(rules, 0, 0, (lrs, x, y) => {return false;}, false);
rs.SetPlayerTypeRule(rules, 1, 0, (lrs, x, y) => {return true;}, false);

//wall
rs.SetPlayerTypeRule(rules, 0, 1, (lrs, x, y) => {return false;}, false);
rs.SetPlayerTypeRule(rules, 1, 1, (lrs, x, y) => {return true;}, false);

//win block
rs.SetPlayerTypeRule(rules, 0, 2, (lrs, x, y) => {return true;}, true);
rs.SetPlayerTypeRule(rules, 1, 2, (lrs, x, y) => {return false;}, true);

function _Player0MoveHandler(lrs, otype, ox, oy, ntype, nx, ny)
{
    //we cant move on walls.
    if (ntype == 1) return false;

    if (nx == ox+1 || nx == ox-1 || nx == ox)
        return true;
    if (ny == oy+1 || ny == oy-1 || ny == oy)
        return true;

    return false;
}

w = rs.Width(rules);
h = rs.Height(rules);

//temp grid setup.
for (x=0; x<w; x++)
    for (y=0; y<h; y++)
{
    type = 0;
    if (x == 0 || x == w-1)
        type = 1;
    if (y == 0 || y == h-1)
        type = 1;

    rs.SetTileType(rules, x, y, type);
}
rs.SetTileType(rules, 1, 0, 2);

lobby = {};
lobby.playerpos = {};
lobby.playerpos.x = 13;
lobby.playerpos.y = 13;

function CheckWin(l, lrs, playertype)
{
    return rs.TileWins(lrs, playertype, l.playerpos.x, l.playerpos.y);
}
function HandleMove(l, lrs, playertype, x, y)
{
    console.log("From (" + l.playerpos.x  + ", " + l.playerpos.y + ")");
    console.log("To ("+ x +", " + y +")");
    if (rs.PlayerTypeCanMove(lrs, playertype, l.playerpos.x, l.playerpos.y, x, y))
    {
        l.playerpos.x = x;
        l.playerpos.y = y;
        return true;
    }
    return false;
}
function HandleInfo(l, lrs, playertype)
{
    w = rs.Width(lrs);
    h = rs.Height(lrs);

    info = {};
    info.grid = [];
    info.grid.length = w*h;

    for (x=0; x<w; x++)
        for (y=0; y<h; y++)
    {
        if (rs.PlayerTypeCanSee(lrs, playertype, x, y))
        {
            info.grid[x*w + y] = rs.TileType(lrs, x, y);
        }
        else
        {
            info.grid[x*w + y] = -1;
        }
    }

    info.won = CheckWin(l, lrs, playertype);

    info.width = w;
    info.height = h;

    info.seesplayer = rs.PlayerTypeCanSeePawn(lrs, playertype);
    info.posx = l.playerpos.x;
    info.posy = l.playerpos.y;

    return info;
}



function Route(req, res)
{
    requrl = url.parse(req.url, true);
    reqip = req.ip;

    //player wants to move.
    if (requrl.pathname == "/move")
    {
        reqPlayerType = parseInt(requrl.query.playertype);
        reqDir = requrl.query.dir;

        dx = 0;
        dy = 0;
        if (reqDir == "left")
            dx = -1;
        if (reqDir == "right")
            dx = 1;
        if (reqDir == "up")
            dy = 1;
        if (reqDir == "down")
            dy = -1;

        HandleMove(lobby, rules, reqPlayerType, lobby.playerpos.x + dx, lobby.playerpos.y + dy)
        {
            res.writeHead(200);
            res.end();
            return;
        }
    }

    if (requrl.pathname == "/board")
    {
        console.log("sending board info...");
        reqPlayerType = parseInt(requrl.query.playertype);
        grid = HandleInfo(lobby, rules, reqPlayerType);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.write(JSON.stringify(grid))
        res.end();
        return;
    }

    //else, serve a file from the public folder.
    path = "public" + requrl.pathname;
    console.log("reading file...");
    fs.readFile(path, (err, data) =>
    {
        if (!err)
        {
                type = "image/png";
                extIndex = path.lastIndexOf('.');
                if (extIndex < 0)
                {
                        console.log('Error: no ext');
                        return; //bad path.
                }
                ext = path.substring(extIndex+1); //+1 because we dont want the dot.
                types = {
                        "jpg": "image/jpg",
                        "jpeg": "image/jpg",
                        "txt": "text/plain",
                        "html": "text/html",
                        "js": "text/javascript",
                        "css": "text/css",
                        "png": "image/png"
                }

                if (!(ext in types))
                {
                        console.log('Error: unknown ext: ' + ext);
                        return; //unknown ext.
                }
                res.writeHead(200, {'Content-Type': types[ext]});
                res.write(data);
                res.end();
            }
            else
            {
                res.writeHead(400, {'Content-Type': "text/plain"});
                res.end();
            }
    });
    
}
const server = http.createServer(Route);
server.listen(80);