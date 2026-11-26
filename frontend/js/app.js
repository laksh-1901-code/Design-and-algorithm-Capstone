// SlotWise frontend: renders the UI, all solving is done by the Flask backend (/api/*)
const PAL=['#0f766e','#b45309','#be185d','#4f46e5','#047857','#9a3412','#6d28d9','#0e7490','#a16207','#86198f'];
const $=id=>document.getElementById(id);
const SAMPLE=`Anaya | PYTHON, STATS, ETHICS
Bhavya | JAVA, DS, NETWORKS
Charu | PYTHON, DS
Dev | ECONOMICS, STATS
Esha | ELECTRONICS, MICROPROC, DISCRETE
Farhan | JAVA, WEBTECH
Gauri | CHEMISTRY, ETHICS
Harsh | DS, DISCRETE, NETWORKS
Ira | WEBTECH, PYTHON
Jatin | ELECTRONICS, CHEMISTRY
Kavya | ECONOMICS, ETHICS, WEBTECH
Lakshya | MICROPROC, NETWORKS
Mihir | STATS, JAVA
Nisha | DISCRETE, PYTHON
Om | CHEMISTRY, MICROPROC
Pranav | ECONOMICS, DS
Riya | ELECTRONICS, JAVA
Sahil | NETWORKS, ETHICS
Tanvi | WEBTECH, STATS
Uday | DISCRETE, CHEMISTRY
Vani | PYTHON, ECONOMICS
Waqar | MICROPROC, WEBTECH`;
const TABS=[['data','Data'],['graph','Slot lanes'],['cal','Calendar'],['stu','Students'],['ana','Analysis'],['trace','Trace']];
let G=null,R=null;
$('nav').innerHTML=TABS.map(([k,l],i)=>`<button role="tab" data-k="${k}" aria-selected="${i===0}">${l}</button>`).join('');
$('nav').onclick=e=>{const k=e.target.dataset&&e.target.dataset.k;if(!k)return;
  TABS.forEach(([x])=>{$('t-'+x).hidden=x!==k;});
  [...$('nav').children].forEach(b=>b.setAttribute('aria-selected',b.dataset.k===k));};
const esc=s=>s.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const chip=(s,c)=>`<span class="chip" style="background:${PAL[c%PAL.length]}">${esc(s)}</span>`;
function dayDate(d){const x=new Date($('sd').value?$('sd').value+'T00:00':Date.now());
  const skip=()=>{while(x.getDay()===0||x.getDay()===6)x.setDate(x.getDate()+1);};skip();
  for(let i=0;i<d;i++){x.setDate(x.getDate()+1);skip();}return x;}
const TIMES={1:['10:00 AM'],2:['10:00 AM','2:00 PM'],3:['9:00 AM','12:30 PM','4:00 PM']};
const fmt=d=>d.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'});
function when(s){const spd=+$('spd').value;return fmt(dayDate(Math.floor(s/spd)))+', '+TIMES[spd][s%spd];}

async function api(path,body){
  const r=await fetch(path,body?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)}:undefined);
  const j=await r.json();if(!r.ok)throw new Error(j.error||'Server error');return j;
}
async function run(){
  $('err').textContent='';
  try{
    const j=await api('/api/solve',{data:$('data').value});
    G={subs:j.subjects,students:j.students,edges:j.edges,n:j.subjects.length};
    R={k:j.k,col:j.colors,nodes:j.nodes,ms:j.ms,aborted:j.aborted,clashes:j.clashes,gr:j.greedy,tries:j.tries,trace:j.trace};
    render();
  }catch(e){$('err').textContent=e.message;}
}
function render(){
  const bad=R.clashes;
  $('kpis').innerHTML=`<div class="kpi"><b>${R.k}</b><span>slots needed${R.aborted?' (greedy fallback)':''}</span></div>
  <div class="kpi"><b>${G.n}</b><span>subjects</span></div><div class="kpi"><b>${G.edges.length}</b><span>conflicts</span></div>
  <div class="kpi"><b>${G.students.length}</b><span>students</span></div><div class="kpi"><b>${R.nodes}</b><span>nodes · ${R.ms.toFixed(2)} ms</span></div>
  <div class="kpi"><b class="${bad?'bad':'ok'}">${bad}</b><span>clashes ${bad?'found':'(verified)'}</span></div>`;
  // lanes
  const groups=Array.from({length:R.k},(_,c)=>G.subs.map((_,i)=>i).filter(i=>R.col[i]===c));
  const mx=Math.max(...groups.map(g=>g.length)),W=900,LW=Math.min(150,(W-40)/R.k-10),H=90+mx*54,pos={};
  groups.forEach((g,c)=>{const x=20+(c+.5)*((W-40)/R.k);g.forEach((v,j)=>pos[v]=[x,80+j*54+(mx-g.length)*27]);});
  $('graph').innerHTML=`<svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Subjects arranged in lanes by exam slot">`+
   groups.map((g,c)=>{const x=20+(c+.5)*((W-40)/R.k);return `<rect x="${x-LW/2}" y="10" width="${LW}" height="${H-20}" rx="14" fill="${PAL[c%PAL.length]}" opacity=".12"/><text x="${x}" y="38" text-anchor="middle" font-weight="800" font-size="15" fill="${PAL[c%PAL.length]}">Slot ${c+1}</text><text x="${x}" y="56" text-anchor="middle" font-size="11" fill="var(--mut)">${when(c)}</text>`;}).join('')+
   G.edges.map(([a,b])=>{const[p,q]=[pos[a],pos[b]],mxp=(p[0]+q[0])/2,myp=(p[1]+q[1])/2-Math.abs(p[0]-q[0])*.12;return `<path d="M${p[0]} ${p[1]} Q${mxp} ${myp} ${q[0]} ${q[1]}" fill="none" stroke="var(--mut)" stroke-opacity=".35" stroke-width="1.3"/>`;}).join('')+
   G.subs.map((s,i)=>`<g><title>${esc(s)}</title><rect x="${pos[i][0]-44}" y="${pos[i][1]-14}" width="88" height="28" rx="14" fill="${PAL[R.col[i]%PAL.length]}"/><text x="${pos[i][0]}" y="${pos[i][1]+4}" text-anchor="middle" font-size="11" font-weight="700" fill="#fff">${esc(s.slice(0,10))}</text></g>`).join('')+`</svg>`;
  // calendar
  const spd=+$('spd').value,days=Math.ceil(R.k/spd);
  let h='<table class="cal"><tr><th></th>'+Array.from({length:days},(_,d)=>`<th>${fmt(dayDate(d))}</th>`).join('')+'</tr>';
  for(let s=0;s<spd;s++){h+=`<tr><th>${TIMES[spd][s]}</th>`;for(let d=0;d<days;d++){const c=d*spd+s;h+='<td>'+(c<R.k?G.subs.map((x,i)=>R.col[i]===c?chip(x,c):'').join(''):'<span class="note">—</span>')+'</td>';}h+='</tr>';}
  $('cal').innerHTML=h+'</table>';
  stu();
  // analysis
  $('cmp').innerHTML=`<table><tr><th></th><th>Backtracking</th><th>First-fit greedy</th></tr>
  <tr><td>Slots used</td><td><b>${R.k}</b></td><td><b>${R.gr.k}</b></td></tr>
  <tr><td>Work</td><td>${R.nodes} nodes</td><td>${R.gr.checks} checks</td></tr>
  <tr><td>Guarantee</td><td class="ok">Minimum${R.aborted?' (limit hit)':''}</td><td>${R.gr.k===R.k?'Matched here':'Not guaranteed'}</td></tr></table>
  <p class="note">Attempts: ${R.tries.map(t=>`k=${t.k} ${t.ok?'✓ solved':'✗ impossible'} (${t.nodes} nodes)`).join(' → ')}</p>`;
  // trace
  $('tracesub').textContent=`Showing the first ${R.trace.length} moves of the successful run with k = ${R.k}. Green = place subject in slot, red = backtrack.`;
  $('log').innerHTML=R.trace.map((e,i)=>e.t==='a'?`<div class="a">${i+1}. place ${esc(G.subs[e.v])} → slot ${e.c+1}</div>`:`<div class="b">${i+1}. dead end, undo ${esc(G.subs[e.v])} (slot ${e.c+1})</div>`).join('')||'<div>No moves recorded.</div>';
}
function stu(){
  if(!G)return;const q=$('q').value.trim().toLowerCase();
  const rows=G.students.filter(s=>s.name.toLowerCase().includes(q)).map(s=>`<tr><td><b>${esc(s.name)}</b></td><td>${s.subs.map(i=>[R.col[i],G.subs[i]]).sort((a,b)=>a[0]-b[0]).map(([c,n])=>`${chip(n,c)}<span class="note">${when(c)}</span><br>`).join('')}</td></tr>`).join('');
  $('stuout').innerHTML=`<table><tr><th>Student</th><th>Exams</th></tr>${rows||'<tr><td colspan="2" class="note">No match.</td></tr>'}</table>`;
}
async function bench(){
  const rows=await api('/api/benchmark');
  const top=Math.max(...rows.map(x=>x.nodes));
  $('benchout').innerHTML=rows.map(x=>`<div class="bar"><span style="width:90px">${x.n} subjects</span><div style="width:${Math.max(1,x.nodes/top*55)}%"></div><span>${x.nodes} nodes · ${x.k} slots (greedy ${x.greedy}) · ${x.ms.toFixed(2)} ms</span></div>`).join('');
}
$('gen').onclick=run;$('sample').onclick=()=>{$('data').value=SAMPLE;run();};
$('rand').onclick=async()=>{const j=await api('/api/random',{subjects:+$('rn').value||12,students:+$('rs').value||24});$('data').value=j.data;run();};
$('q').oninput=stu;$('bench').onclick=bench;$('spd').onchange=()=>G&&render();$('sd').onchange=()=>G&&render();
$('sd').value=new Date(Date.now()+864e5*10).toISOString().slice(0,10);
$('data').value=SAMPLE;run();
