// Max's World offline cache. The version below changes with every release, which tells phones an update is ready.
const V='75',C='maxsworld-'+V;
const FILES=['./','index.html','app.js','manifest.webmanifest','lib/three.min.js','lib/fredoka.ttf','icons/icon-192.png','icons/icon-512.png','icons/maskable-512.png','icons/apple-touch-icon.png','icons/favicon-32.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES.map(u=>new Request(u,{cache:'reload'})))))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k.startsWith('maxsworld-')&&k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('message',e=>{if(e.data==='skip')self.skipWaiting()});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;const u=new URL(r.url);if(u.origin!==location.origin)return;
  if(u.pathname.endsWith('/version.json')){e.respondWith(fetch(r,{cache:'no-store'}).catch(()=>new Response('{}',{headers:{'Content-Type':'application/json'}})));return}
  if(r.mode==='navigate'){e.respondWith(caches.open(C).then(c=>c.match('index.html')).then(m=>m||fetch(r)));return}
  e.respondWith(caches.open(C).then(c=>c.match(r,{ignoreSearch:true}).then(m=>m||fetch(r))))});
