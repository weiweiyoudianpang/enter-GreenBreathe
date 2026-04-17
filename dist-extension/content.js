function v(){const t=document.createElement("div");return t.id="green-breathe-notification-root",document.body.appendChild(t),t}function w(){if(document.fullscreenElement)return console.log("[GreenBreathe] Delayed: Fullscreen detected"),!0;const t=document.activeElement;if(t&&(t.tagName==="INPUT"||t.tagName==="TEXTAREA"||t.getAttribute("contenteditable")==="true"))return console.log("[GreenBreathe] Delayed: User is typing"),!0;const n=document.querySelectorAll("video");for(const i of n){const r=i.getBoundingClientRect(),s=r.width>200&&r.height>150;if(!i.paused&&i.currentTime>0&&s)return console.log("[GreenBreathe] Delayed: Video playing"),!0}const e=document.querySelectorAll("audio");for(const i of e)if(!i.paused&&i.currentTime>0)return console.log("[GreenBreathe] Delayed: Audio playing"),!0;return navigator.mediaDevices&&document.querySelector("video[autoplay]")?(console.log("[GreenBreathe] Delayed: Video call detected"),!0):document.querySelectorAll('form[data-submitting="true"]').length>0?(console.log("[GreenBreathe] Delayed: Form submitting"),!0):(console.log("[GreenBreathe] ✓ Safe to show notification"),!1)}let p=0,u=0;document.addEventListener("mousemove",()=>{p=Date.now()},{passive:!0});document.addEventListener("scroll",()=>{u=Date.now()},{passive:!0});function k(){const t=Date.now();return t-p<5e3||t-u<5e3}async function d(t,n=0){if(w()&&n<3){console.log(`[GreenBreathe] Retry attempt ${n+1}/3 after 30s`),setTimeout(()=>d(t,n+1),3e4);return}if(k()&&n===0){console.log("[GreenBreathe] User actively interacting, delaying 10s"),setTimeout(()=>d(t,n),1e4);return}const a=(await chrome.storage.local.get("userProfile")).userProfile?.notificationPosition||"top_right",o=await S(t,a);let i=document.getElementById("green-breathe-notification-root");i||(i=v()),i.innerHTML="",i.appendChild(o),setTimeout(()=>{const r=o.shadowRoot?.querySelector(".notification-card");r&&r.classList.add("show")},100),setTimeout(()=>{c(o)},8e3)}async function S(t,n){const e=document.createElement("div");e.className=`green-breathe-notification ${n}`;const a=e.attachShadow({mode:"open"}),o=await chrome.storage.local.get("userProfile");o.userProfile?.nickname;const i=o.userProfile?.mbtiType||"INFP",r=N(t,i),s=["了解啦~","知道啦","谢谢提醒","OK"],m=s[Math.floor(Math.random()*s.length)],f=T(t.taskType),h=new Date().toLocaleTimeString("zh-CN",{hour:"2-digit",minute:"2-digit"});a.innerHTML=`
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      /* 🎨 水墨审美：毛玻璃 + 晕染效果 */
      .notification-card {
        width: 260px;
        background: rgba(255, 255, 255, 0.92);
        backdrop-filter: blur(12px) saturate(180%);
        -webkit-backdrop-filter: blur(12px) saturate(180%);
        border-radius: 16px;
        padding: 18px;
        box-shadow: 
          0 8px 32px rgba(100, 180, 100, 0.12),
          0 2px 8px rgba(100, 180, 100, 0.08);
        border: 1px solid rgba(100, 180, 100, 0.2);
        font-family: 'Source Han Serif CN', 'Noto Serif SC', Georgia, serif;
        opacity: 0;
        transform: translateY(-20px) scale(0.95);
        transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
        position: relative;
        overflow: hidden;
        /* 🎯 核心：仅卡片本体可交互，不阻挡页面 */
        pointer-events: auto;
      }
      
      .notification-card.show {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      
      /* 🎨 水墨晕染背景 - 三层叠加 */
      .ink-wash-bg {
        position: absolute;
        top: -30px;
        left: -30px;
        right: -30px;
        bottom: -30px;
        background-image: url('${chrome.runtime.getURL("images/ink-wash.png")}');
        background-size: 120%;
        background-position: center;
        opacity: 0;
        pointer-events: none;
        z-index: 0;
        animation: inkSpread 0.8s ease-out forwards;
      }
      
      @keyframes inkSpread {
        0% {
          opacity: 0;
          transform: scale(0.8);
        }
        50% {
          opacity: 0.06;
        }
        100% {
          opacity: 0.12;
          transform: scale(1);
        }
      }
      
      /* 🌱 植物成长动画容器 */
      .plant-growth {
        position: absolute;
        bottom: 16px;
        right: 16px;
        width: 32px;
        height: 32px;
        opacity: 0.6;
        pointer-events: none;
        z-index: 2;
      }
      
      .plant-svg {
        width: 100%;
        height: 100%;
      }
      
      .plant-path {
        stroke: #64b464;
        stroke-width: 2;
        fill: none;
        stroke-linecap: round;
        stroke-linejoin: round;
        stroke-dasharray: 100;
        stroke-dashoffset: 100;
        animation: plantGrow 2s ease-out forwards;
      }
      
      @keyframes plantGrow {
        to {
          stroke-dashoffset: 0;
        }
      }
      
      .content {
        position: relative;
        z-index: 1;
      }
      
      .header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
        color: #64b464;
        font-size: 12px;
      }
      
      .title {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      
      .plant-icon {
        font-size: 16px;
      }
      
      .time {
        opacity: 0.6;
      }
      
      .encouragement {
        color: #2d5a2d;
        font-size: 14px;
        line-height: 1.6;
        margin-bottom: 12px;
        font-weight: 500;
      }
      
      .instruction-box {
        background: rgba(100, 180, 100, 0.08);
        border-left: 3px solid #64b464;
        padding: 10px;
        margin-bottom: 12px;
        border-radius: 4px;
      }
      
      .instruction {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #2d5a2d;
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 6px;
      }
      
      .task-icon {
        font-size: 16px;
      }
      
      .science {
        font-size: 11px;
        color: #5a7a5a;
        line-height: 1.4;
        font-family: 'Source Han Sans CN', 'Noto Sans SC', sans-serif;
      }
      
      .source {
        font-size: 10px;
        color: #8a9a8a;
        margin-top: 2px;
      }
      
      .actions {
        display: flex;
        gap: 8px;
        pointer-events: auto;
      }
      
      button {
        flex: 1;
        padding: 8px 12px;
        border: none;
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
        font-family: 'Source Han Sans CN', 'Noto Sans SC', sans-serif;
      }
      
      .btn-primary {
        background: rgba(100, 180, 100, 0.15);
        color: #2d5a2d;
        border: 1px solid rgba(100, 180, 100, 0.3);
      }
      
      .btn-primary:hover {
        background: rgba(100, 180, 100, 0.25);
        transform: translateY(-1px);
      }
      
      .btn-secondary {
        background: rgba(100, 180, 100, 0.8);
        color: white;
        font-weight: 500;
      }
      
      .btn-secondary:hover {
        background: rgba(100, 180, 100, 1);
        transform: translateY(-1px);
      }
      
      .btn-tertiary {
        background: transparent;
        color: #5a7a5a;
        border: 1px solid rgba(100, 180, 100, 0.2);
      }
      
      .btn-tertiary:hover {
        background: rgba(100, 180, 100, 0.1);
      }
    </style>
    
    <div class="notification-card">
      <div class="ink-wash-bg"></div>
      <div class="content">
        <div class="header">
          <div class="title">
            <span class="plant-icon">🌿</span>
            <span>青植关怀 · ${i}</span>
          </div>
          <div class="time">${h}</div>
        </div>
        
        <div class="encouragement">${t.encouragement}</div>
        
        <div class="instruction-box">
          <div class="instruction">
            <span class="task-icon">${f}</span>
            <span>${t.instruction.instruction}</span>
          </div>
          <div class="science">
            ${r}
          </div>
          <div class="source">(${t.instruction.source})</div>
        </div>
        
        <div class="actions">
          <button class="btn-primary action-dismiss">${m}</button>
          <button class="btn-secondary action-complete">已完成 ✓</button>
          <button class="btn-tertiary action-snooze">稍后</button>
        </div>
      </div>
    </div>
  `,a.querySelector(".notification-card");const b=a.querySelector(".action-dismiss"),x=a.querySelector(".action-complete"),y=a.querySelector(".action-snooze");return b?.addEventListener("click",()=>{l("dismissed",t.taskType),c(e)}),x?.addEventListener("click",()=>{l("completed",t.taskType),c(e)}),y?.addEventListener("click",()=>{l("snoozed",t.taskType),c(e)}),e}function T(t){switch(t){case"hydration":return"💧";case"eyeCare":return"👁️";case"movement":return"🏃";default:return"🌿"}}function N(t,n){const e=n.includes("T"),a=n.includes("N");let o="";return e?o=t.instruction.mbtiAdaptation.T:a?o=t.instruction.mbtiAdaptation.N:o=t.instruction.mbtiAdaptation.F,`${o} <br/><small>↑ ${t.instruction.scienceBasis}</small>`}function c(t){const e=t.shadowRoot?.querySelector(".notification-card");e&&(e.style.opacity="0",e.style.transform="translateY(-20px)"),setTimeout(()=>{t.remove()},800)}async function l(t,n){try{const e={timestamp:Date.now(),action:t,taskType:n},o=(await chrome.storage.local.get("interactionLog")).interactionLog||[];if(o.push(e),o.length>100&&o.splice(0,o.length-100),await chrome.storage.local.set({interactionLog:o}),t==="completed"){const r=(await chrome.storage.local.get("plantGrowth")).plantGrowth||{level:0,totalCompletions:0,unlockedForms:[]};r.totalCompletions+=1,r.level=Math.floor(r.totalCompletions/10),await chrome.storage.local.set({plantGrowth:r})}}catch(e){console.error("Error logging interaction:",e)}}chrome.runtime.onMessage.addListener((t,n,e)=>{t.type==="SHOW_NOTIFICATION"&&(d(t.data),e({success:!0}))});const g=document.createElement("style");g.textContent=`
  #green-breathe-notification-root {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2147483647;
    pointer-events: none;
  }
  
  #green-breathe-notification-root .green-breathe-notification {
    position: absolute;
    pointer-events: auto;
  }
  
  #green-breathe-notification-root .top_right {
    top: 20px;
    right: 20px;
  }
  
  #green-breathe-notification-root .top_left {
    top: 20px;
    left: 20px;
  }
  
  #green-breathe-notification-root .bottom_right {
    bottom: 20px;
    right: 20px;
  }
  
  #green-breathe-notification-root .bottom_left {
    bottom: 20px;
    left: 20px;
  }
`;document.head.appendChild(g);console.log("GreenBreathe Content Script Loaded");
