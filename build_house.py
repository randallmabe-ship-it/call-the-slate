from pathlib import Path
import json,random,datetime,hashlib
root=Path(__file__).parent
r=random.Random(20261125)
names=['Fourth and Gravy','The Cranberry Blitz','Turkey Leg Tacklers','Stuffing the Box','The Wishbone Wreckers','Pumpkin Spice Picks','The Couch Coordinators','Gravy Train Gang','The Leftover Legends','Red Zone Rejects','The Coin Toss Cartel','Sunday Scaries','The Upset Department','No Punt Intended','The Timeout Bandits','Monday Night Miracles','The Waiver Wire Wizards','Goal Line Gobblers','The Sofa Scouts','The Hail Mary Club','The False Start Society','The Field Goal Fiasco','The Overtime Outlaws','The End Zone Entourage','The Pick Six Pack','The Audible Committee','The Two Minute Turkeys','The Sideline Scholars','The Blitz Biscuits','The Fumble Recovery Crew','The Touchdown Taters','The Wild Card Waffles','The Pocket Protectors','The Bye Week Bandits','The Snap Decisions','The Replay Rebels','The Underdog Union','The Final Whistle','The Victory Formation']
slate=[('GB','LAR','25T20:00'),('CHI','DET','26T13:00'),('PHI','DAL','26T16:30'),('KC','BUF','26T20:20'),('DEN','PIT','27T15:00'),('NO','CIN','29T13:00'),('BAL','HOU','29T13:00'),('NYG','IND','29T13:00'),('TEN','JAX','29T13:00'),('NYJ','MIA','29T13:00'),('ATL','MIN','29T13:00'),('NE','LAC','29T16:05'),('WAS','ARI','29T16:25'),('SEA','SF','29T16:25'),('LV','CLE','29T20:20'),('CAR','TB','30T20:15')]
created=datetime.datetime.now(datetime.timezone.utc).isoformat()
games=[dict(id=f'{a}-{h}',away=a,home=h,kickoff=f'2026-11-{dt}:00-05:00') for a,h,dt in slate]
teams=[]
for i,name in enumerate(names):
 teams.append(dict(id=f'H{i+1:02}',name=name,type='fictional_house_team',mnfTotal=r.randint(28,64),picks={g['id']:r.choice([g['away'],g['home']]) for g in games}))
data=dict(contest='HH-HOUSE-2026-W12',week=12,createdAt=created,seed=20261125,disclosure='39 fictional house teams. Exhibition only. No entry fees, prize pool or payouts.',scheduleSource='https://media.nfl.com/content/dam/communications/documents/2026/Week%2012%20Schedule%20Change.pdf',games=games,teams=teams)
root.joinpath('house-week12.json').write_text(json.dumps(data,indent=2)+'\n')
root.joinpath('house-results.json').write_text(json.dumps(dict(updatedAt=created,results=[],snapshots=[]),indent=2)+'\n')
root.joinpath('HOUSE_PICKS_SHA256.txt').write_text(hashlib.sha256(root.joinpath('house-week12.json').read_bytes()).hexdigest()+'  house-week12.json\n')
print('Generated',len(teams),'teams and',sum(len(t['picks']) for t in teams),'picks at',created)
