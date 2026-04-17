function h(){const e=document.createElement("div");return e.id="green-breathe-notification-root",document.body.appendChild(e),e}function b(){if(document.fullscreenElement)return console.log("[GreenBreathe] Delayed: Fullscreen detected"),!0;const e=document.activeElement;if(e&&(e.tagName==="INPUT"||e.tagName==="TEXTAREA"||e.getAttribute("contenteditable")==="true"))return console.log("[GreenBreathe] Delayed: User is typing"),!0;const i=document.querySelectorAll("video");for(const o of i){const a=o.getBoundingClientRect(),c=a.width>200&&a.height>150;if(!o.paused&&o.currentTime>0&&c)return console.log("[GreenBreathe] Delayed: Video playing"),!0}const t=document.querySelectorAll("audio");for(const o of t)if(!o.paused&&o.currentTime>0)return console.log("[GreenBreathe] Delayed: Audio playing"),!0;return navigator.mediaDevices&&document.querySelector("video[autoplay]")?(console.log("[GreenBreathe] Delayed: Video call detected"),!0):document.querySelectorAll('form[data-submitting="true"]').length>0?(console.log("[GreenBreathe] Delayed: Form submitting"),!0):(console.log("[GreenBreathe] ✓ Safe to show notification"),!1)}let u=0,m=0;document.addEventListener("mousemove",()=>{u=Date.now()},{passive:!0});document.addEventListener("scroll",()=>{m=Date.now()},{passive:!0});function y(){const e=Date.now();return e-u<5e3||e-m<5e3}async function l(e,i=0){if(b()&&i<3){console.log(`[GreenBreathe] Retry attempt ${i+1}/3 after 30s`),setTimeout(()=>l(e,i+1),3e4);return}if(y()&&i===0){console.log("[GreenBreathe] User actively interacting, delaying 10s"),setTimeout(()=>l(e,i),1e4);return}(await chrome.storage.local.get("userProfile")).userProfile?.notificationPosition;const r=await v(e);let n=document.getElementById("green-breathe-notification-root");n||(n=h()),n.innerHTML="",n.appendChild(r),setTimeout(()=>{const o=r.shadowRoot?.querySelector(".notification-card");o&&o.classList.add("show")},100),setTimeout(()=>{f(r)},8e3)}async function v(e,i){const t=document.createElement("div");t.className="green-breathe-notification center";const r=t.attachShadow({mode:"open"}),o=(await chrome.storage.local.get("userProfile")).userProfile?.mbtiType||"INFP",a=o.includes("T"),c=o.includes("N");let s="";a?s=e.instruction.mbtiAdaptation.T:c?s=e.instruction.mbtiAdaptation.N:s=e.instruction.mbtiAdaptation.F;const d=["了解啦","谢谢关心","OK","收到","这就去"],p=d[Math.floor(Math.random()*d.length)];return r.innerHTML=`
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      /* 🎨 水墨审美：毛玻璃 + 晕染效果 */
      .notification-card {
        width: 800px;
        max-width: 90vw;
        min-height: 400px;
        background: rgba(255, 255, 255, 0.35);
        backdrop-filter: blur(30px) saturate(120%);
        -webkit-backdrop-filter: blur(30px) saturate(120%);
        border-radius: 24px;
        padding: 80px 60px;
        box-shadow: 
          0 20px 60px rgba(0, 0, 0, 0.05),
          inset 0 0 0 1px rgba(255, 255, 255, 0.4);
        font-family: 'STKaiti', 'KaiTi', '楷体', 'Source Han Serif CN', 'Noto Serif SC', serif;
        opacity: 0;
        filter: blur(20px);
        transform: scale(0.95);
        transition: all 2s cubic-bezier(0.22, 1, 0.36, 1);
        position: relative;
        overflow: hidden;
        /* 🎯 核心：仅卡片本体可交互，不阻挡页面 */
        pointer-events: none;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
      }
      
      .notification-card.show {
        opacity: 1;
        filter: blur(0);
        transform: scale(1);
      }
      
      /* 🎨 水墨风景画背景 */
      .ink-wash-bg {
        position: absolute;
        inset: 0;
        background-image: url('${chrome.runtime.getURL("images/ink-wash-mountain.png")}');
        background-size: cover;
        background-position: center;
        opacity: 0.15;
        mix-blend-mode: multiply;
        pointer-events: none;
        z-index: 0;
      }
      
      .content {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        width: 100%;
      }
      
      .encouragement {
        color: #1a2f1a;
        font-size: 36px;
        line-height: 1.6;
        margin-bottom: 30px;
        font-weight: 600;
        letter-spacing: 3px;
        text-shadow: 0 2px 15px rgba(255,255,255,0.9);
      }
      
      .instruction {
        color: #3a5f3a;
        font-size: 22px;
        margin-bottom: 50px;
        opacity: 0.85;
        letter-spacing: 2px;
      }
      
      .actions {
        pointer-events: auto;
      }
      
      .action-btn {
        padding: 14px 48px;
        background: transparent;
        border: 1px solid rgba(26, 47, 26, 0.3);
        border-radius: 100px;
        color: #1a2f1a;
        font-size: 20px;
        font-family: inherit;
        cursor: pointer;
        transition: all 0.5s ease;
        letter-spacing: 2px;
      }
      
      .action-btn:hover {
        background: rgba(26, 47, 26, 0.08);
        border-color: rgba(26, 47, 26, 0.6);
        transform: translateY(-2px);
      }
    </style>
    
    <div class="notification-card">
      <div class="ink-wash-bg"></div>
      <div class="content">
        <div class="encouragement">${e.encouragement}</div>
        <div class="instruction">${e.instruction.instruction} · ${s}</div>
        <div class="actions">
          <button class="action-btn action-dismiss">${p}</button>
        </div>
      </div>
    </div>
  `,r.querySelector(".action-dismiss")?.addEventListener("click",()=>{x("dismissed",e.taskType),f(t)}),t}function f(e){const t=e.shadowRoot?.querySelector(".notification-card");t&&(t.style.opacity="0",t.style.filter="blur(10px)",t.style.transform="scale(0.95)"),setTimeout(()=>{e.remove()},2e3)}async function x(e,i){try{const t={timestamp:Date.now(),action:e,taskType:i},n=(await chrome.storage.local.get("interactionLog")).interactionLog||[];n.push(t),n.length>100&&n.splice(0,n.length-100),await chrome.storage.local.set({interactionLog:n})}catch(t){console.error("Error logging interaction:",t)}}chrome.runtime.onMessage.addListener((e,i,t)=>{e.type==="SHOW_NOTIFICATION"&&(l(e.data),t({success:!0}))});const g=document.createElement("style");g.textContent=`
  #green-breathe-notification-root {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 2147483647;
    pointer-events: none;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  #green-breathe-notification-root .green-breathe-notification {
    position: relative;
    pointer-events: none;
  }
`;document.head.appendChild(g);console.log("GreenBreathe Content Script Loaded");
