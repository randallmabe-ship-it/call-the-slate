"""Record a verified final and persist a standings snapshot. Never edits frozen picks."""
import argparse,datetime,json,hashlib
from pathlib import Path
p=argparse.ArgumentParser();p.add_argument('game');p.add_argument('away',type=int);p.add_argument('home',type=int);p.add_argument('--source',required=True);p.add_argument('--correction-reason');a=p.parse_args()
root=Path(__file__).parent
assert min(a.away,a.home)>=0,'Scores must be nonnegative'
assert a.source.startswith('https://'),'Provide verified result source URL'
data=json.loads((root/'house-week12.json').read_text());g=next(g for g in data['games'] if g['id']==a.game)
assert hashlib.sha256((root/'house-week12.json').read_bytes()).hexdigest()==(root/'HOUSE_PICKS_SHA256.txt').read_text().split()[0],'Frozen picks changed'
now=datetime.datetime.now(datetime.timezone.utc);assert now>=datetime.datetime.fromisoformat(g['kickoff']),'Game has not started'
state=json.loads((root/'house-results.json').read_text());old=next((r for r in state['results'] if r['gameId']==a.game),None)
if old and old['awayScore']==a.away and old['homeScore']==a.home:raise SystemExit('Already recorded; no duplicate snapshot')
if old and not a.correction_reason:raise SystemExit('Correction requires --correction-reason')
row=dict(gameId=a.game,status='final',awayScore=a.away,homeScore=a.home,source=a.source,verifiedAt=now.isoformat())
if old:row['correctionReason']=a.correction_reason
state['results']=[r for r in state['results'] if r['gameId']!=a.game]+[row];state['updatedAt']=now.isoformat()
state['snapshots'].append(dict(id=f"snapshot-{len(state['snapshots'])+1}",at=now.isoformat(),label=f"After {a.game} {a.away}–{a.home}"+(' correction' if old else ''),results=state['results']))
(root/'house-results.json').write_text(json.dumps(state,indent=2)+'\n')
print('Saved final and snapshot. Commit and deploy house-results.json to update public standings.')
