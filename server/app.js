const http = require('http');
const url = require('url');
const rs = require('./ruleset.js');

rules = {};
rs.SetRuleMatrixSize(rules, 1, 2);
rs.SetBounds(rules, 5, 5);

lobby = {};
lobby.playerpos = {};
lobby.playerpos.x = 0;
lobby.playerpos.y = 0;

function HandleMove(l, lrs, playertype, x, y)
{
    if (rs.PlayerTypeCanMove(lrs, playertype, lobby.playerpos.x, lobby.playerpos.y, x, y))
    {
        lobby.playerpos.x = x;
        lobby.playerpos.y = y;
        return true;
    }
    return false;
}




function Route(req, res)
{
    requrl = url.parse(req.url, true);
    reqip = req.ip;

    //player wants to move.
    if (requrl.pathname == "/move")
    {
        reqPlayerType = requrl.query.playertype;
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

        //if the player could not move, finish.
        if (!HandleMove(lobby, rules, reqPlayerType, 
            lobby.playerpos.x + dx,
            lobby.playerpos.y + dy))
            {
                res.writeHead(200);
                res.end();
                return;
            }
    }

    if (requrl.pathname == "/query")
    {
        reqPlayerType = requrl.query.playertype;
    }
}
const server = http.createServer(Route);
server.listen(80);