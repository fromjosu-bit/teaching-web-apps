const $=s=>document.querySelector(s);
const storageKey='malnori-records-v1';
let records=[];
try{const saved=JSON.parse(localStorage.getItem(storageKey)||'[]');if(Array.isArray(saved))records=saved.filter(r=>r&&typeof r.name==='string'&&Number.isFinite(r.score)&&typeof r.date==='string').slice(0,100);}catch{}
let session=null;
const escapeHTML=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function renderCards(filter='all'){
 $('#game-grid').innerHTML=games.filter(g=>filter==='all'||g.category===filter).map(g=>{const i=games.indexOf(g);return `<article class="game-card"><div class="art art-${i}" aria-hidden="true"><span class="large">${g.art.replace('\n','<br>')}</span><span class="small">0${i+1} / ${g.tag}</span></div><div class="card-meta"><span>${g.tag}</span><span>5문제 · 약 2분</span></div><h3>${g.name}</h3><p>${g.desc.replace('\n','<br>')}</p><button data-game="${g.id}" aria-label="${g.name} 시작">놀러 가기 <span>↗</span></button></article>`}).join('');
}
function updateStats(){
 $('#home-rounds').textContent=records.length;
 $('#home-correct').textContent=records.reduce((a,r)=>a+r.score/20,0);
 $('#home-best').textContent=records.length?Math.max(...records.map(r=>r.score)): '—';
}
function shuffle(items){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
function startGame(id,daily=false){const game=games.find(g=>g.id===id);session={name:daily?'오늘의 도전':game.name,questions:daily?[game.questions[0],...shuffle(games.flatMap(g=>g.questions).filter(q=>q!==game.questions[0])).slice(0,4)]:shuffle(game.questions).slice(0,5),index:0,answers:[],locked:false};$('#play-category').textContent=(daily?'DAILY PLAY':game.tag)+' / 말놀이';renderQuestion();$('#play-dialog').showModal();}
function renderQuestion(){const q=session.questions[session.index];session.locked=false;$('#play-body').innerHTML=`<div class="progress"><span style="width:${session.index/5*100}%"></span></div><div class="question-meta"><span>${session.name}</span><span>${String(session.index+1).padStart(2,'0')} / 05</span></div><h2 id="play-title">${q[0]}</h2>${q[1]?`<p class="question-context">${q[1]}</p>`:''}<div class="answers">${q[2].map((a,i)=>`<button class="answer" data-answer="${i}"><span>${i+1}.</span> ${a}</button>`).join('')}</div><div id="feedback" aria-live="polite"></div>`;}
function answer(index){if(!session||session.locked)return;session.locked=true;const q=session.questions[session.index],correct=index===q[3];session.answers.push({question:q,selected:index,correct});document.querySelectorAll('.answer').forEach((b,i)=>{b.disabled=true;if(i===q[3])b.classList.add('correct');else if(i===index)b.classList.add('wrong');});$('#feedback').innerHTML=`<div class="feedback"><strong>${correct?'맞았어요. 정확한 한 끗!':'괜찮아요. 이제 내 말이 됐어요.'}</strong><p>${q[4]}</p></div><button class="next" id="next">${session.index===4?'결과 보기':'다음 문제'} →</button>`;$('#next').focus();}
function finish(){const score=session.answers.filter(a=>a.correct).length*20;records.unshift({name:session.name,score,date:new Date().toISOString()});records=records.slice(0,100);let saved=true;try{localStorage.setItem(storageKey,JSON.stringify(records));}catch{saved=false;}updateStats();$('#play-body').innerHTML=`<h2 id="play-title">${score===100?'빈틈없는 우리말 감각.':score>=60?'우리말과 조금 더 가까이.':'오늘, 새로운 말을 배웠어요.'}</h2><div class="result-score">${score}<small> / 100점</small></div><p>5문제 중 ${score/20}문제를 맞혔어요. ${saved?'기록을 이 브라우저에 저장했어요.':'브라우저 저장이 제한되어 이번 기록은 창을 닫으면 사라져요.'}</p>${session.answers.map(a=>`<div class="review">${a.correct?'○':'×'} ${a.question[0]}<br><span>정답: ${a.question[2][a.question[3]]} · ${a.question[4]}</span></div>`).join('')}<button class="next" id="finish-close">다른 게임 고르기 ↗</button>`;$('#finish-close').focus();}
$('#game-grid').addEventListener('click',e=>{const b=e.target.closest('[data-game]');if(b)startGame(b.dataset.game);});
document.querySelectorAll('[data-filter]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-filter]').forEach(c=>{c.classList.toggle('active',c===b);c.setAttribute('aria-pressed',String(c===b));});renderCards(b.dataset.filter);}));
$('#daily').addEventListener('click',()=>startGame('spelling',true));
$('#play-body').addEventListener('click',e=>{const b=e.target.closest('[data-answer]');if(b)answer(Number(b.dataset.answer));if(e.target.closest('#next')){session.index++;if(session.index===5)finish();else renderQuestion();}if(e.target.closest('#finish-close'))$('#play-dialog').close();});
$('#play-close').addEventListener('click',()=>$('#play-dialog').close());
document.addEventListener('keydown',e=>{if($('#play-dialog').open&&session&&!session.locked&&/^[1-3]$/.test(e.key)){const i=Number(e.key)-1;if(i<session.questions[session.index][2].length)answer(i);}});
function renderRecords(){ $('#record-body').innerHTML=records.length?`<p class="muted">최근 ${records.length}판의 기록 · 이 브라우저에 최대 100판 보관</p>`+records.map(r=>`<div class="record-row"><span>${escapeHTML(r.name)}<br><span class="muted">${escapeHTML(new Date(r.date).toLocaleDateString('ko-KR'))}</span></span><span>${r.score}점</span></div>`).join(''):'<p class="empty">아직 기록이 없어요.<br>첫 번째 말놀이를 시작해 보세요.</p>';$('#reset-record').disabled=!records.length;}
$('#record-open').addEventListener('click',()=>{renderRecords();$('#record-dialog').showModal();});
$('#record-close').addEventListener('click',()=>$('#record-dialog').close());
$('#reset-record').addEventListener('click',()=>{if(!confirm('이 브라우저에 저장된 모든 게임 기록을 삭제할까요?'))return;records=[];try{localStorage.removeItem(storageKey);}catch{}updateStats();renderRecords();});
renderCards();updateStats();
