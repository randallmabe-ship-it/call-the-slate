const SUPABASE_URL='https://pslubgyrsmaenmpnnxqs.supabase.co';
const SUPABASE_KEY='sb_publishable_g1WL92h0nkOo5na0VBqy_g_s_k8kwGO';
const sb=window.supabase?.createClient(SUPABASE_URL,SUPABASE_KEY);
const WEEK1_ID='047b65c2-0db7-4ac6-be4b-f6070a759a4b';
const ids=['home','picks','standings','rules','join','admin'];
let mode='su';
let p=JSON.parse(localStorage.getItem('cts-picks')||'{}');
const games=[
 {id:'2bf1ca8d-11d6-4c00-b2e4-28971764e444',dt:'2026-09-10T00:20:00Z',label:'Wed · 8:20 PM ET',a:'NE',an:'New England',h:'SEA',hn:'Seattle',fav:'SEA',line:3.5},
 {id:'c84dfc8c-8d90-4f80-a202-aa37d05e0c73',dt:'2026-09-11T00:35:00Z',label:'Thu · 8:35 PM ET',a:'SF',an:'San Francisco',h:'LA',hn:'LA Rams',fav:'LA',line:3.5},
 {id:'11ab3363-6899-4646-a4c4-0a3575c3055a',dt:'2026-09-13T17:00:00Z',label:'Sun · 1:00 PM ET',a:'CHI',an:'Chicago',h:'CAR',hn:'Carolina',fav:'CHI',line:3.0},
 {id:'14a137a8-c892-4aa5-9fb1-8f85a3609b28',dt:'2026-09-13T17:00:00Z',label:'Sun · 1:00 PM ET',a:'BAL',an:'Baltimore',h:'IND',hn:'Indianapolis',fav:'BAL',line:3.5},
 {id:'65387c45-a762-447f-85bf-2ac0381a8240',dt:'2026-09-13T17:00:00Z',label:'Sun · 1:00 PM ET',a:'ATL',an:'Atlanta',h:'PIT',hn:'Pittsburgh',fav:'PIT',line:3.5},
 {id:'6f9e9522-bee1-40a8-92c8-91ab651827cf',dt:'2026-09-13T17:00:00Z',label:'Sun · 1:00 PM ET',a:'CLE',an:'Cleveland',h:'JAC',hn:'Jacksonville',fav:'JAC',line:8.5},
 {id:'71c9efbf-74b9-4bfd-9617-7df24c4bad89',dt:'2026-09-13T17:00:00Z',label:'Sun · 1:00 PM ET',a:'TB',an:'Tampa Bay',h:'CIN',hn:'Cincinnati',fav:'CIN',line:3.5},
 {id:'a08db76e-c9cc-404b-9e18-0568486775d7',dt:'2026-09-13T17:00:00Z',label:'Sun · 1:00 PM ET',a:'NYJ',an:'NY Jets',h:'TEN',hn:'Tennessee',fav:'TEN',line:1.5},
 {id:'be0d6413-0c1d-45c7-94c6-efe4c6ecc93e',dt:'2026-09-13T17:00:00Z',label:'Sun · 1:00 PM ET',a:'NO',an:'New Orleans',h:'DET',hn:'Detroit',fav:'DET',line:6.5},
 {id:'db2b328c-7e7d-4236-929f-d3aad6f92bf1',dt:'2026-09-13T17:00:00Z',label:'Sun · 1:00 PM ET',a:'BUF',an:'Buffalo',h:'HOU',hn:'Houston',fav:'BUF',line:1.5},
 {id:'02635d1a-30ff-4a78-ace7-96dd3581e736',dt:'2026-09-13T20:25:00Z',label:'Sun · 4:25 PM ET',a:'ARI',an:'Arizona',h:'LAC',hn:'LA Chargers',fav:'LAC',line:9.5},
 {id:'810f2cd8-189f-49ce-89fa-f4d4172f7f0d',dt:'2026-09-13T20:25:00Z',label:'Sun · 4:25 PM ET',a:'GB',an:'Green Bay',h:'MIN',hn:'Minnesota',fav:'MIN',line:1.5},
 {id:'94c3a4c2-614a-43d9-a266-eea4051e715c',dt:'2026-09-13T20:25:00Z',label:'Sun · 4:25 PM ET',a:'MIA',an:'Miami',h:'LV',hn:'Las Vegas',fav:'LV',line:3.5},
 {id:'a288455d-ae9c-4d4f-96b8-ea42e64a0a9c',dt:'2026-09-13T20:25:00Z',label:'Sun · 4:25 PM ET',a:'WAS',an:'Washington',h:'PHI',hn:'Philadelphia',fav:'PHI',line:5.5},
 {id:'6eee326a-c62c-43b6-a990-963b0bb7ed06',dt:'2026-09-14T00:20:00Z',label:'Sun · 8:20 PM ET',a:'DAL',an:'Dallas',h:'NYG',hn:'NY Giants',fav:'DAL',line:2.5},
 {id:'5c96a049-751a-40c8-9295-c09a5d9519e6',dt:'2026-09-15T00:15:00Z',label:'Mon · 8:15 PM ET',a:'DEN',an:'Denver',h:'KC',hn:'Kansas City',fav:'KC',line:2.5}
];
const navEl=document.getElementById('nav'),mnav=document.getElementById('mnav'),gamesEl=document.getElementById('games');
function nav(){let h=[['home','Home'],['picks','Make Picks'],['standings','Standings'],['rules','Rules'],['join','Join'],['admin','Admin Demo']].map(x=>`<button onclick="show('${x[0]}')">${x[1]}</button>`).join('');navEl.innerHTML=h;mnav.innerHTML=h}
function show(id){ids.forEach(x=>document.getElementById(x).classList.toggle('on',x===id));mnav.classList.remove('on');if(id==='picks')render();scrollTo(0,0)}
function toggleMenu(){mnav.classList.toggle('on')}
function modeSet(m){mode=m;su.classList.toggle('on',m==='su');atsb.classList.toggle('on',m==='ats');render()}
function spread(g,team){return team===g.fav?'-'+g.line.toFixed(1):'+'+g.line.toFixed(1)}
function locked(g){return Date.now()>=new Date(g.dt).getTime()}
function render(){gamesEl.innerHTML=games.map((g,i)=>{let lk=locked(g);return `<div class='game ${lk?'locked':''}'><div class='gameTop'><span>${g.label}</span><span>${lk?'🔒 Locked':mode==='ats'?`Pool line · ${g.fav} -${g.line.toFixed(1)}`:'Pick the winner'}</span></div><div class='teams'><button ${lk?'disabled':''} class='team ${p[mode+g.id]===g.a?'sel':''}' onclick="pick('${g.id}','${g.a}')"><span class='badge'>${g.a}</span>${g.an}${mode==='ats'?`<span class='spread'>${spread(g,g.a)}</span>`:''}</button><div class='at'>@</div><button ${lk?'disabled':''} class='team ${p[mode+g.id]===g.h?'sel':''}' onclick="pick('${g.id}','${g.h}')"><span class='badge'>${g.h}</span>${g.hn}${mode==='ats'?`<span class='spread'>${spread(g,g.h)}</span>`:''}</button></div></div>`}).join('')}
function pick(id,t){let g=games.find(x=>x.id===id);if(locked(g))return;p[mode+id]=t;render()}
function savePicks(){localStorage.setItem('cts-picks',JSON.stringify(p));savemsg.textContent='✓ Picks saved on this device. Use Submit Picks to enter them officially.'}
function total(){let v=(weekly.checked?12:0)+(ats.checked?12:0)+(season.checked?30:0);document.getElementById('total').textContent='$'+v}
function prefill(x){show('join');document.getElementById(x).checked=true;total()}
function quickBoth(){show('join');weekly.checked=true;ats.checked=true;season.checked=false;total()}
function openLogin(){modal.classList.add('on')}function closeLogin(){modal.classList.remove('on')}function demoAccount(){closeLogin()}
async function joinNow(){const name=document.getElementById('joinName').value.trim(),email=document.getElementById('joinEmail').value.trim();const phone=document.getElementById('joinPhone').value.trim(),referral=document.getElementById('joinReferral').value.trim();if(!name||!email){joinMsg.textContent='Please enter your name and email.';return}if(!weekly.checked&&!ats.checked&&!season.checked){joinMsg.textContent='Choose at least one contest.';return}if(!sb){joinMsg.textContent='Connection error. Please try again.';return}const id=crypto.randomUUID();joinMsg.textContent='Submitting…';const {error}=await sb.from('cts_public_entries').insert({id,display_name:name,email,phone:phone||null,weekly_straight_up:weekly.checked,weekly_ats:ats.checked,season_long:season.checked,payment_method:document.querySelector('input[name=pay]:checked')?.value||null,referral_source:referral||null});if(error){console.error(error);joinMsg.textContent='Could not submit your entry. Please try again.';return}localStorage.setItem('cts-entry-id',id);localStorage.setItem('cts-entry-name',name);localStorage.setItem('cts-entry-email',email);localStorage.setItem('cts-entry-contests',JSON.stringify({weekly:weekly.checked,ats:ats.checked,season:season.checked}));joinMsg.innerHTML='✓ Entry received! Your payment is marked <b>pending</b>. You can make Week 1 picks now.';show('picks')}
async function submitPicks(){const entryId=localStorage.getItem('cts-entry-id');if(!entryId){savemsg.textContent='Join first so we can attach these picks to your entry.';show('join');return}const tie=parseInt(document.getElementById('tie').value,10);const enrolled=JSON.parse(localStorage.getItem('cts-entry-contests')||'{}');if((mode==='su'&&!enrolled.weekly)||(mode==='ats'&&!enrolled.ats)){savemsg.textContent=`You are not entered in ${mode==='su'?'The Weekly':'Beat The Spread'} yet. Add that contest from Join.`;return}const selected={};games.forEach(g=>{if(p[mode+g.id])selected[g.id]=p[mode+g.id]});const contestCode=mode==='su'?'weekly':'ats';const row={id:crypto.randomUUID(),entry_id:entryId,contest_code:contestCode,week_id:WEEK1_ID,picks:selected,mnf_total:Number.isFinite(tie)?tie:null,client_note:'Week 1 public launch submission'};const {error}=await sb.from('cts_public_submissions').insert(row);if(error){console.error(error);savemsg.textContent='Submission failed. Please try again.';return}localStorage.setItem('cts-picks',JSON.stringify(p));savemsg.textContent='✓ Official Week 1 submission received. You can resubmit before kickoff; latest eligible picks will be used.'}
function nextLock(){const next=games.find(g=>!locked(g));if(!next)return 'All Week 1 games have locked.';const ms=new Date(next.dt)-Date.now();const h=Math.floor(ms/36e5),m=Math.floor((ms%36e5)/6e4);return `Next game locks in ${h}h ${m}m · ${next.a} @ ${next.h}`}
function tick(){document.querySelectorAll('.nextLock').forEach(e=>e.textContent=nextLock())}
function paymentDemo(){joinNow()}
nav();render();total();tick();setInterval(tick,60000);