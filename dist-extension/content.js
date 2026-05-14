import{p as vt}from"./assets/notificationStyles-DOAf_PIB.js";if(window.__greenBreatheContentLoaded)console.log("[GreenBreathe Content] Already loaded, skipping duplicate");else{let it=function(t,r,n){return Math.sin(t*2+r)*.22+Math.sin(t*3.7+r*1.3+n*8e-4)*.14+Math.sin(t*7.1+r*2.1)*.09+Math.sin(t*11.3+r*.7)*.05},Y=function(t,r,n,s,a,o,i){if(s<=1)return;const h=64;for(let d=0;d<=h;d++){const y=d/h*Math.PI*2,w=it(y,a,i)*o,e=s*(1+w),T=r+Math.cos(y)*e,p=n+Math.sin(y)*e;d===0?t.moveTo(T,p):t.lineTo(T,p)}t.closePath()},X=function(t,r,n){const s=Math.random()*Math.PI*2,a=t.r*(.75+Math.random()*.35),o=t.x+Math.cos(s)*a,i=t.y+Math.sin(s)*a;o>-20&&o<r+20&&i>-20&&i<n+20&&t.subs.push({x:o,y:i,r:0,maxR:12+Math.random()*28,speed:.4+Math.random()*.8,phase:Math.random()*100,wobble:.3+Math.random()*.35})},st=function(t,r,n){const s=Math.sqrt(t*t+r*r),a=4+Math.floor(Math.random()*3),o=[];for(let i=0;i<a;i++)o.push({x:t*(.12+Math.random()*.76),y:r*(.12+Math.random()*.76),r:0,maxR:s*(.45+Math.random()*.4),speed:(1+Math.random()*1.8)*n,phase:Math.random()*200,wobble:.2+Math.random()*.25,delay:i*160+Math.random()*220,subs:[],lastSubR:0});return o},at=function(t,r,n,s){let a=!0;for(const o of t){if(r<o.delay){a=!1;continue}if(o.r<o.maxR){const i=1+(1-o.r/o.maxR)*.6;o.r=Math.min(o.r+o.speed*i,o.maxR),a=!1}o.r-o.lastSubR>25+Math.random()*15&&(o.lastSubR=o.r,X(o,n,s),Math.random()>.6&&X(o,n,s));for(const i of o.subs)i.r<i.maxR&&(i.r=Math.min(i.r+i.speed,i.maxR),a=!1)}return a},lt=function(){if(document.fullscreenElement)return!0;const t=document.activeElement;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.getAttribute("contenteditable")==="true"))return!0;const r=document.querySelectorAll("video");for(const n of r){const s=n.getBoundingClientRect();if(!n.paused&&n.currentTime>0&&s.width>200&&s.height>150)return!0}return!1},ct=function(){const t=Date.now();return t-Q<5e3||t-V<5e3},J=function(t){return t==="random"?q[Math.floor(Math.random()*q.length)]:t&&q.includes(t)?t:"top_right"},O=function(t){return String(t).replace(/[&<>"']/g,r=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[r])};window.__greenBreatheContentLoaded=!0,console.log("[GreenBreathe Content] Script loaded on:",window.location.href);let Q=0,V=0;document.addEventListener("mousemove",()=>{Q=Date.now()},{passive:!0}),document.addEventListener("scroll",()=>{V=Date.now()},{passive:!0});async function Z(){const r=(await chrome.storage.local.get("userProfile")).userProfile||{},n=r.themeMode||"auto",s=new Date().getHours(),a=n==="day"||n==="auto"&&s>=6&&s<18,o=["copper-grass-goldfish.png","mint-photography.png","office-zen-green-cat.png"],i=["neon-leaf.png","moonlight-forest.png","shattered-moon.jpg"],h=r.customBackgroundsDay||r.customBackgrounds||[],d=r.customBackgroundsNight||[];let y;return a?y=h.length>0?h:o.map(w=>chrome.runtime.getURL(`images/day/${w}`)):y=d.length>0?d:i.map(w=>chrome.runtime.getURL(`images/night/${w}`)),{isDay:a,bgImages:y}}const q=["top_right","top_left","bottom_right","bottom_left"];let m=null;const tt=3e3,dt=5e3;async function G(t,r=0,n=3,s=20){if(lt()&&r<3){setTimeout(()=>G(t,r+1,n,s),3e4);return}if(ct()&&r===0){setTimeout(()=>G(t,r,n,s),1e4);return}const o=(await chrome.storage.local.get("userProfile")).userProfile||{},i=J(o.notificationPosition),h=o.cardSize||"medium",d=o.mbtiType||"INFP",{isDay:y,bgImages:w}=await Z(),e=vt(y),T={small:{width:960,height:570},medium:{width:1280,height:760},large:{width:1600,height:950}},{width:p,height:u}=T[h]||T.medium,U=d.includes("T"),W=d.includes("N");let R="";U?R=t.instruction.mbtiAdaptation.T:W?R=t.instruction.mbtiAdaptation.N:R=t.instruction.mbtiAdaptation.F;const _=w[Math.floor(Math.random()*w.length)];let x=document.getElementById("green-breathe-notification-root");x||(x=document.createElement("div"),x.id="green-breathe-notification-root",document.body.appendChild(x)),x.innerHTML="";const E=document.createElement("div");E.className=`green-breathe-notification ${i}`;const k=E.attachShadow({mode:"open"}),M=document.createElement("div");M.style.cssText=`
    width: ${p}px; height: ${u}px; position: relative; overflow: hidden;
    border-radius: ${e.borderRadius}px; pointer-events: none;
    font-family: ${e.fontFamily};
    mix-blend-mode: multiply;
    ${e.pixelArt?"image-rendering: pixelated;":""}
  `;const B=document.createElement("canvas");B.style.cssText=`position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:1;border-radius:${e.borderRadius}px;${e.pixelArt?"image-rendering: pixelated;":""}`,M.appendChild(B);const c=document.createElement("div");c.style.cssText=`
    position: absolute; bottom: 0; left: 0; right: 0; height: 32%;
    background: ${e.contentBg};
    backdrop-filter: blur(28px) saturate(150%); -webkit-backdrop-filter: blur(28px) saturate(150%);
    border-top: ${e.contentBorder};
    padding: 32px 56px;
    display: flex; flex-direction: column; justify-content: center;
    z-index: 2; pointer-events: auto;
    opacity: 0; transform: translateY(20px); filter: blur(8px);
    transition: all 0.8s cubic-bezier(0.22,1,0.36,1);
    border-radius: 0 0 ${e.borderRadius}px ${e.borderRadius}px;
  `;const S=e.pixelArt?22:30,N=e.pixelArt?14:19,v=e.pixelArt?13:17;c.innerHTML=`
    <div style="font-size:${S}px;line-height:1.5;margin-bottom:14px;color:${e.textPrimary};font-weight:600;letter-spacing:${e.pixelArt?0:1}px">${O(t.encouragement)}</div>
    <div style="font-size:${N}px;color:${e.textSecondary};margin-bottom:22px;line-height:1.6;font-weight:500">${O(t.instruction.instruction)} · ${O(R)}</div>
    <div style="display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap">
      <button class="gb-ghost gb-snooze" style="
        padding:10px 22px;border-radius:${Math.max(8,e.borderRadius-8)}px;font-size:${v}px;font-weight:600;cursor:pointer;
        font-family:${e.fontFamily};
        background:${e.ghostButtonBg};color:${e.ghostButtonColor};border:${e.ghostButtonBorder};
        transition:all 0.3s ease;pointer-events:auto;
      ">稍后再说</button>
      <button class="gb-ghost gb-ignore" style="
        padding:10px 22px;border-radius:${Math.max(8,e.borderRadius-8)}px;font-size:${v}px;font-weight:600;cursor:pointer;
        font-family:${e.fontFamily};
        background:${e.ghostButtonBg};color:${e.ghostButtonColor};border:${e.ghostButtonBorder};
        transition:all 0.3s ease;pointer-events:auto;
      ">先不了</button>
      <button class="gb-primary gb-complete" style="
        padding:10px 28px;border-radius:${Math.max(8,e.borderRadius-8)}px;font-size:${v}px;font-weight:600;cursor:pointer;border:${e.pixelArt?"2px solid "+e.buttonHover:"none"};
        font-family:${e.fontFamily};
        background:${e.buttonBg};color:${e.buttonColor};
        box-shadow:0 4px 12px rgba(0,0,0,0.15);transition:all 0.3s ease;pointer-events:auto;
      ">我已完成</button>
    </div>
  `,M.appendChild(c),k.appendChild(M),x.appendChild(E);const z=Date.now(),L=window.setTimeout(()=>{A("timeout")},s*1e3),ot=()=>{!m||m.resolved||Date.now()-m.shownAt<dt&&A("window_blur")};window.addEventListener("blur",ot,{once:!1}),m={wrapper:E,taskType:t.taskType,style:e.key,shownAt:z,resolved:!1,blurListener:ot,autoTimerId:L};const g=new Image;g.crossOrigin="anonymous",g.onload=()=>{const $=Math.min(window.devicePixelRatio||1,2);B.width=p*$,B.height=u*$;const l=B.getContext("2d");if(!l)return;l.scale($,$);const C=g.width/g.height,j=p/u;let F=0,H=0,P=g.width,I=g.height;C>j?(P=g.height*j,F=(g.width-P)/2):(I=g.width/j,H=(g.height-I)/2);const ht=n>0?4/n:999,bt=n>0?n*1e3:0;if(n<=0)l.drawImage(g,F,H,P,I,0,0,p,u),c.style.opacity="1",c.style.transform="translateY(0)",c.style.filter="blur(0)";else{let nt=function(yt){if(rt)return;const D=yt-xt,wt=at(K,D,p,u);l.clearRect(0,0,p,u),l.save(),l.beginPath();for(const f of K){f.r>1&&Y(l,f.x,f.y,f.r,f.phase,f.wobble,D);for(const b of f.subs)b.r>1&&Y(l,b.x,b.y,b.r,b.phase,b.wobble,D)}l.clip(),l.drawImage(g,F,H,P,I,0,0,p,u),l.restore(),l.globalAlpha=.12,l.save(),l.beginPath();for(const f of K){f.r>1&&Y(l,f.x,f.y,f.r*1.12,f.phase,f.wobble,D);for(const b of f.subs)b.r>1&&Y(l,b.x,b.y,b.r*1.15,b.phase,b.wobble,D)}if(l.clip(),l.drawImage(g,F,H,P,I,0,0,p,u),l.restore(),l.globalAlpha=1,wt||D>bt){rt=!0,l.clearRect(0,0,p,u),l.drawImage(g,F,H,P,I,0,0,p,u),c.style.opacity="1",c.style.transform="translateY(0)",c.style.filter="blur(0)";return}requestAnimationFrame(nt)};const K=st(p,u,ht),xt=performance.now();let rt=!1;requestAnimationFrame(nt)}},g.onerror=()=>{c.style.opacity="1",c.style.transform="translateY(0)",c.style.filter="blur(0)"},g.src=_;const ut=k.querySelector(".gb-complete"),ft=k.querySelector(".gb-snooze"),mt=k.querySelector(".gb-ignore");ut?.addEventListener("click",()=>{Date.now()-z<tt?A("fast_dismiss"):A("user_completed")}),ft?.addEventListener("click",()=>A("user_snoozed")),mt?.addEventListener("click",()=>{const $=Date.now()-z;A($<tt?"fast_dismiss":"timeout")});function A($){if(!m||m.resolved)return;m.resolved=!0,clearTimeout(m.autoTimerId),window.removeEventListener("blur",m.blurListener);const l=Date.now()-m.shownAt;let C;$==="user_completed"?C="completed":$==="user_snoozed"?C="snoozed":C="ignored",gt(C,m.taskType,l,$,m.style),M.style.transition="all 1.0s cubic-bezier(0.22,1,0.36,1)",M.style.opacity="0",M.style.filter="blur(10px)",M.style.transform="scale(0.96)",setTimeout(()=>E.remove(),1100),m=null}}async function pt(t=20){const n=(await chrome.storage.local.get("userProfile")).userProfile||{},s=J(n.notificationPosition),{isDay:a}=await Z(),i=(await chrome.storage.local.get("interactionLog")).interactionLog||[],h=new Date,d=h.getDay(),y=d===0?6:d-1,w=new Date(h.getFullYear(),h.getMonth(),h.getDate()-y-7,0,0,0,0),e=new Date(w.getTime()+168*3600*1e3),T=i.filter(L=>L.timestamp>=w.getTime()&&L.timestamp<e.getTime()),p=T.filter(L=>L.action==="completed").length,u=T.length,U=u>0?Math.round(p/u*100):0,W=a?"linear-gradient(135deg, rgba(220,252,231,0.95), rgba(167,243,208,0.92))":"linear-gradient(135deg, rgba(15,40,55,0.95), rgba(10,30,46,0.92))",R=a?"#064e3b":"#e8f4f0",_=a?"#065f46":"#a0c4b8",x=a?"#059669":"#38c9a3",E=a?"#ffffff":"#0a1e2e",k=a?"rgba(16,185,129,0.35)":"rgba(56,201,163,0.35)",M=460,B=280;let c=document.getElementById("green-breathe-notification-root");c||(c=document.createElement("div"),c.id="green-breathe-notification-root",document.body.appendChild(c)),c.innerHTML="";const S=document.createElement("div");S.className=`green-breathe-notification ${s}`;const N=S.attachShadow({mode:"open"}),v=document.createElement("div");v.style.cssText=`
    width:${M}px;height:${B}px;border-radius:20px;
    background:${W};
    backdrop-filter:blur(24px) saturate(150%);-webkit-backdrop-filter:blur(24px) saturate(150%);
    box-shadow:0 12px 40px rgba(0,0,0,0.18);
    padding:24px 28px;box-sizing:border-box;pointer-events:auto;
    font-family:'Microsoft YaHei','PingFang SC',sans-serif;
    display:flex;flex-direction:column;
    opacity:0;transform:translateY(20px);transition:all 0.6s cubic-bezier(0.22,1,0.36,1);
  `,v.innerHTML=`
    <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
      <span style="display:inline-block;width:8px;height:8px;border-radius:50%;background:${x};box-shadow:0 0 8px ${x}80"></span>
      <span style="font-size:13px;color:${_};letter-spacing:1px;">本周回顾 · 周报</span>
    </div>
    <div style="font-size:22px;font-weight:700;color:${R};margin-bottom:18px;line-height:1.4;">
      ${p>0?`本周你完成了 ${p} 次提醒`:"本周还没有完成记录"}
    </div>
    <div style="display:flex;gap:14px;margin-bottom:20px;">
      <div style="flex:1;padding:12px 14px;border-radius:12px;background:${a?"rgba(255,255,255,0.55)":"rgba(255,255,255,0.06)"};">
        <div style="font-size:11px;color:${_};letter-spacing:1px;">完成率</div>
        <div style="font-size:24px;font-weight:700;color:${x};margin-top:2px;">${U}%</div>
      </div>
      <div style="flex:1;padding:12px 14px;border-radius:12px;background:${a?"rgba(255,255,255,0.55)":"rgba(255,255,255,0.06)"};">
        <div style="font-size:11px;color:${_};letter-spacing:1px;">收到提醒</div>
        <div style="font-size:24px;font-weight:700;color:${R};margin-top:2px;">${u}</div>
      </div>
    </div>
    <div style="margin-top:auto;display:flex;gap:10px;justify-content:flex-end;">
      <button class="gb-wr-close" style="
        padding:10px 18px;border-radius:10px;font-size:14px;cursor:pointer;
        background:transparent;color:${_};border:1px solid ${k};
        font-family:'Microsoft YaHei','PingFang SC',sans-serif;font-weight:500;
      ">稍后再看</button>
      <button class="gb-wr-open" style="
        padding:10px 22px;border-radius:10px;font-size:14px;font-weight:600;cursor:pointer;
        background:${x};color:${E};border:none;
        font-family:'Microsoft YaHei','PingFang SC',sans-serif;
        box-shadow:0 4px 12px ${x}40;
      ">查看完整周报</button>
    </div>
  `,N.appendChild(v),c.appendChild(S),requestAnimationFrame(()=>{v.style.opacity="1",v.style.transform="translateY(0)"});const z=()=>{v.style.opacity="0",v.style.transform="translateY(20px)",setTimeout(()=>S.remove(),700)};N.querySelector(".gb-wr-close")?.addEventListener("click",z),N.querySelector(".gb-wr-open")?.addEventListener("click",()=>{chrome.runtime.sendMessage({type:"OPEN_WEEKLY_REPORT"}),z()}),setTimeout(()=>{S.parentElement&&z()},t*1e3)}async function gt(t,r,n,s,a){try{const i=(await chrome.storage.local.get("interactionLog")).interactionLog||[];if(i.push({timestamp:Date.now(),action:t,taskType:r,shownDurationMs:n,reason:s,style:a}),i.length>1e3&&i.splice(0,i.length-1e3),await chrome.storage.local.set({interactionLog:i}),t==="completed"){const d=(await chrome.storage.local.get("plantGrowth")).plantGrowth||{level:0,totalCompletions:0,unlockedForms:[]};d.totalCompletions+=1,d.level=Math.floor(d.totalCompletions/10),await chrome.storage.local.set({plantGrowth:d})}}catch(o){console.error("[GreenBreathe] Error logging interaction:",o)}}chrome.runtime.onMessage.addListener((t,r,n)=>{if(t.type==="SHOW_NOTIFICATION")return G(t.data,0,t.inkDuration,t.cardDisplayDuration).then(()=>n({success:!0})).catch(s=>n({success:!1,error:s.message})),!0;if(t.type==="SHOW_WEEKLY_REPORT_CARD")return pt(t.cardDisplayDuration).then(()=>n({success:!0})).catch(s=>n({success:!1,error:s.message})),!0});const et=document.createElement("style");et.textContent=`
  #green-breathe-notification-root {
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    z-index: 2147483647; pointer-events: none;
  }
  #green-breathe-notification-root .green-breathe-notification {
    position: absolute; pointer-events: none;
  }
  #green-breathe-notification-root .top_right { top: 32px; right: 32px; }
  #green-breathe-notification-root .top_left { top: 32px; left: 32px; }
  #green-breathe-notification-root .bottom_right { bottom: 32px; right: 32px; }
  #green-breathe-notification-root .bottom_left { bottom: 32px; left: 32px; }
  #green-breathe-notification-root .center {
    top: 50%; left: 50%; transform: translate(-50%, -50%);
  }
`,document.head.appendChild(et),console.log("[GreenBreathe Content] Script ready")}
