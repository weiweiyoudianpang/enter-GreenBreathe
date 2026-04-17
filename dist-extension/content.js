function x(){const e=document.createElement("div");return e.id="green-breathe-notification-root",document.body.appendChild(e),e}function v(){if(document.fullscreenElement)return console.log("[GreenBreathe] Delayed: Fullscreen detected"),!0;const e=document.activeElement;if(e&&(e.tagName==="INPUT"||e.tagName==="TEXTAREA"||e.getAttribute("contenteditable")==="true"))return console.log("[GreenBreathe] Delayed: User is typing"),!0;const n=document.querySelectorAll("video");for(const o of n){const r=o.getBoundingClientRect(),c=r.width>200&&r.height>150;if(!o.paused&&o.currentTime>0&&c)return console.log("[GreenBreathe] Delayed: Video playing"),!0}const t=document.querySelectorAll("audio");for(const o of t)if(!o.paused&&o.currentTime>0)return console.log("[GreenBreathe] Delayed: Audio playing"),!0;return navigator.mediaDevices&&document.querySelector("video[autoplay]")?(console.log("[GreenBreathe] Delayed: Video call detected"),!0):document.querySelectorAll('form[data-submitting="true"]').length>0?(console.log("[GreenBreathe] Delayed: Form submitting"),!0):(console.log("[GreenBreathe] ✓ Safe to show notification"),!1)}let f=0,g=0;document.addEventListener("mousemove",()=>{f=Date.now()},{passive:!0});document.addEventListener("scroll",()=>{g=Date.now()},{passive:!0});function y(){const e=Date.now();return e-f<5e3||e-g<5e3}async function l(e,n=0){if(v()&&n<3){console.log(`[GreenBreathe] Retry attempt ${n+1}/3 after 30s`),setTimeout(()=>l(e,n+1),3e4);return}if(y()&&n===0){console.log("[GreenBreathe] User actively interacting, delaying 10s"),setTimeout(()=>l(e,n),1e4);return}const a=(await chrome.storage.local.get("userProfile")).userProfile?.notificationPosition||"top_right",i=await w(e,a);let o=document.getElementById("green-breathe-notification-root");o||(o=x()),o.innerHTML="",o.appendChild(i),setTimeout(()=>{const r=i.shadowRoot?.querySelector(".notification-card");r&&r.classList.add("show")},100),setTimeout(()=>{m(i)},8e3)}async function w(e,n){const t=document.createElement("div");t.className=`green-breathe-notification ${n}`;const a=t.attachShadow({mode:"open"}),o=(await chrome.storage.local.get("userProfile")).userProfile?.mbtiType||"INFP",r=o.includes("T"),c=o.includes("N");let s="";r?s=e.instruction.mbtiAdaptation.T:c?s=e.instruction.mbtiAdaptation.N:s=e.instruction.mbtiAdaptation.F;const d=["了解啦","谢谢关心","OK","收到","这就去"],h=d[Math.floor(Math.random()*d.length)],u=["images/glass-plant-1.png","images/glass-plant-2.png"],b=u[Math.floor(Math.random()*u.length)];return a.innerHTML=`
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      /* 🎨 整体卡片：背景图片覆盖整张卡片 */
      .notification-card {
        width: 420px;
        min-height: 240px;
        border-radius: 20px;
        box-shadow: 
          0 20px 40px rgba(0, 0, 0, 0.15),
          0 0 0 1px rgba(255, 255, 255, 0.2);
        font-family: 'Microsoft YaHei', 'PingFang SC', 'Helvetica Neue', sans-serif;
        opacity: 0;
        transform: scale(0.95);
        transition: all 1.5s cubic-bezier(0.22, 1, 0.36, 1);
        position: relative;
        overflow: hidden;
        /* 🎯 核心：仅卡片本体可交互，不阻挡页面 */
        pointer-events: none;
        display: flex;
        flex-direction: column;
        justify-content: flex-end; /* 内容靠下对齐，留出上方风景 */
        
        /* 清晰的翠绿风景背景，覆盖整张卡片 */
        background-image: url('${chrome.runtime.getURL(b)}');
        background-size: cover;
        background-position: center;
      }
      
      .notification-card.show {
        opacity: 1;
        transform: scale(1);
      }
      
      /* 🎨 文本框区域：毛玻璃质感，只在文字区域 */
      .content-box {
        position: relative;
        z-index: 1;
        width: 100%;
        padding: 28px 32px;
        
        /* 毛玻璃效果：白色半透明底色，让文字清晰，同时透出背景 */
        background: rgba(255, 255, 255, 0.75);
        backdrop-filter: blur(16px) saturate(120%);
        -webkit-backdrop-filter: blur(16px) saturate(120%);
        border-top: 1px solid rgba(255, 255, 255, 0.4);
        
        display: flex;
        flex-direction: column;
      }
      
      .encouragement {
        font-size: 20px;
        line-height: 1.5;
        margin-bottom: 12px;
        font-weight: 600;
        letter-spacing: 1px;
        color: #1a331a; /* 深翠绿色文字 */
      }
      
      .instruction {
        color: #3a5a3a; /* 柔和的绿色 */
        font-size: 14px;
        margin-bottom: 20px;
        line-height: 1.5;
        font-weight: 400;
      }
      
      .actions {
        pointer-events: auto;
        align-self: flex-end;
      }
      
      .action-btn {
        padding: 8px 28px;
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid rgba(150, 200, 150, 0.4);
        border-radius: 100px;
        color: #2c4c2c;
        font-size: 14px;
        font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 500;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
      }
      
      .action-btn:hover {
        background: #ffffff;
        border-color: #8fbc8f;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      }
    </style>
    
    <div class="notification-card">
      <div class="content-box">
        <div class="encouragement">${e.encouragement}</div>
        <div class="instruction">${e.instruction.instruction} · ${s}</div>
        <div class="actions">
          <button class="action-btn action-dismiss">${h}</button>
        </div>
      </div>
    </div>
  `,a.querySelector(".action-dismiss")?.addEventListener("click",()=>{T("dismissed",e.taskType),m(t)}),t}function m(e){const t=e.shadowRoot?.querySelector(".notification-card");t&&(t.style.opacity="0",t.style.filter="blur(10px)",t.style.transform="scale(0.95)"),setTimeout(()=>{e.remove()},2e3)}async function T(e,n){try{const t={timestamp:Date.now(),action:e,taskType:n},i=(await chrome.storage.local.get("interactionLog")).interactionLog||[];i.push(t),i.length>100&&i.splice(0,i.length-100),await chrome.storage.local.set({interactionLog:i})}catch(t){console.error("Error logging interaction:",t)}}chrome.runtime.onMessage.addListener((e,n,t)=>{e.type==="SHOW_NOTIFICATION"&&(l(e.data),t({success:!0}))});const p=document.createElement("style");p.textContent=`
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
    pointer-events: none;
  }
  
  #green-breathe-notification-root .top_right {
    top: 32px;
    right: 32px;
  }
  
  #green-breathe-notification-root .top_left {
    top: 32px;
    left: 32px;
  }
  
  #green-breathe-notification-root .bottom_right {
    bottom: 32px;
    right: 32px;
  }
  
  #green-breathe-notification-root .bottom_left {
    bottom: 32px;
    left: 32px;
  }
`;document.head.appendChild(p);console.log("GreenBreathe Content Script Loaded");
