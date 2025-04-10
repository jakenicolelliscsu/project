module.exports = {
    Width, Height, SetBounds, TileType, SetTileType, SetPlayerType, PlayerTypeMaxUsers, PlayerTypeCanMove, PlayerTypeCanSee, TileWins,
    PlayerTypeCanSeePawn, TileLinks, SetTileLinks
}

function Width(rs) { return rs.width; }
function Height(rs) { return rs.height; }
function SetBounds(rs, w, h)
{
    new_tile_types = [];
    new_tile_types.length = w * h;
    for(x = 0; x < w; x++)
    {
        for(y=0; y < h; y++)
        {
            if (x < rs.width && y < rs.height)
            {
                new_tile_types[(x * w) + y] = rs.tile_types[(x * rs.width) + y];
            }
            else
            {
                new_tile_types[(x * w) + y] = {type:-1};
            }
        }
    }

    rs.width = w;
    rs.height = h;
    rs.tile_types = new_tile_types;
}


function TileType(rs, x, y)
{
    return rs.tile_types[(x * rs.width) + y].type;
}
function SetTileType(rs, x, y, t)
{
    rs.tile_types[(x * rs.width) + y].type = t;
}

function TileLinks(rs, x, y)
{
    return rs.tile_types[(x * rs.width) + y].links;
}
function SetTileLinks(rs, x, y, /*(x,y)[]*/ data)
{
    rs.tile_types[(x * rs.width) + y].links = data;
}

function SetPlayerType(rs,
    /*int*/playertype,
    /*int*/maxusers,
    /*bool(rs,otype,ox,oy,ntype,nx,ny)*/movevalidator,
    /*bool(rs,type,x,y)*/visvalidator,
)
{
    if (rs.rules == undefined)
        rs.rules = [];

    if (rs.rules.length <= playertype)
        rs.rules.length = playertype + 1;

    rs.rules[playertype] = {};
    rs.rules[playertype].maxusers = maxusers;
    rs.rules[playertype].movevalidator = movevalidator;
    rs.rules[playertype].visvalidator = visvalidator;
    rs.rules[playertype].canseepawn = true;
}

function PlayerTypeMaxUsers(rs, playertype)
{
    if (rs.rules.length <= playertype)
        return;

    return rs.rules[playertype].maxusers;
}
function PlayerTypeCanMove(rs, playertype, ox, oy, nx, ny)
{
    if (rs.rules.length <= playertype)
        return;

    otype = TileType(rs, ox, oy);
    ntype = TileType(rs, nx, ny);

    return rs.rules[playertype].movevalidator(rs, otype, ox, oy, ntype, nx, ny);
}
function PlayerTypeCanSee(rs, playertype, x, y)
{
    if (rs.rules.length <= playertype)
        return false;

    type = TileType(rs, x, y);

    return rs.rules[playertype].visvalidator(rs, type, x, y);
}
function PlayerTypeCanSeePawn(rs, playertype)
{
    if (rs.rules.length <= playertype)
        return;

    return rs.rules[playertype].canseepawn;
}
function TileWins(rs, playertype, x, y)
{
    return false;
}

