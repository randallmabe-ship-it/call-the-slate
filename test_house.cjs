const assert=require('node:assert/strict'),fs=require('node:fs'),crypto=require('node:crypto'),{rank}=require('./house-scoring');
const raw=fs.readFileSync(__dirname+'/house-week12.json'),d=JSON.parse(raw);
assert.equal(d.teams.length,39);assert.equal(new Set(d.teams.map(t=>t.name)).size,39);assert.equal(d.games.length,16);assert.ok(Date.parse(d.createdAt)<Math.min(...d.games.map(g=>Date.parse(g.kickoff))));
for(const t of d.teams){assert.equal(Object.keys(t.picks).length,16);for(const g of d.games)assert.ok([g.away,g.home].includes(t.picks[g.id]));}
assert.equal(crypto.createHash('sha256').update(raw).digest('hex'),fs.readFileSync(__dirname+'/HOUSE_PICKS_SHA256.txt','utf8').split(' ')[0]);
assert.ok(rank(d,[]).every(t=>t.wins===0&&t.rank===1&&t.remaining===16));
const one=rank(d,[{gameId:'GB-LAR',status:'final',awayScore:24,homeScore:20}]);assert.equal(one.filter(t=>t.wins===1).length,d.teams.filter(t=>t.picks['GB-LAR']==='GB').length);
assert.ok(rank(d,[{gameId:'GB-LAR',status:'final',awayScore:20,homeScore:20}]).every(t=>t.wins===0&&t.ties===1));
assert.ok(rank(d,[{gameId:'GB-LAR',status:'in_progress',awayScore:24,homeScore:20}]).every(t=>t.wins===0));
const test={games:[{id:'CAR-TB',away:'CAR',home:'TB'}],teams:[{id:'a',picks:{'CAR-TB':'CAR'},mnfTotal:39},{id:'b',picks:{'CAR-TB':'CAR'},mnfTotal:41},{id:'c',picks:{'CAR-TB':'CAR'},mnfTotal:50}]};assert.deepEqual(rank(test,[{gameId:'CAR-TB',status:'final',awayScore:24,homeScore:16}]).map(x=>x.rank),[1,1,3]);
console.log('PASS: 39 teams; 624 valid pre-kickoff picks; checksum; final-only scoring; tied games; shared champions.');
