/* Shuttle-school: werkt ook zonder internet na het eerste bezoek */
const CACHE='shuttle-school-20261109170738';
const AUDIO_CACHE='shuttle-audio-a1';
const CORE=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!==AUDIO_CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  const r=e.request; if(r.method!=='GET') return;
  if(r.mode==='navigate'){ /* nieuwste versie als er internet is, anders de bewaarde */
    e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(CACHE).then(c=>c.put('./index.html',cp));return res;}).catch(()=>caches.match('./index.html')));
    return; }
  if(r.url.includes('/audio/')){ /* ingesproken fragmenten: bewaren zodra ze één keer zijn afgespeeld; de lijst altijd vers ophalen */
    if(r.url.endsWith('.json')){ e.respondWith(fetch(r).then(res=>{const cp=res.clone();caches.open(AUDIO_CACHE).then(c=>c.put(r,cp));return res;}).catch(()=>caches.match(r))); return; }
    e.respondWith(caches.open(AUDIO_CACHE).then(c=>c.match(r).then(hit=>hit||fetch(r).then(res=>{if(res.ok&&res.status===200) c.put(r,res.clone()); return res;})))); return; }
  e.respondWith(caches.match(r).then(hit=>hit||fetch(r).then(res=>{
    if(res.ok&&(r.url.startsWith(self.location.origin)||/fonts\.(googleapis|gstatic)\.com|cdnjs\.cloudflare\.com/.test(r.url))){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp));}
    return res;}).catch(()=>hit)));
});
