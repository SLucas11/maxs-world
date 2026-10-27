// Max's World app shell: install button, offline support and updates
(function(){
const $=id=>document.getElementById(id),V=window.APPV||'?';
const isApp=matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches||navigator.standalone===true;
const iOS=/iPhone|iPad|iPod/.test(navigator.userAgent)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
document.documentElement.classList.toggle('isapp',isApp);
if(navigator.storage&&navigator.storage.persist)navigator.storage.persist().catch(()=>{});
// little banner at the top of the screen
let bar=null;function banner(msg,btns){if(!bar){bar=document.createElement('div');bar.id='appBar';bar.setAttribute('role','status');document.body.appendChild(bar)}
  bar.innerHTML='';const sp=document.createElement('span');sp.textContent=msg;bar.appendChild(sp);(btns||[]).forEach(([t,f,go])=>{const b=document.createElement('button');b.textContent=t;if(go)b.className='go';b.onclick=f;bar.appendChild(b)});
  requestAnimationFrame(()=>bar.classList.add('on'))}
function hideBanner(){if(bar)bar.classList.remove('on')}
// ---- install ----
const inst=$('tInst');let deferred=null;
addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferred=e;if(inst&&!isApp){inst.hidden=false;inst.classList.add('hot')}});
addEventListener('appinstalled',()=>{if(inst)inst.hidden=true;deferred=null});
if(inst&&!isApp&&iOS){inst.hidden=false;inst.classList.add('hot')}
if(inst)inst.onclick=async()=>{if(deferred){deferred.prompt();try{await deferred.userChoice}catch(e){}deferred=null;return}
  if(iOS)alert("To install Max's World on your iPhone:\n\n1. Open this page in Safari.\n2. Tap the Share button (the square with an arrow).\n3. Scroll down and tap 'Add to Home Screen'.\n4. Tap 'Add'.\n\nMax's World will then open from your home screen like any other app, and it works offline.");
  else alert("To install Max's World:\n\nOpen this page in Chrome, tap the ⋮ menu, then tap 'Install app' (or 'Add to Home screen').")};
// ---- offline + updates ----
const upd=$('tUpd');if(upd&&'serviceWorker' in navigator)upd.hidden=false;
if(!('serviceWorker' in navigator)||location.protocol==='file:')return;
let reg=null,waiting=null,reloading=false,notes='';
async function getNotes(){try{const r=await fetch('version.json?'+Date.now(),{cache:'no-store'});const j=await r.json();return j}catch(e){return null}}
async function ready(w){waiting=w;const j=await getNotes();const nv=j&&j.v?j.v:'';notes=j&&j.notes?j.notes:'';
  banner('A new version of Max\'s World is ready'+(nv?' (v'+nv+')':'')+(notes?': '+notes:'!'),[['Later',hideBanner],['Update now',apply,1]]);if(upd){upd.textContent='Install update';upd.classList.add('hot')}}
function apply(){try{if(window.save)save()}catch(e){}banner('Updating Max\'s World...',[]);if(waiting)waiting.postMessage('skip');else location.reload();setTimeout(()=>location.reload(),4000)}
function watch(r){r.addEventListener('updatefound',()=>{const n=r.installing;if(!n)return;n.addEventListener('statechange',()=>{if(n.state==='installed'&&navigator.serviceWorker.controller)ready(n)})})}
navigator.serviceWorker.addEventListener('controllerchange',()=>{if(reloading)return;reloading=true;location.reload()});
navigator.serviceWorker.register('sw.js',{updateViaCache:'none'}).then(r=>{reg=r;watch(r);if(r.waiting&&navigator.serviceWorker.controller)ready(r.waiting);
  setInterval(()=>r.update().catch(()=>{}),30*60*1000);
  document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')r.update().catch(()=>{})})}).catch(e=>console.warn('sw',e));
if(upd)upd.onclick=async()=>{if(waiting){apply();return}if(!reg){alert('Updates are not available here.');return}
  if(!navigator.onLine){banner("You're offline. Connect to the internet to check for updates.",[['OK',hideBanner]]);setTimeout(hideBanner,5000);return}
  upd.textContent='Checking...';upd.disabled=true;
  try{await reg.update();await new Promise(r=>setTimeout(r,1500));
    if(reg.waiting){ready(reg.waiting)}else if(reg.installing){banner('Downloading the new version...',[]);}
    else{const j=await getNotes();banner('You have the latest version'+(j&&j.v?' (v'+j.v+')':' (v'+V+')')+'.',[['OK',hideBanner]]);setTimeout(hideBanner,5000)}}
  catch(e){banner("Can't check for updates right now. Are you online?",[['OK',hideBanner]]);setTimeout(hideBanner,5000)}
  finally{upd.disabled=false;if(!waiting)upd.textContent='Check for updates'}};
})();
