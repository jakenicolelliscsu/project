const http = require('http');
const url = require('url');
const fs = require('fs');
const sql = require('mysql');
const rs = require('./ruleset.js');
const maze = require('generate-maze');

const sqlconnection = sql.createPool({
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'rulesets',
    connectionLimit : 10
    });

rules = {};
rs.SetPlayerType(rules, 0, 1, _Player0MoveHandler, _Player0VisHandler, true);
rs.SetPlayerType(rules, 1, 1, _Player1MoveHandler, _Player1VisHandler, false);

function _Player0MoveHandler(lrs, otype, ox, oy, ntype, nx, ny)
{
    //we cant move on walls.
    if (ntype == 0) return false;

    if (nx == ox+1 || nx == ox-1 || nx == ox)
        return true;
    if (ny == oy+1 || ny == oy-1 || ny == oy)
        return true;

    return false;
}
function _Player1MoveHandler(lrs, otype, ox, oy, ntype, nx, ny)
{
    return false;
}
function _Player0VisHandler(lrs, type, x, y)
{
    //move can only see win block
    if (type == 2) return true;

    return false;
}
function _Player1VisHandler(lrs, type, x, y)
{
    if (type != 2) return true;

    return false;
}


lobby = {};
lobby.ruleset = rules;
lobby.moves = [];

function CurrentPos(l)
{
    move = l.moves[l.moves.length-1];
    return {x:move.x, y:move.y};
}
function CurrentGrid(l)
{
    grid = [];
    w = rs.Width(l.ruleset);
    h = rs.Height(l.ruleset);
    grid.length = w * h;
    
    //set initial value.
    for (x=0; x<w; x++)
        for (y=0; y<h; y++)
    {
        grid[y*h + w] = rs.TileType(l.ruleset, x, y);
    }

    for(i=0; i<l.moves.length; i++)
    {
        mx = l.moves[i].x;
        my = l.moves[i].y;

        //todo: handle points, buttons, and wins.
    }

    return grid;
}


function CheckWin(l, lrs, playertype)
{
    curpos = CurrentPos(l);
    return rs.TileWins(lrs, playertype, curpos.x, curpos.y);
}

function HandleMove(l, lrs, playertype, x, y)
{
    curpos = CurrentPos(l);
    console.log("From (" + curpos.x  + ", " + curpos.y + ") -> ("+ x +", " + y +")");
    if (rs.PlayerTypeCanMove(l.ruleset, playertype, curpos.x, curpos.y, x, y))
    {
        //push current move onto top.
        l.moves.push({x:x, y:y});
        return true;
    }
    return false;
}
function HandleInfo(l, lrs, playertype)
{
    grid = CurrentGrid(l);
    w = rs.Width(l.ruleset);
    h = rs.Height(l.ruleset);
    curpos = CurrentPos(l);

    for (x=0; x<w; x++)
        for (y=0; y<h; y++)
    {
        if (rs.PlayerTypeCanSee(l.ruleset, playertype, x, y))
        {
            grid[y*h + x] = rs.TileType(l.ruleset, x, y);
        }
        else
        {
            //cant see, send default.
            grid[y*h + x] = -1;
        }
    }

    info = {};
    info.grid = grid;
    info.won = CheckWin(l, lrs, playertype);
    info.width = w;
    info.height = h;
    info.seesplayer = rs.PlayerTypeCanSeePawn(lrs, playertype);
    info.posx = curpos.x;
    info.posy = curpos.y;
    info.moves = l.moves;

    return info;
}
function HandleMapChange(l, mapname)
{
    sqlconnection.query("SELECT * FROM rulesets WHERE name = \"" + mapname + "\";", (error, results, fields) =>
        {
            if (error)
            {
                console.log(error);
            }
            else
            {
                result = results[0]
                console.log(result);
                
                curmaze = maze(result.width, result.height, true, result.seed);

                rs.SetBounds(l.ruleset, (result.width*2)+1, (result.height*2)+1);
                
                l.maze = curmaze;
                l.moves = [{
                    x: (result.startx*2)+1,
                    y: (result.starty*2)+1
                }];

                for (x=1; x < result.width*2; x+=2)
                    for (y=1; y < result.height*2; y+=2)
                {
                    node = curmaze[(y-1)/2][(x-1)/2];

                    //set cell corners
                    rs.SetTileType(rules, x-1, y-1, 0);
                    // rs.SetTileType(rules, x+1, y-1, 0);
                    // rs.SetTileType(rules, x+1, y+1, 0);
                    // rs.SetTileType(rules, x-1, y+1, 0);

                    //set cell edges
                    top = 1;
                    if (node.top)
                        top = 0;
                    bottom = 1;
                    if (node.bottom)
                        bottom = 0;
                    right = 1;
                    if (node.right)
                        right = 0;
                    left = 1;
                    if (node.left)
                        left = 0;
                    
                    rs.SetTileType(rules, x,   y-1, top);
                    // rs.SetTileType(rules, x,   y+1, bottom);
                    rs.SetTileType(rules, x-1, y,   left);
                    // rs.SetTileType(rules, x+1, y,   right);

                    rs.SetTileType(rules, x, y, 1);
                }

                //fill edges
                for (i=0; i<=result.width*2; i++) rs.SetTileType(rules, i, (result.height*2), 0);
                for (i=0; i<=result.height*2; i++) rs.SetTileType(rules, (result.width*2), i, 0);

                //set goal
                rs.SetTileType(rules, (result.width*2)-1, (result.height*2)-1, 2);

            }
        });
}
function HandleMapQuery(l)
{
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
            dy = -1;
        if (reqDir == "down")
            dy = 1;

        curpos = CurrentPos(lobby);
        HandleMove(lobby, lobby.ruleset, reqPlayerType, curpos.x + dx, curpos.y + dy)
            res.writeHead(200);
            res.end();
            return;
    }

    //player wants the current state of the board
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

    //player wants to change the map
    if (requrl.pathname == "/mapselect")
    {
        mapname = requrl.query.mapname;
        HandleMapChange(lobby, mapname);
        console.log("Selecting ruleset: " + mapname);
        res.writeHead(200, {'Content-Type': 'application/json'});
        res.end();
        return;
    }
    //player wants to know what maps are available
    if (requrl.pathname == "/mapquery")
    {
        res.writeHead(200, {'Content-Type': 'application/json'});
        
        sqlconnection.query("SELECT name FROM rulesets;", (error, results, fields) =>
        {
            if (!error)
            {
                names = [];
                for (row of results)
                    names.push(row.name);
            
                res.write(JSON.stringify(names));
            }
            else
            {
                console.log(error);
            }

            res.end();
        });
        return; //return here, the async handler will finish the http response.
    }

    //else, serve a file from the public folder.
    path = "public" + requrl.pathname;
    console.log("reading file... " + path);
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