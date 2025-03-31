module.exports = {
    Ruleset, Width, Height, SetBounds, TileType, SetTileType, SetRuleMatrixSize, SetPlayerTypeRule, SetPlayerType, PlayerTypeMaxUsers, PlayerTypeCanMove, PlayerTypeCanSee
}

function Ruleset()
{
    this.rules = [];
    this.width = 0;
    this.height = 0;
    this.tile_types = [];
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
                new_tile_types[(x * w) + y] = rs.tile_types[(x * rs.width) + y];
            else
                new_tile_types[(x * w) + y] = 0;
        }
    }

    rs.width = w;
    rs.height = h;
    rs.tile_types = new_tile_types;
}


function TileType(rs, x, y)
{
    return rs.tile_types[(x * rs.width) + y];
}
function SetTileType(rs, x, y, t)
{
    rs.tile_types[(x * rs.width) + y] = t;
}



function SetRuleMatrixSize(rs, playertype_count, tiletype_count)
{
    rs.rules = []
    rs.rules.length = playertype_count;
    for (i=0; i<playertype_count; i++)
    {
        rs.rules[i] = {};
        rs.rules[i].tiletypes = [];
        rs.rules[i].tiletypes.length = tiletype_count;
        rs.rules[i].maxusers = 0;
    }
}

function SetPlayerType(rs,
    /*int*/playertype,
    /*int*/maxusers,
    /*bool(rs,ox,oy,nx,ny)*/movevalidator
)
{
    if (rs.rules.length <= playertype)
        return;

    rs.rules[playertype] = {}
    rs.rules[playertype].maxusers = maxusers;
    rs.rules[playertype].movevalidator = movevalidator;
}
function SetPlayerTypeRule(rs, 
    /*int*/playertype,
    /*int*/tiletype,
    /*int*/maxusers,
    /*bool(rs,x,y)*/visible)
{
    if (rs.rules.length <= playertype)
        return;

    if (rs.rules[playertype].tiletypes.length <= tiletype)
        return;

    var newrule;
    newrule.visible = visible;
    rs.rules[playertype].tiletypes[tiletype] = newrule;
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

    return rs.rules[playertype].movevalidator(rs, ox, oy, nx, ny);
}
function PlayerTypeCanSee(rs, playertype, x, y)
{
    if (rs.rules.length <= playertype)
        return;

    type = TileType(rs, x, y);
    rule = rs.rules[playertype];
    
    if (rule.tiletypes <= type)
        return false;

    return rule.tiletypes[type].visible(rs, x, y);
}


