/* «Цахим нүүдэлчин» — Сүлжээний лаборатори (Cisco Packet Tracer маягийн).
   NetLab.mount(el,{onSolve(id,pts),solved:{id:true},key}) · NetLab.TASKS */
(function(){
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const VW=1000,VH=620,WR=330; /* Wi-Fi хүрээ */
const DT={pc:{n:'Компьютер',i:'🖥️',ports:1,host:1},laptop:{n:'Зөөврийн',i:'💻',ports:0,host:1,wl:1},phone:{n:'Ухаалаг утас',i:'📱',ports:0,host:1,wl:1},server:{n:'Сервер',i:'🗄️',ports:1,host:1},printer:{n:'Хэвлэгч',i:'🖨️',ports:1,host:1},
 switch:{n:'Свич',i:'🔀',ports:8},router:{n:'Рөүтер',i:'⇄',ports:4},wifi:{n:'Wi-Fi рөүтер',i:'📶',ports:5},cloud:{n:'Интернэт',i:'☁️',ports:1}};
const PAL=['pc','laptop','phone','server','printer','switch','router','wifi','cloud'];
const NETH={'8.8.8.8':'google.com','1.1.1.1':'one.one.one.one','202.131.0.10':'news.mn'},DNS={'google.com':'8.8.8.8','www.google.com':'8.8.8.8','news.mn':'202.131.0.10','one.one.one.one':'1.1.1.1'};
const MASKS=['255.255.255.0','255.255.0.0','255.0.0.0','255.255.255.128'];
let root,O={},S,anim=null;
/* ---------- IP туслах ---------- */
const okIP=s=>/^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/.test(String(s||'').trim());
const n4=s=>String(s).trim().split('.').reduce((a,b)=>(a*256)+(+b),0)>>>0;
const s4=n=>[n>>>24,(n>>>16)&255,(n>>>8)&255,n&255].join('.');
const okMask=m=>{if(!okIP(m))return false;const v=n4(m);return v!==0&&((~v>>>0)&((~v>>>0)+1))===0};
const net=(ip,m)=>(n4(ip)&n4(m))>>>0;
const same=(a,b,m)=>okIP(a)&&okIP(b)&&okMask(m)&&net(a,m)===net(b,m);
/* ---------- Төлөв ---------- */
let uid=1;
function mk(t,x,y,o={}){const d={id:'d'+(uid++),t,x,y,name:o.name||autoName(t),ifs:[],gw:o.gw||'',dhcp:!!o.dhcp,log:[]};
 const D=DT[t];if(D.host)d.ifs=[{ip:o.ip||'',mask:o.mask||'255.255.255.0'}];
 if(t==='router')d.ifs=[0,1,2,3].map(i=>({ip:(o.ips||[])[i]||'',mask:'255.255.255.0',dhcpS:false}));
 if(t==='wifi'){d.lan={ip:'192.168.0.1',mask:'255.255.255.0'};d.dhcpS=true;d.ssid=o.ssid||'Manai_WiFi';d.wan={ip:'',mask:'255.255.255.0'}}
 if(t==='cloud')d.ifs=[{ip:'203.0.113.1',mask:'255.255.255.0'}];
 if(t==='server'){d.share=o.share??true;d.folder='Hicheel';d.perm='Read'}
 return d}
function autoName(t){const base={pc:'PC',laptop:'Laptop',phone:'Phone',server:'Server',printer:'Printer',switch:'Switch',router:'Router',wifi:'WiFi',cloud:'Internet'}[t];let i=1;while(S&&S.devs.some(d=>d.name===base+i))i++;return base+i}
function fresh(){return {devs:[],links:[],tool:'sel',cable:'utp',sel:null,from:null,msg:'',done:{},ev:{},jobs:[]}}
const PRE={
 lab:()=>{const s=fresh();S=s;const sw=mk('switch',500,180);s.devs.push(sw);[[170,430],[390,470],[610,470],[830,430]].forEach(([x,y],i)=>s.devs.push(mk('pc',x,y,{name:'PC'+(i+1)})));s.devs.slice(1).forEach((d,i)=>s.links.push({a:[sw.id,i],b:[d.id,0],k:'utp'}));s.msg='Сургуулийн лаборатори: свич + 4 компьютер. Компьютер бүрт IP хаяг өгөөд ping хийгээрэй.';return s},
 home:()=>{const s=fresh();S=s;const w=mk('wifi',500,330),c=mk('cloud',500,80);s.devs.push(c,w,mk('laptop',260,480,{dhcp:true}),mk('phone',720,500,{dhcp:true}),mk('pc',850,300,{dhcp:true}));s.links.push({a:[c.id,0],b:[w.id,0],k:'fiber'},{a:[w.id,1],b:[s.devs[4].id,0],k:'utp'});s.msg='Гэрийн сүлжээ: Интернэт → Wi-Fi рөүтер → төхөөрөмжүүд. Laptop1 сонгоод «ping 8.8.8.8» гэж бичээрэй.';return s},
 two:()=>{const s=fresh();S=s;const r=mk('router',500,110,{ips:['192.168.1.1','192.168.2.1']}),a=mk('switch',250,290),b=mk('switch',750,290);s.devs.push(r,a,b,mk('pc',130,480,{name:'A1',ip:'192.168.1.11'}),mk('pc',330,500,{name:'A2',ip:'192.168.1.12'}),mk('pc',670,500,{name:'B1',ip:'192.168.2.21'}),mk('pc',870,480,{name:'B2',ip:'192.168.2.22'}));
  s.links.push({a:[r.id,0],b:[a.id,0],k:'utp'},{a:[r.id,1],b:[b.id,0],k:'utp'},{a:[a.id,1],b:[s.devs[3].id,0],k:'utp'},{a:[a.id,2],b:[s.devs[4].id,0],k:'utp'},{a:[b.id,1],b:[s.devs[5].id,0],k:'utp'},{a:[b.id,2],b:[s.devs[6].id,0],k:'utp'});
  s.msg='Хоёр анги: 192.168.1.0 ба 192.168.2.0 сүлжээ рөүтероор холбогдсон. A1-ээс B1 рүү ping хийхэд яагаад болохгүй байна? Gateway-г тохируулаарай!';return s}};
/* ---------- Сүлжээний загвар ---------- */
const dev=id=>S.devs.find(d=>d.id===id);
const linkAt=(id,p)=>S.links.find(l=>(l.a[0]===id&&l.a[1]===p)||(l.b[0]===id&&l.b[1]===p));
const peer=(l,id,p)=>l.a[0]===id&&l.a[1]===p?l.b:l.a;
const freePort=(d,pref)=>{const D=DT[d.t];const idx=[...Array(D.ports).keys()];const order=d.t==='wifi'?(pref==='wan'?[0]:[1,2,3,4]):idx;return order.find(p=>!linkAt(d.id,p))};
const dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function apOf(d){if(!DT[d.t].wl)return null;let best=null,bd=1e9;S.devs.filter(w=>w.t==='wifi').forEach(w=>{const k=dist(w,d);if(k<=WR&&k<bd){bd=k;best=w}});return best}
/* L2 зангилаа: "id:port" · Wi-Fi-ийн LAN тал "id:L" · утасгүй клиент "id:w" */
function nbrs(node){const [id,p]=node.split(':'),d=dev(id);if(!d)return [];const out=[];
 if(p==='w'){const ap=apOf(d);if(ap)out.push(ap.id+':L');return out}
 if(p==='L'){[1,2,3,4].forEach(q=>out.push(id+':'+q));S.devs.filter(c=>DT[c.t].wl&&apOf(c)===d).forEach(c=>out.push(c.id+':w'));return out}
 const pi=+p,l=linkAt(id,pi);if(l){const q=peer(l,id,pi);out.push(q[0]+':'+q[1])}
 if(d.t==='switch')for(let i=0;i<8;i++)if(i!==pi)out.push(id+':'+i);
 if(d.t==='wifi'&&pi>=1)out.push(id+':L');
 return out}
function isEnd(node){const [id,p]=node.split(':'),d=dev(id);if(!d)return false;if(d.t==='switch')return false;if(d.t==='wifi')return p==='L'||p==='0';return true}
function ifOf(node){const [id,p]=node.split(':'),d=dev(id);if(d.t==='wifi')return p==='L'?d.lan:d.wan;if(DT[d.t].host)return d.ifs[0];return d.ifs[+p]||d.ifs[0]}
function hostNode(d){return DT[d.t].wl?d.id+':w':d.id+':0'}
function seg(start){const seen=new Map([[start,null]]),q=[start],ends=[];while(q.length){const n=q.shift();if(n!==start&&isEnd(n)){ends.push(n);if(!n.endsWith(':L'))continue}for(const m of nbrs(n))if(!seen.has(m)){seen.set(m,n);q.push(m)}}
 return {ends,par:seen}}
function l2path(sg,from,to){const out=[];let n=to;while(n){out.unshift(n.split(':')[0]);n=sg.par.get(n)}return out.filter((x,i)=>x!==out[i-1])}
/* DHCP */
function dhcp(){S.devs.filter(d=>d.t==='wifi').forEach(w=>{const sg=seg(w.id+':0');const c=sg.ends.find(e=>dev(e.split(':')[0]).t==='cloud');if(c){const used=new Set(S.devs.filter(x=>x.t==='wifi'&&x!==w).map(x=>x.wan.ip));let k=10;while(used.has('203.0.113.'+k))k++;w.wan={ip:'203.0.113.'+k,mask:'255.255.255.0',gw:'203.0.113.1'}}else w.wan={ip:'',mask:'255.255.255.0'}});
 const pools={};S.devs.filter(d=>DT[d.t].host&&d.dhcp).forEach(d=>{const n=hostNode(d);if(DT[d.t].wl&&!apOf(d)){d.ifs[0].ip='';d.gw='';d.apipa=false;return}
  const sg=seg(n);let srv=null;for(const e of sg.ends){const [id,p]=e.split(':'),x=dev(id);if(x.t==='wifi'&&p==='L'&&x.dhcpS){srv={key:e,i:x.lan};break}if(x.t==='router'&&x.ifs[+p].dhcpS&&okIP(x.ifs[+p].ip)){srv={key:e,i:x.ifs[+p]};break}}
  if(!srv){d.ifs[0].ip='169.254.'+(10+(+d.id.slice(1))%200)+'.'+(20+(+d.id.slice(1))%200);d.ifs[0].mask='255.255.0.0';d.gw='';d.apipa=true;return}
  const P=pools[srv.key]??=new Set(S.devs.filter(x=>DT[x.t].host&&!x.dhcp).map(x=>x.ifs[0].ip));let k=100;const base=net(srv.i.ip,srv.i.mask);
  while(P.has(s4(base+k))||s4(base+k)===srv.i.ip)k++;P.add(s4(base+k));d.ifs[0].ip=s4(base+k);d.ifs[0].mask=srv.i.mask;d.gw=srv.i.ip;d.apipa=false})}
/* ---------- Чиглүүлэлт ---------- */
function l3ifs(d){if(d.t==='router')return d.ifs.map((f,i)=>({node:d.id+':'+i,f})).filter(x=>linkAt(d.id,+x.node.split(':')[1]));
 if(d.t==='wifi')return [{node:d.id+':L',f:d.lan},{node:d.id+':0',f:d.wan}].filter(x=>okIP(x.f.ip));if(d.t==='cloud')return [{node:d.id+':0',f:d.ifs[0]}];return []}
function findHost(sg,ip){return sg.ends.find(e=>{const f=ifOf(e);return f&&f.ip===ip})}
function route(src,dstIP){/* src: хост төхөөрөмж. Буцаах: {ok,path,err,hops} */
 const f=src.ifs[0],n0=hostNode(src);
 if(DT[src.t].wl&&!apOf(src))return {ok:false,err:'nowifi',path:[src.id]};
 if(!okIP(f.ip))return {ok:false,err:'noip',path:[src.id]};
 if(DT[src.t].ports&&!linkAt(src.id,0))return {ok:false,err:'nocable',path:[src.id]};
 const sg=seg(n0);
 if(same(f.ip,dstIP,f.mask)){if(f.ip===dstIP)return {ok:true,path:[src.id],hops:[]};const h=findHost(sg,dstIP);if(h){const t=ifOf(h);return same(t.ip,f.ip,t.mask)?{ok:true,path:l2path(sg,n0,h),hops:[],dst:h.split(':')[0]}:{ok:false,err:'mask',path:l2path(sg,n0,h)}}
  if(src.apipa)return {ok:false,err:'apipa',path:[src.id]};return {ok:false,err:'nohost',path:[src.id]}}
 if(!okIP(src.gw))return {ok:false,err:src.apipa?'apipa':'nogw',path:[src.id]};
 if(!same(src.gw,f.ip,f.mask))return {ok:false,err:'gwsub',path:[src.id]};
 const g=sg.ends.find(e=>{const x=dev(e.split(':')[0]);return !DT[x.t].host&&ifOf(e).ip===src.gw});
 if(!g)return {ok:false,err:'gwnf',path:[src.id]};
 let path=l2path(sg,n0,g),hops=[src.gw];const R0=dev(g.split(':')[0]);
 const seen=new Set([R0.id]),q=[{R:R0,path,hops}];
 while(q.length){const {R,path,hops}=q.shift();
  if(R.t==='cloud'&&NETH[dstIP])return {ok:true,path:[...path],hops,dst:R.id,inet:true};
  for(const I of l3ifs(R)){if(!okIP(I.f.ip))continue;
   if(I.f.ip===dstIP)return {ok:true,path,hops,dst:R.id};
   if(same(I.f.ip,dstIP,I.f.mask)){const s2=seg(I.node),h=findHost(s2,dstIP);if(h)return {ok:true,path:[...path,...l2path(s2,I.node,h).slice(1)],hops,dst:h.split(':')[0]};}
   const s2=seg(I.node);for(const e of s2.ends){const x=dev(e.split(':')[0]);if(DT[x.t].host||seen.has(x.id))continue;const fx=ifOf(e);if(!okIP(fx.ip)||!same(fx.ip,I.f.ip,I.f.mask))continue;seen.add(x.id);q.push({R:x,path:[...path,...l2path(s2,I.node,e).slice(1)],hops:[...hops,fx.ip]})}}}
 return {ok:false,err:NETH[dstIP]?'noinet':'noroute',path}}
function ping(src,dst){const r=route(src,dst);if(!r.ok)return r;const D=r.dst&&dev(r.dst);if(D&&DT[D.t].host&&D!==src){const back=route(D,src.ifs[0].ip);if(!back.ok)return {ok:false,err:'noreply',path:r.path,back:back.err,dname:D.name}}return r}
const ERR={noip:'IP хаяг тохируулаагүй байна.',nocable:'Кабель залгаагүй байна.',nowifi:'Wi-Fi-д холбогдоогүй — Wi-Fi рөүтерт ойртуулна уу (хүрээ доторх тасархай тойрог).',mask:'Subnet mask таарахгүй байна.',nohost:'Ийм IP хаягтай төхөөрөмж энэ сүлжээнд алга.',nogw:'Өөр сүлжээний хаяг байна — Default Gateway (рөүтерийн хаяг)-ийг тохируулаагүй.',gwsub:'Gateway нь өөрийн сүлжээнд биш байна.',gwnf:'Gateway хаягтай рөүтер энэ сүлжээнд олдсонгүй.',noroute:'Рөүтер очих сүлжээг олсонгүй.',noinet:'Интернэтэд холбогдоогүй — рөүтерээ ☁️ Интернэттэй холбоно уу.',apipa:'DHCP серверээс IP авч чадсангүй (169.254.x.x). Рөүтерийн DHCP-г асаах эсвэл кабелиа шалгана уу.',noreply:'Хариу ирсэнгүй — хүлээн авагч тал буцах замаа олсонгүй (түүний Gateway-г шалга).'};
function dupIP(){const m={};S.devs.forEach(d=>{if(DT[d.t].host&&okIP(d.ifs[0].ip)&&!d.apipa)(m[d.ifs[0].ip]??=[]).push(d.name)});return Object.entries(m).filter(([k,v])=>v.length>1)}
/* ---------- Даалгавар ---------- */
const TASKS=[
 {id:'n1',lv:1,t:'Од топологи: нэг свичид 4 ба түүнээс дээш төхөөрөмж (компьютер, сервер, хэвлэгч) кабелиар холбо.',hint:'🔀 Свич, 🖥️ Компьютер нэмээд 🔌 Холбох хэрэгслээр компьютер бүрийг свичтэй холбо.',chk:()=>!!S.ev.built&&S.devs.some(sw=>sw.t==='switch'&&[...Array(8).keys()].filter(p=>{const l=linkAt(sw.id,p);return l&&DT[dev(peer(l,sw.id,p)[0]).t].host}).length>=4)},
 {id:'n2',lv:2,t:'Хоёр компьютерт ижил сүлжээний статик IP хаяг (жишээ: 192.168.1.10, 192.168.1.11) өгөөд хооронд нь ping амжилттай хий.',hint:'Компьютер дээр дарж IP, Subnet mask оруулна. Дараа нь Command Prompt-д: ping 192.168.1.11',chk:()=>!!S.ev.pingLocal},
 {id:'n3',lv:2,t:'Хэвлэгч хуваалцах: хэвлэгчид IP өгч, компьютероос «🖨 Хэвлэх» тушаалаар амжилттай хэвлүүл.',hint:'Хэвлэгчийг свичид холбож IP өг. Компьютерын Command Prompt-д: print 192.168.1.50',chk:()=>!!S.ev.print},
 {id:'n4',lv:2,t:'Файл сервер: серверт хавтас хуваалцаж (зөвхөн унших эрх), компьютероос \\\\IP гэж хандаж нээ.',hint:'Серверийн тохиргоонд «Хавтас хуваалцах»-ыг асаа. Компьютерт: \\\\192.168.1.20',chk:()=>!!S.ev.share},
 {id:'n5',lv:3,t:'Гэрийн Wi-Fi: Wi-Fi рөүтерт 2 утасгүй төхөөрөмж (зөөврийн, утас) холбож DHCP-ээр IP аваад хооронд нь ping хий.',hint:'📶 Wi-Fi рөүтерийн тойрог дотор 💻, 📱 байрлуул. DHCP автоматаар IP өгнө. Нэгнийх нь Command Prompt-д нөгөөгийн IP-г ping хий.',chk:()=>!!S.ev.pingWifi},
 {id:'n6',lv:3,t:'Хоёр сүлжээг рөүтероор холбо: 192.168.1.0 ба 192.168.2.0 сүлжээний компьютерууд Gateway-ээр дамжин ping хийнэ.',hint:'«Хоёр анги» жишээг нээ. Компьютер бүрийн Default Gateway-д рөүтерийн өөрийн сүлжээн дэх хаягийг (192.168.1.1 г.м.) бич.',chk:()=>!!S.ev.pingRouted},
 {id:'n7',lv:3,t:'Интернэт: рөүтерээ ☁️ Интернэттэй холбож, компьютер эсвэл утаснаас «ping google.com» амжилттай хий.',hint:'«Гэрийн Wi-Fi» жишээ эсвэл өөрөө: ☁️ — 📶 холбоод төхөөрөмжөөсөө ping google.com',chk:()=>!!S.ev.inet}];
const PTS=[0,2,3,5];
function check(){let any=false;TASKS.forEach(t=>{if(!S.done[t.id]&&t.chk()){S.done[t.id]=1;any=true;const sv=O.solved||{};if(!sv[t.id]&&O.onSolve)O.onSolve(t.id,PTS[t.lv]);toast(`🎯 Даалгавар биеллээ: ${t.t.split(':')[0]}`)}});return any}
let tt=0;function toast(m){const e=root.querySelector('.nl-toast');if(!e)return;e.textContent=m;e.classList.add('on');clearTimeout(tt);tt=setTimeout(()=>e.classList.remove('on'),2600)}
/* ---------- Хадгалалт ---------- */
const KEY=()=>O.key||'n9_netlab';
function persist(){try{localStorage.setItem(KEY(),JSON.stringify({devs:S.devs.map(d=>({...d,log:d.log.slice(-60)})),links:S.links,done:S.done,ev:S.ev,cable:S.cable,uid}))}catch(e){}}
function restore(){try{const j=JSON.parse(localStorage.getItem(KEY())||'null');if(j&&j.devs){S=fresh();Object.assign(S,j);uid=j.uid||100;return true}}catch(e){}return false}
/* ---------- Зураг ---------- */
const ipOf=d=>DT[d.t].host?(d.ifs[0].ip||''):d.t==='wifi'?d.lan.ip:d.t==='cloud'?'Интернэт':d.t==='router'?d.ifs.filter(f=>f.ip).map(f=>f.ip).join(' · '):'';
const pos=(d,p)=>{if(d.t==='switch'||d.t==='router'||d.t==='wifi'){/* портын байрлал */return {x:d.x,y:d.y}}return {x:d.x,y:d.y}};
function svg(){const sel=S.sel&&dev(S.sel),Z=(root&&root.clientWidth||1000)<700?1.9:1;
 const wl=S.devs.filter(d=>DT[d.t].wl).map(d=>{const ap=apOf(d);return ap?`<line x1="${ap.x}" y1="${ap.y}" x2="${d.x}" y2="${d.y}" class="nl-wl"/>`:''}).join('');
 const rng=S.devs.filter(d=>d.t==='wifi').map(w=>`<circle cx="${w.x}" cy="${w.y}" r="${WR}" class="nl-rng ${sel===w?'on':''}"/>`).join('');
 const ls=S.links.map((l,i)=>{const A=dev(l.a[0]),B=dev(l.b[0]);if(!A||!B)return '';const la=A.t==='wifi'?(l.a[1]===0?'WAN':'LAN'+l.a[1]):A.t==='router'?'Gi0/'+l.a[1]:A.t==='switch'?'Fa'+l.a[1]:'',lb=B.t==='wifi'?(l.b[1]===0?'WAN':'LAN'+l.b[1]):B.t==='router'?'Gi0/'+l.b[1]:B.t==='switch'?'Fa'+l.b[1]:'';
  const dx=B.x-A.x,dy=B.y-A.y,L=Math.hypot(dx,dy)||1,ux=dx/L,uy=dy/L;
  return `<g data-l="${i}"><line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" class="nl-ln ${l.k}"/><line x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}" class="nl-hit"/><circle cx="${A.x+ux*46*Z}" cy="${A.y+uy*46*Z}" r="${6*Z}" class="nl-led"/><circle cx="${B.x-ux*46*Z}" cy="${B.y-uy*46*Z}" r="${6*Z}" class="nl-led"/>${la&&(S.sel===A.id)?`<text x="${A.x+ux*70}" y="${A.y+uy*70-8}" class="nl-pt" style="font-size:${15*Z}px">${la}</text>`:''}${lb&&(S.sel===B.id)?`<text x="${B.x-ux*70}" y="${B.y-uy*70-8}" class="nl-pt" style="font-size:${15*Z}px">${lb}</text>`:''}</g>`}).join('');
 const ds=S.devs.map(d=>`<g class="nl-dev ${S.sel===d.id?'sel':''} ${S.from===d.id?'from':''}" data-d="${d.id}" transform="translate(${d.x} ${d.y}) scale(${Z})"><rect x="-40" y="-36" width="80" height="72" rx="16" class="nl-box t-${d.t}"/>${d.t==="router"?`<circle cy="-2" r="24" fill="#2b6e4f"/><text y="9" class="nl-rt">⇄</text>`:`<text y="10" class="nl-ico">${DT[d.t].i}</text>`}<text y="56" class="nl-nm">${esc(d.name)}</text><text y="76" class="nl-ip">${esc(ipOf(d))}${d.apipa?' ⚠':''}</text></g>`).join('');
 return `<svg class="nl-svg" viewBox="0 0 ${VW} ${VH}" role="img" aria-label="Сүлжээний бүдүүвч"><defs><pattern id="nlg" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0V40" fill="none" stroke="#e8e2d2" stroke-width="1"/></pattern></defs><rect width="${VW}" height="${VH}" fill="url(#nlg)" class="nl-bg"/>${rng}${wl}${ls}${ds}<g class="nl-pkt" style="display:none"><g transform="scale(${Z})"><circle r="17"/><text y="7">✉️</text></g></g></svg>`}
/* ---------- Тохиргооны самбар ---------- */
const fld=(l,k,v,ph,dis)=>`<label>${l}<input data-f="${k}" value="${esc(v)}" placeholder="${ph||''}" ${dis?'disabled':''} inputmode="decimal" autocomplete="off"></label>`;
const mSel=(k,v,dis)=>`<label>Subnet mask<select data-f="${k}" ${dis?'disabled':''}>${[...new Set([v||'255.255.255.0',...MASKS])].map(m=>`<option ${m===v?'selected':''}>${m}</option>`).join('')}</select></label>`;
function panel(){const d=S.sel&&dev(S.sel);if(!d)return `<div class="nl-pn nl-empty"><b>Төхөөрөмж сонгоогүй байна</b><p>Төхөөрөмж дээр дарж тохиргоог нь харна. Доорх самбараас төхөөрөмж сонгоод ажлын талбарт дарж байрлуулна.</p></div>`;
 const D=DT[d.t];let h=`<div class="nl-pn"><div class="nl-ph"><span>${D.i}</span><div><b>${esc(D.n)}</b><label class="nl-nmf">Нэр<input data-f="name" value="${esc(d.name)}" maxlength="16"></label></div><button class="nl-x" data-a="close" aria-label="Хаах">✕</button></div>`;
 if(D.host){const ap=D.wl?apOf(d):null;
  h+=D.wl?`<p class="nl-st ${ap?'ok':'bad'}">${ap?`📶 «${esc(ap.ssid)}» Wi-Fi-д холбогдсон`:'📵 Wi-Fi олдсонгүй — Wi-Fi рөүтерийн тойрог дотор зөө'}</p>`:`<p class="nl-st ${linkAt(d.id,0)?'ok':'bad'}">${linkAt(d.id,0)?'🔌 Кабель залгаатай':'🔌 Кабель залгаагүй'}</p>`;
  if(d.t!=='printer')h+=`<div class="nl-seg"><button class="${d.dhcp?'':'on'}" data-a="static">Статик</button><button class="${d.dhcp?'on':''}" data-a="dhcpc">DHCP (автомат)</button></div>`;
  h+=fld('IP хаяг','ip',d.ifs[0].ip,'192.168.1.10',d.dhcp)+mSel('mask',d.ifs[0].mask,d.dhcp)+(d.t!=='printer'?fld('Default Gateway','gw',d.gw,'192.168.1.1',d.dhcp):'');
  if(d.apipa)h+=`<p class="nl-st bad">⚠️ 169.254.x.x — DHCP серверээс хаяг аваагүй байна.</p>`;
  if(d.t==='server')h+=`<div class="nl-box2"><label class="nl-chk"><input type="checkbox" data-f="share" ${d.share?'checked':''}> 📁 Хавтас хуваалцах (Share)</label>${fld('Хавтасны нэр','folder',d.folder)}<label>Эрх<select data-f="perm">${[['Read','Read — зөвхөн унших'],['Change','Change — өөрчлөх'],['Full Control','Full Control — бүх эрх']].map(([k,t])=>`<option value="${k}" ${d.perm===k?'selected':''}>${t}</option>`).join('')}</select></label></div>`}
 if(d.t==='router')h+=d.ifs.map((f,i)=>`<div class="nl-box2"><b>Gi0/${i} ${linkAt(d.id,i)?'🟢':'⚪'}</b>${fld('IP хаяг','r'+i,f.ip,i?'192.168.'+(i+1)+'.1':'192.168.1.1')}${mSel('rm'+i,f.mask)}<label class="nl-chk"><input type="checkbox" data-f="rd${i}" ${f.dhcpS?'checked':''}> DHCP сервер</label></div>`).join('');
 if(d.t==='wifi')h+=`${fld('Wi-Fi нэр (SSID)','ssid',d.ssid)}<div class="nl-box2"><b>LAN (дотоод)</b>${fld('Рөүтерийн хаяг','lanip',d.lan.ip)}${mSel('lanm',d.lan.mask)}<label class="nl-chk"><input type="checkbox" data-f="dhcpS" ${d.dhcpS?'checked':''}> DHCP сервер — төхөөрөмжүүдэд IP автоматаар өгөх</label></div><div class="nl-box2"><b>WAN (Интернэт тал)</b><p>${d.wan.ip?`🟢 ${d.wan.ip} (Интернэт үйлчилгээ үзүүлэгчээс)`:'⚪ Интернэттэй холбогдоогүй'}</p></div><p class="nl-tip">Холбогдсон утасгүй төхөөрөмж: <b>${S.devs.filter(c=>DT[c.t].wl&&apOf(c)===d).length}</b></p>`;
 if(d.t==='switch')h+=`<p class="nl-tip">Свич нь IP хаяггүй. Нэг сүлжээний төхөөрөмжүүдийг хооронд нь холбож, мэдээллийг зөвхөн хүлээн авагчид нь дамжуулна.</p><div class="nl-ports">${[...Array(8).keys()].map(p=>{const l=linkAt(d.id,p);return `<span class="${l?'on':''}">Fa${p}${l?' → '+esc(dev(peer(l,d.id,p)[0]).name):''}</span>`}).join('')}</div>`;
 if(d.t==='cloud')h+=`<p class="nl-tip">☁️ Интернэт үйлчилгээ үзүүлэгч (ISP). Холбогдсон рөүтерт WAN хаяг өгнө. Доторх серверүүд: <b>google.com</b> (8.8.8.8), <b>news.mn</b>, 1.1.1.1.</p>`;
 if(D.host)h+=`<button class="nl-b" data-a="cmd">⌨️ Command Prompt</button>`;
 return h+`<button class="nl-b ghost red" data-a="deldev">🗑 Устгах</button></div>`}
/* ---------- Командын мөр ---------- */
function cmdBox(){const d=S.sel&&dev(S.sel);if(!d||!DT[d.t].host||!S.cmd)return '';
 return `<div class="nl-cmd"><div class="nl-ch">⌨️ ${esc(d.name)} — Command Prompt <button data-a="cmdx">✕</button></div><pre class="nl-out">${esc(d.log.join('\n'))||'Microsoft Windows [Version 10]\n«help» гэж бичвэл тушаалуудыг харна.\n'}</pre>
 <div class="nl-cin"><span>C:\\&gt;</span><input data-a="cmdin" placeholder="ping 192.168.1.11" autocapitalize="off" autocomplete="off" spellcheck="false" enterkeyhint="send"><button data-a="cmdgo">↵</button></div>
 <div class="nl-qk">${['ipconfig','ipconfig /renew','ping ','tracert ','print ','\\\\','help','cls'].map(c=>`<button data-q="${esc(c)}">${esc(c.trim()||c)}</button>`).join('')}</div></div>`}
async function runCmd(d,line){line=line.trim();if(!line)return;const L=d.log;L.push('C:\\>'+line);const [c0,...rest]=line.split(/\s+/);const c=c0.toLowerCase(),arg=rest.join(' ');
 const f=d.ifs[0];const out=s=>L.push(s);const upd=()=>{const o=root.querySelector('.nl-out');if(o){o.textContent=L.join('\n');o.scrollTop=1e9}};
 if(c==='cls'){d.log=[];return}
 if(c==='help'){out('  ipconfig          — өөрийн IP хаягийг харах\n  ipconfig /renew   — DHCP-ээс шинээр хаяг авах\n  ping <IP|нэр>     — холболт шалгах (ping google.com)\n  tracert <IP>      — замын рөүтерүүдийг харах\n  print <IP>        — сүлжээний хэвлэгчээр хэвлэх\n  \\\\<IP>             — хуваалцсан хавтас нээх\n  cls               — дэлгэц цэвэрлэх');return}
 if(c==='ipconfig'){if(arg==='/renew'){dhcp();out(d.dhcp?(d.apipa?'⚠️ DHCP сервер олдсонгүй.':'DHCP-ээс шинэ хаяг авлаа.'):'Энэ төхөөрөмж статик IP-тэй (DHCP биш).')}
  out(`\n${DT[d.t].wl?'Wireless LAN adapter Wi-Fi':'Ethernet adapter Ethernet'}:\n   ${DT[d.t].wl&&!apOf(d)?'Media State . . . . . : Media disconnected':`IPv4 Address. . . . . : ${f.ip||'(байхгүй)'}${d.apipa?' (Autoconfiguration)':''}\n   Subnet Mask . . . . . : ${f.mask}\n   Default Gateway . . . : ${d.gw}${d.dhcp?'\n   DHCP Enabled. . . . . : Yes':''}`}\n`);return}
 if(c==='ping'||c==='tracert'){let ip=arg.toLowerCase();if(!ip)return out('Хэрэглээ: ping 192.168.1.11');if(!okIP(ip)){const r=DNS[ip];if(!r){const h=S.devs.find(x=>x.name.toLowerCase()===ip&&DT[x.t].host);if(h&&okIP(h.ifs[0].ip))ip=h.ifs[0].ip;else return out(`Ping request could not find host ${arg}. Нэрийг шалгана уу.`)}else{const t=route(d,r);if(!t.ok)return out(`Ping request could not find host ${arg}.\n💡 ${ERR[t.err]||'DNS сервер рүү хүрсэнгүй.'}`);ip=r}}
  if(c==='tracert'){const r=route(d,ip);out(`\nTracing route to ${ip}:`);(r.hops||[]).forEach((h,i)=>out(`  ${i+1}    1 ms    1 ms    1 ms  ${h}`));out(r.ok?`  ${(r.hops||[]).length+1}    1 ms    2 ms    1 ms  ${ip}\nTrace complete.`:`  *  Request timed out.\n💡 ${ERR[r.err]}`);await fly(r);upd();return}
  out(`\nPinging ${ip}${NETH[ip]?` [${NETH[ip]}]`:''} with 32 bytes of data:`);upd();const r=ping(d,ip);await fly(r);
  if(r.ok){const t=r.inet?24:r.hops.length?2:1;for(let i=0;i<4;i++)out(`Reply from ${ip}: bytes=32 time=${t+(i%2)}ms TTL=${r.inet?117:128-r.hops.length}`);out(`\nPing statistics for ${ip}:\n    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss)`);
   const D=r.dst&&dev(r.dst);if(r.inet)S.ev.inet=1;else if(D&&D!==d&&DT[D.t].host){if(r.hops.length)S.ev.pingRouted=1;else if(!d.dhcp&&!D.dhcp)S.ev.pingLocal=1;if(DT[d.t].wl&&DT[D.t].wl&&d.dhcp&&D.dhcp)S.ev.pingWifi=1;if(r.hops.length===0&&!d.dhcp&&!D.dhcp)S.ev.pingLocal=1}}
  else{const un=['nogw','gwnf','noroute','nohost','gwsub','noinet'].includes(r.err);for(let i=0;i<4;i++)out(un&&r.err!=='nohost'?`Reply from ${f.ip||'0.0.0.0'}: Destination host unreachable.`:'Request timed out.');out(`\nPing statistics for ${ip}:\n    Packets: Sent = 4, Received = 0, Lost = 4 (100% loss)\n💡 ${r.err==='noreply'?`${esc(r.dname)}: ${ERR[r.back]||''} ${ERR.noreply}`:ERR[r.err]}`)}
  dupIP().forEach(([ip2,ns])=>out(`⚠️ IP хаяг давхардсан: ${ip2} (${ns.join(', ')}) — хаяг бүр өөр байх ёстой!`));return}
 if(c==='print'||c.startsWith('\\\\')||c==='net'){const ip=(c.startsWith('\\\\')?c.slice(2):c==='net'?arg.replace(/^view\s+/i,'').replace(/^\\\\/,''):arg).replace(/\\.*$/,'');if(!okIP(ip))return out('Хэрэглээ: print 192.168.1.50   эсвэл   \\\\192.168.1.20');
  const r=ping(d,ip);r.mail=c==='print'?'🖨':'📁';await fly(r);if(!r.ok)return out(`⚠️ ${ip} рүү хүрсэнгүй.\n💡 ${r.err==='noreply'?ERR.noreply:ERR[r.err]}`);const D=dev(r.dst);
  if(c==='print'){if(D.t!=='printer')return out(`⚠️ ${ip} бол хэвлэгч биш (${DT[D.t].n}).`);out(`🖨 «${D.name}» хэвлэгч рүү баримт илгээлээ… Хэвлэгдлээ! ✅`);S.ev.print=1;return}
  if(D.t!=='server'&&D.t!=='pc')return out(`⚠️ ${ip}-д хуваалцсан хавтас алга.`);if(!D.share)return out(`⚠️ \\\\${ip} — хандах боломжгүй. Тухайн компьютерт хавтас хуваалцаагүй (Share) байна.`);
  out(`\n📁 \\\\${ip}\\${D.folder}   [эрх: ${D.perm}]\n   Даалгавар.docx      24 KB\n   Хуваарь.xlsx        12 KB\n   Зураг\\              <DIR>\n${D.perm==='Read'?'✅ Унших эрх — файлыг нээж, хуулж авч болно, өөрчлөх боломжгүй (хамгийн аюулгүй).':'⚠️ '+D.perm+' эрх — бусад хүн файл устгаж, өөрчилж чадна. Шаардлагагүй бол Read эрх өг.'}`);S.ev.share=1;return}
 out(`'${c0}' гэсэн тушаал танигдсангүй. «help» гэж бичнэ үү.`)}
/* ---------- Пакетийн хөдөлгөөн ---------- */
function fly(r){return new Promise(res=>{const svgE=root.querySelector('.nl-svg'),pk=svgE&&svgE.querySelector('.nl-pkt');const path=(r.path||[]).map(dev).filter(Boolean);
 if(!pk||path.length<1){res();return}pk.style.display='';pk.querySelector('text').textContent=r.mail||'✉️';pk.classList.remove('bad','ok');let i=0;const step=()=>{if(!root.isConnected)return res();
  if(i>=path.length-1){pk.classList.add(r.ok?'ok':'bad');pk.querySelector('text').textContent=r.ok?'✅':'❌';setTimeout(()=>{pk.style.display='none';res()},700);return}
  const A=path[i],B=path[i+1],t0=performance.now(),dur=Math.min(650,220+dist(A,B)*.6);const fr=now=>{const k=Math.min(1,(now-t0)/dur);pk.setAttribute('transform',`translate(${A.x+(B.x-A.x)*k} ${A.y+(B.y-A.y)*k})`);if(k<1)requestAnimationFrame(fr);else{i++;step()}};requestAnimationFrame(fr)};
 pk.setAttribute('transform',`translate(${path[0].x} ${path[0].y})`);step()})}
/* ---------- Харагдах байдал ---------- */
function render(){root.innerHTML=`<div class="nl"><div class="nl-top"><div class="nl-brand"><span>🌐</span><div><b>Сүлжээний лаборатори</b><small>Packet Tracer маягийн · свич, рөүтер, Wi-Fi, IP, ping</small></div></div>
 <div class="nl-acts"><select data-a="preset" aria-label="Жишээ"><option value="">📂 Жишээ нээх…</option><option value="lab">🏫 Сургуулийн лаборатори</option><option value="home">🏠 Гэрийн Wi-Fi</option><option value="two">🔀 Хоёр анги (рөүтер)</option><option value="blank">🗋 Хоосон талбар</option></select><button class="nl-b ghost" data-a="tasks">🎯 Даалгавар ${Object.keys(S.done).length}/${TASKS.length}</button></div></div>
 <div class="nl-tools">${[['sel','✋','Сонгох'],['link','🔌','Холбох'],['ping','✉️','Ping'],['del','🗑','Устгах']].map(([k,i,t])=>`<button class="nl-t ${S.tool===k?'on':''}" data-tool="${k}"><span>${i}</span>${t}</button>`).join('')}<i></i>${PAL.map(k=>`<button class="nl-t dv ${S.tool==='add:'+k?'on':''}" data-tool="add:${k}" title="${DT[k].n}"><span>${DT[k].i}</span>${DT[k].n}</button>`).join('')}</div>
 ${S.tool==='link'?`<div class="nl-sub">Кабель: <button class="${S.cable==='utp'?'on':''}" data-a="utp">UTP (зэс)</button><button class="${S.cable==='fiber'?'on':''}" data-a="fiber">Шилэн кабель</button></div>`:''}
 <div class="nl-hint">${hint()}</div>
 <div class="nl-main"><div class="nl-stage">${svg()}<div class="nl-toast"></div></div><div class="nl-side">${panel()}${cmdBox()}</div></div>
 ${S.showTasks?`<div class="nl-tasks"><h4>🎯 Даалгаврууд <small>(биелмэгц автоматаар шалгана)</small></h4>${TASKS.map(t=>`<div class="nl-task ${S.done[t.id]?'ok':''}"><b>${S.done[t.id]?'✅':'⬜'} ${t.id.toUpperCase()}</b><div><p>${esc(t.t)}</p><small>💡 ${esc(t.hint)}</small></div><em>+${PTS[t.lv]}</em></div>`).join('')}</div>`:''}
 <p class="nl-foot">💡 <b>Ping</b> — нэг төхөөрөмжөөс нөгөө рүү жижиг мэдээлэл (пакет) илгээж хариу ирэх эсэхээр холболтыг шалгадаг. <b>IP хаяг</b> — сүлжээн дэх төхөөрөмжийн «гэрийн хаяг». <b>Свич</b> — нэг сүлжээг, <b>рөүтер</b> — өөр сүлжээнүүдийг холбоно. <b>DHCP</b> — IP хаягийг автоматаар өгнө.</p></div>`;bind()}
function hint(){if(S.msg){const m=S.msg;S.msg='';return '📣 '+esc(m)}
 if(S.tool.startsWith('add:'))return `${DT[S.tool.slice(4)].i} Ажлын талбарт дарж <b>${DT[S.tool.slice(4)].n}</b> байрлуулна. Дуусвал ✋ Сонгох.`;
 if(S.tool==='link')return S.from?`🔌 <b>${esc(dev(S.from)?.name)}</b> сонгогдлоо — одоо холбох төхөөрөмж дээрээ дар.`:'🔌 Эхний төхөөрөмж дээр, дараа нь хоёр дахь дээр дарж кабелиар холбоно.';
 if(S.tool==='ping')return S.from?`✉️ <b>${esc(dev(S.from)?.name)}</b>-ээс — хүлээн авах төхөөрөмж дээр дар.`:'✉️ Илгээх компьютер дээр, дараа нь хүлээн авах төхөөрөмж дээр дарна.';
 if(S.tool==='del')return '🗑 Төхөөрөмж эсвэл кабель дээр дарж устгана.';
 return '✋ Төхөөрөмжийг чирж зөөнө, дарж тохиргоог нь нээнэ. Эхлэхдээ дээрээс «📂 Жишээ нээх»-ийг сонгоорой.'}
function soft(){const st=root.querySelector('.nl-stage');if(st)st.querySelector('.nl-svg').outerHTML=svg();bindStage();const side=root.querySelector('.nl-side');if(side&&!side.contains(document.activeElement)){side.innerHTML=panel()+cmdBox();bindSide()}}
function svgPt(e){const s=root.querySelector('.nl-svg'),r=s.getBoundingClientRect();return {x:(e.clientX-r.left)/r.width*VW,y:(e.clientY-r.top)/r.height*VH}}
function bindStage(){const s=root.querySelector('.nl-svg');if(!s)return;let drag=null,moved=false,t0=0;
 s.onpointerdown=e=>{const g=e.target.closest('[data-d]'),l=e.target.closest('[data-l]');const p=svgPt(e);
  if(S.tool.startsWith('add:')){const t=S.tool.slice(4);if(t==='cloud'&&S.devs.some(d=>d.t==='cloud')){S.msg='Интернэт ☁️ нэг л байна.';return render()}const d=mk(t,Math.max(50,Math.min(VW-50,p.x)),Math.max(50,Math.min(VH-90,p.y)));if(DT[t].wl)d.dhcp=true;S.devs.push(d);S.sel=d.id;changed();return}
  if(S.tool==='del'){if(g){const id=g.dataset.d;S.devs=S.devs.filter(d=>d.id!==id);S.links=S.links.filter(l=>l.a[0]!==id&&l.b[0]!==id);if(S.sel===id)S.sel=null}else if(l){S.links.splice(+l.dataset.l,1)}changed();return}
  if(!g){if(S.tool==='sel'){S.sel=null;S.cmd=false;render()}return}const d=dev(g.dataset.d);
  if(S.tool==='link'){if(!S.from){S.from=d.id;return render()}if(S.from===d.id){S.from=null;return render()}connect(dev(S.from),d);S.from=null;return}
  if(S.tool==='ping'){if(!S.from){if(!DT[d.t].host){S.msg='Илгээгч нь компьютер, утас, сервер байна.';return render()}S.from=d.id;return render()}const A=dev(S.from);S.from=null;const ip=DT[d.t].host?d.ifs[0].ip:d.t==='router'?(d.ifs.find(f=>f.ip)||{}).ip:d.t==='wifi'?d.lan.ip:'8.8.8.8';
   S.sel=A.id;S.cmd=true;render();if(!okIP(ip)){A.log.push(`⚠️ ${d.name}-д IP хаяг алга.`);soft();return}runCmd(A,'ping '+ip).then(()=>{check();persist();soft()});return}
  drag={d,dx:p.x-d.x,dy:p.y-d.y};moved=false;t0=Date.now();s.setPointerCapture(e.pointerId);e.preventDefault()};
 s.onpointermove=e=>{if(!drag)return;const p=svgPt(e);const nx=Math.max(45,Math.min(VW-45,p.x-drag.dx)),ny=Math.max(45,Math.min(VH-85,p.y-drag.dy));if(Math.abs(nx-drag.d.x)+Math.abs(ny-drag.d.y)>2)moved=true;drag.d.x=nx;drag.d.y=ny;if(moved){const st=root.querySelector('.nl-svg');st.outerHTML=svg();bindStage();const ns=root.querySelector('.nl-svg');try{ns.setPointerCapture(e.pointerId)}catch(x){}ns.onpointermove=s.onpointermove;ns.onpointerup=s.onpointerup}};
 s.onpointerup=()=>{if(!drag)return;const d=drag.d;drag=null;if(moved){if(DT[d.t].wl||d.t==='wifi')dhcp();persist();soft()}else{S.sel=d.id;render()}}}
function connect(A,B){const bad=m=>{S.msg=m;render()};
 if(DT[A.t].wl||DT[B.t].wl)return bad('Зөөврийн компьютер, утас кабельгүй — Wi-Fi рөүтерийн хүрээнд байрлуулахад автоматаар холбогдоно.');
 if(S.links.some(l=>(l.a[0]===A.id&&l.b[0]===B.id)||(l.a[0]===B.id&&l.b[0]===A.id)))return bad('Энэ хоёр аль хэдийн холбогдсон.');
 const pa=freePort(A,B.t==='cloud'?'wan':''),pb=freePort(B,A.t==='cloud'?'wan':'');
 if(pa==null)return bad(`${A.name}-д сул порт алга.`);if(pb==null)return bad(`${B.name}-д сул порт алга.`);
 if(DT[A.t].host&&DT[B.t].host)S.msg='Хоёр компьютерийг шууд холбож болно, гэхдээ олон төхөөрөмжид свич хэрэгтэй.';
 S.links.push({a:[A.id,pa],b:[B.id,pb],k:S.cable});S.ev.built=1;changed()}
function changed(){dhcp();check();persist();render()}
function bindSide(){const q=s=>root.querySelectorAll(s),d=S.sel&&dev(S.sel);
 q('.nl-side [data-f]').forEach(el=>{const k=el.dataset.f;const ev=el.type==='checkbox'||el.tagName==='SELECT'?'onchange':'onchange';el[ev]=()=>{if(!d)return;const v=el.type==='checkbox'?el.checked:el.value.trim();
  if(k==='name'){d.name=v.slice(0,16)||d.name}else if(k==='ip'||k==='gw'){if(v&&!okIP(v)){S.msg=`«${v}» буруу IP хаяг. Жишээ: 192.168.1.10 (0–255 хүртэлх 4 тоо, цэгээр тусгаарлана)`;return render()}if(k==='ip'){d.ifs[0].ip=v;const nn=v&&n4(v)&255;if(v&&(nn===0||nn===255)&&d.ifs[0].mask==='255.255.255.0')S.msg='⚠️ .0 ба .255-аар төгссөн хаягийг төхөөрөмжид өгдөггүй (сүлжээний ба broadcast хаяг).'}else d.gw=v}
  else if(k==='mask'){d.ifs[0].mask=v}else if(k==='share'){d.share=v}else if(k==='folder'){d.folder=v||'Share'}else if(k==='perm'){d.perm=v}
  else if(k==='ssid'){d.ssid=v||'WiFi'}else if(k==='lanip'){if(!okIP(v)){S.msg='Буруу IP хаяг';return render()}d.lan.ip=v}else if(k==='lanm'){d.lan.mask=v}else if(k==='dhcpS'){d.dhcpS=v}
  else if(/^r\d$/.test(k)){if(v&&!okIP(v)){S.msg='Буруу IP хаяг';return render()}d.ifs[+k[1]].ip=v}else if(/^rm\d$/.test(k))d.ifs[+k[2]].mask=v;else if(/^rd\d$/.test(k))d.ifs[+k[2]].dhcpS=v;
  const dups=dupIP();if(dups.length)S.msg=`⚠️ IP хаяг давхардсан: ${dups.map(x=>x[0]+' ('+x[1].join(', ')+')').join('; ')}`;
  changed()}});
 q('.nl-side [data-a]').forEach(el=>{const a=el.dataset.a;if(a==='cmdin'){el.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();go(el)}};return}el.onclick=()=>{
  if(a==='close'){S.sel=null;S.cmd=false;render()}else if(a==='deldev'&&d){S.devs=S.devs.filter(x=>x!==d);S.links=S.links.filter(l=>l.a[0]!==d.id&&l.b[0]!==d.id);S.sel=null;changed()}
  else if(a==='static'&&d){d.dhcp=false;d.apipa=false;if(/^169\.254/.test(d.ifs[0].ip)){d.ifs[0].ip='';d.ifs[0].mask='255.255.255.0'}changed()}else if(a==='dhcpc'&&d){d.dhcp=true;changed()}
  else if(a==='cmd'){S.cmd=true;render();setTimeout(()=>root.querySelector('[data-a=cmdin]')?.focus(),50)}else if(a==='cmdx'){S.cmd=false;render()}else if(a==='cmdgo')go(root.querySelector('[data-a=cmdin]'))}});
 q('.nl-side [data-q]').forEach(b=>b.onclick=()=>{const i=root.querySelector('[data-a=cmdin]');const v=b.dataset.q;if(/ $|\\\\$/.test(v)){i.value=v;i.focus()}else{i.value=v;go(i)}});
 const o=root.querySelector('.nl-out');if(o)o.scrollTop=1e9}
async function go(inp){const d=S.sel&&dev(S.sel);if(!d||!inp)return;const v=inp.value;inp.value='';inp.disabled=true;await runCmd(d,v);check();persist();const side=root.querySelector('.nl-side');side.innerHTML=panel()+cmdBox();bindSide();const i2=root.querySelector('[data-a=cmdin]');if(i2&&matchMedia('(pointer:fine)').matches)i2.focus()}
function bind(){const q=s=>root.querySelectorAll(s);
 q('[data-tool]').forEach(b=>b.onclick=()=>{S.tool=b.dataset.tool;S.from=null;render()});
 const pr=root.querySelector('[data-a=preset]');pr.onchange=()=>{const v=pr.value;if(!v)return;const keep={done:S.done,ev:S.ev,showTasks:S.showTasks};uid=1;S=v==='blank'?fresh():PRE[v]();Object.assign(S,keep);if(v==='blank')S.msg='Хоосон талбар. Төхөөрөмжөө нэмээд эхлээрэй.';changed()};
 q('.nl-top [data-a=tasks]').forEach(b=>b.onclick=()=>{S.showTasks=!S.showTasks;render();if(S.showTasks)root.querySelector('.nl-tasks')?.scrollIntoView({behavior:'smooth',block:'nearest'})});
 q('.nl-sub [data-a]').forEach(b=>b.onclick=()=>{S.cable=b.dataset.a;render()});
 bindStage();bindSide()}
const css=document.createElement('style');css.textContent=`
.nl{--nn:#1b3a6b;--ng:#c9a54a;--nl:#e6dfcf;background:#fffdf8;border:1px solid var(--nl);border-radius:14px;overflow:hidden;color:#1d2433;font:15px/1.45 inherit;position:relative}
.nl-top{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;align-items:center;padding:10px 14px;background:linear-gradient(135deg,#14306a,#1f6f8b);color:#fff}
.nl-brand{display:flex;gap:10px;align-items:center}.nl-brand span{font-size:28px}.nl-brand small{display:block;opacity:.85;font-size:12px}.nl-acts{display:flex;gap:6px;flex-wrap:wrap;align-items:center}
.nl-acts select{min-height:38px;border-radius:9px;border:0;padding:4px 8px;font:inherit;font-size:14px;max-width:220px;color:#1d2433;background:#fff}
.nl-b{min-height:38px;padding:6px 12px;border-radius:9px;border:1.5px solid var(--nn)!important;background:var(--nn)!important;color:#fff!important;font-weight:700;cursor:pointer;font-size:14px;box-shadow:none!important;margin:0}.nl-b.ghost{background:#fff!important;color:var(--nn)!important}.nl-b.red{color:#b0413e!important;border-color:#e2b3b1!important}
.nl-top .nl-b.ghost{background:transparent!important;color:#fff!important;border-color:#ffffff99!important}
.nl-tools{display:flex;gap:6px;overflow-x:auto;padding:8px 10px;background:#f4efe3;border-bottom:1px solid var(--nl);scrollbar-width:thin;-webkit-overflow-scrolling:touch}.nl-tools i{flex:none;width:1px;background:#d8cfb8;margin:0 4px}
.nl-t{flex:none;display:flex;flex-direction:column;align-items:center;gap:1px;min-width:66px;padding:5px 6px!important;border:1.5px solid var(--nl)!important;background:#fff!important;color:#2a3349!important;border-radius:10px!important;font:700 11px/1.15 inherit!important;cursor:pointer;box-shadow:none!important;min-height:0!important;margin:0}.nl-t span{font-size:22px;line-height:1.15}.nl-t.on{border-color:var(--ng)!important;background:#fbf1d6!important;box-shadow:0 0 0 2px #c9a54a55!important}
.nl-sub{display:flex;gap:6px;align-items:center;padding:6px 12px;font-size:13px;font-weight:700;background:#fbf6e9;border-bottom:1px solid var(--nl)}.nl-sub button{min-height:32px!important;padding:3px 10px!important;border-radius:8px!important;border:1.5px solid var(--nl)!important;background:#fff!important;color:#1d2433!important;font:700 13px inherit!important;box-shadow:none!important}.nl-sub button.on{border-color:var(--ng)!important;background:#fbf1d6!important}
.nl-hint{padding:7px 12px;font-size:13.5px;background:#fffaf0;border-bottom:1px solid var(--nl);min-height:20px}
.nl-main{display:grid;grid-template-columns:minmax(0,1fr) 320px;gap:0}@media(max-width:900px){.nl-main{grid-template-columns:1fr}}
.nl-stage{position:relative;border-right:1px solid var(--nl)}.nl-svg{display:block;width:100%;height:auto;touch-action:none;user-select:none;-webkit-user-select:none;background:#fffdf8}
.nl-ln{stroke:#2f6db5;stroke-width:4}.nl-ln.fiber{stroke:#e07b00;stroke-width:5}.nl-hit{stroke:transparent;stroke-width:22;cursor:pointer}.nl-led{fill:#2ecc71;stroke:#fff;stroke-width:2}
.nl-pt{font:700 15px "PT Mono",monospace;fill:#6b6457;text-anchor:middle}.nl-wl{stroke:#7b4fa0;stroke-width:3;stroke-dasharray:4 9;animation:nlw 1s linear infinite}@keyframes nlw{to{stroke-dashoffset:-26}}
.nl-rng{fill:#7b4fa008;stroke:#7b4fa055;stroke-width:2;stroke-dasharray:10 8}.nl-rng.on{fill:#7b4fa014}
.nl-dev{cursor:grab}.nl-box{fill:#fff;stroke:#c9bfa6;stroke-width:2.5}.nl-dev.sel .nl-box{stroke:#c9a54a;stroke-width:5;fill:#fffaf0}.nl-dev.from .nl-box{stroke:#1f6f8b;stroke-width:5;stroke-dasharray:8 5}
.nl-box.t-switch{fill:#eaf2fb}.nl-box.t-router{fill:#e8f6ef}.nl-box.t-wifi{fill:#f2ebfa}.nl-box.t-cloud{fill:#eef6fd}
.nl-ico{font-size:38px;text-anchor:middle}.nl-rt{font:700 30px sans-serif;fill:#fff;text-anchor:middle}.nl-t[data-tool='add:router'] span{color:#2b6e4f;font-weight:900}.nl-nm{font:700 17px inherit;text-anchor:middle;fill:#1b2a4a}.nl-ip{font:15px "PT Mono",monospace;text-anchor:middle;fill:#1f6f8b}
.nl-pkt circle{fill:#fff;stroke:#c9a54a;stroke-width:3}.nl-pkt text{font-size:20px;text-anchor:middle}.nl-pkt.ok circle{stroke:#2b6e4f}.nl-pkt.bad circle{stroke:#b0413e}
.nl-toast{position:absolute;left:50%;top:10px;transform:translate(-50%,-20px);opacity:0;background:#1b3a6b;color:#fff;padding:8px 14px;border-radius:10px;font-weight:700;font-size:14px;transition:all .3s;pointer-events:none;max-width:90%;text-align:center;border:1px solid #c9a54a}.nl-toast.on{opacity:1;transform:translate(-50%,0)}
.nl-side{display:flex;flex-direction:column;gap:10px;padding:10px;background:#fbf8f0}
.nl-pn{display:flex;flex-direction:column;gap:7px}.nl-empty p{font-size:13.5px;color:#5b6276;margin:4px 0 0}
.nl-ph{display:flex;gap:10px;align-items:flex-start}.nl-ph>span{font-size:30px}.nl-ph>div{flex:1}.nl-x{all:unset;cursor:pointer;font-size:18px;padding:2px 6px;color:#646a78}
.nl-pn label{display:flex;flex-direction:column;font-size:12.5px;font-weight:700;color:#3b4560;gap:2px;margin:0}.nl-pn input:not([type=checkbox]),.nl-pn select{min-height:38px;border:1.5px solid var(--nl)!important;border-radius:8px!important;padding:4px 8px!important;font:16px "PT Mono",monospace!important;background:#fff!important;color:#1d2433!important;box-shadow:none!important}
.nl-pn input:disabled,.nl-pn select:disabled{background:#f1ede3!important;color:#6b6457!important}
.nl-chk{flex-direction:row!important;align-items:center;gap:6px!important;font-size:13.5px!important}.nl-chk input{width:20px;height:20px}
.nl-st{margin:0;font-size:13px;font-weight:700;padding:6px 9px;border-radius:8px}.nl-st.ok{background:#e3f1e8;color:#1d5c4d}.nl-st.bad{background:#fbecec;color:#9b2226}
.nl-seg{display:grid;grid-template-columns:1fr 1fr;border:1.5px solid var(--nl);border-radius:9px;overflow:hidden}.nl-seg button{all:unset;text-align:center;padding:8px 4px;font-weight:700;font-size:13px;cursor:pointer;background:#fff}.nl-seg button.on{background:var(--nn);color:#fff}
.nl-box2{border:1px solid var(--nl);border-radius:10px;padding:8px;background:#fff;display:flex;flex-direction:column;gap:6px}.nl-box2 p{margin:0;font-size:13px}
.nl-tip{font-size:13px;color:#4a5163;margin:0;background:#f4efe3;border-radius:8px;padding:7px 9px}
.nl-ports{display:grid;grid-template-columns:1fr 1fr;gap:4px}.nl-ports span{font:12px "PT Mono",monospace;padding:4px 6px;border-radius:6px;background:#f1ede3;color:#8a8270;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.nl-ports span.on{background:#e3f1e8;color:#1d5c4d}
.nl-cmd{background:#0c0c0c;border-radius:10px;overflow:hidden;border:1px solid #333}.nl-ch{display:flex;justify-content:space-between;align-items:center;background:#1f1f1f;color:#ddd;font-size:12.5px;padding:6px 10px}.nl-ch button{all:unset;cursor:pointer;color:#bbb}
.nl-out{margin:0;padding:8px 10px;color:#d7d7d7;font:12.5px/1.45 "PT Mono",Consolas,monospace;height:210px;overflow:auto;white-space:pre-wrap;word-break:break-word}
.nl-cin{display:flex;align-items:center;gap:4px;padding:4px 8px 8px;color:#d7d7d7;font:13px "PT Mono",monospace}.nl-cin input{flex:1;min-width:0;background:#0c0c0c!important;border:0!important;color:#fff!important;font:16px "PT Mono",monospace!important;outline:none;min-height:34px;box-shadow:none!important;padding:0!important}.nl-cin button{all:unset;cursor:pointer;color:#c9a54a;font-weight:700;padding:4px 8px}
.nl-qk{display:flex;gap:4px;flex-wrap:wrap;padding:0 8px 8px}.nl-qk button{all:unset;cursor:pointer;font:12px "PT Mono",monospace;color:#c9d1e0;border:1px solid #444;border-radius:6px;padding:4px 7px}
.nl-tasks{padding:10px 12px;border-top:1px solid var(--nl);background:#fff}.nl-tasks h4{margin:0 0 8px}.nl-tasks h4 small{color:#646a78;font-weight:400}
.nl-task{display:grid;grid-template-columns:auto 1fr auto;gap:10px;align-items:start;padding:8px 10px;border:1px solid var(--nl);border-radius:10px;margin-bottom:6px;background:#faf7ef}.nl-task.ok{background:#eef7f1;border-color:#b9dcc6}.nl-task p{margin:0;font-size:14px}.nl-task small{color:#5b6276}.nl-task em{font-style:normal;font-weight:700;color:#8a6a1e}
.nl-foot{margin:0;padding:10px 12px;font-size:13px;color:#5b6276;border-top:1px solid var(--nl)}
@media(max-width:640px){.nl-top{padding:10px}.nl-acts{width:100%;display:grid;grid-template-columns:1fr auto}.nl-acts select{max-width:none}.nl-t{min-width:60px}.nl-out{height:180px}.nl-side{padding:8px}.nl-svg{aspect-ratio:1000/620;min-height:300px}}
`;document.head.appendChild(css);
window.NetLab={TASKS,PTS,mount(el,o={}){root=el;O=o;if(!S&&!restore()){S=PRE.lab()}S.from=null;if(o.solved)Object.keys(o.solved).forEach(k=>{if(TASKS.some(t=>t.id===k))S.done[k]=1});if(o.tasks)S.showTasks=true;dhcp();render();if(check())persist()},_route:(a,b)=>route(a,b),_S:()=>S,_run:(d,c)=>runCmd(d,c)};
})();
