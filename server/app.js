const http = require('http');

const rs = require('./ruleset.js');

rules = {};
rs.SetRuleMatrixSize(rules, 1, 2);
rs.SetBounds(rules, 5, 5);
for (x=0; x<rs.Width(rules); x++)
{
    for (y=0; y<rs.Height(rules); y++)
    {
        console.log(rs.TileType(rules, x, y));
    }
    console.log();
}



function run(req, res)
{
}
const server = http.createServer(run);
server.listen(80);