(function(root){
function rank(data,results){
 const by=new Map(results.filter(x=>x.status==='final').map(x=>[x.gameId,x]));
 const mnf=by.get('CAR-TB');
 const rows=data.teams.map(t=>{let wins=0,losses=0,ties=0;for(const g of data.games){const v=by.get(g.id);if(!v)continue;if(v.awayScore===v.homeScore){ties++;continue;}if(t.picks[g.id]===(v.awayScore>v.homeScore?g.away:g.home))wins++;else losses++;}return {...t,wins,losses,ties,remaining:data.games.length-by.size,tieDistance:mnf?Math.abs(t.mnfTotal-mnf.awayScore-mnf.homeScore):null};});
 rows.sort((a,b)=>b.wins-a.wins||(a.tieDistance??0)-(b.tieDistance??0)||a.id.localeCompare(b.id));
 let previous=null;rows.forEach((t,i)=>{t.rank=previous&&previous.wins===t.wins&&previous.tieDistance===t.tieDistance?previous.rank:i+1;previous=t;});return rows;
}
if(typeof module!=='undefined')module.exports={rank};else root.HouseScoring={rank};
})(globalThis);
