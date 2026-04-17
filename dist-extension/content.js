function b(){const e=document.createElement("div");return e.id="green-breathe-notification-root",document.body.appendChild(e),e}function h(){if(document.fullscreenElement)return console.log("[GreenBreathe] Delayed: Fullscreen detected"),!0;const e=document.activeElement;if(e&&(e.tagName==="INPUT"||e.tagName==="TEXTAREA"||e.getAttribute("contenteditable")==="true"))return console.log("[GreenBreathe] Delayed: User is typing"),!0;const i=document.querySelectorAll("video");for(const o of i){const r=o.getBoundingClientRect(),c=r.width>200&&r.height>150;if(!o.paused&&o.currentTime>0&&c)return console.log("[GreenBreathe] Delayed: Video playing"),!0}const t=document.querySelectorAll("audio");for(const o of t)if(!o.paused&&o.currentTime>0)return console.log("[GreenBreathe] Delayed: Audio playing"),!0;return navigator.mediaDevices&&document.querySelector("video[autoplay]")?(console.log("[GreenBreathe] Delayed: Video call detected"),!0):document.querySelectorAll('form[data-submitting="true"]').length>0?(console.log("[GreenBreathe] Delayed: Form submitting"),!0):(console.log("[GreenBreathe] ✓ Safe to show notification"),!1)}let u=0,p=0;document.addEventListener("mousemove",()=>{u=Date.now()},{passive:!0});document.addEventListener("scroll",()=>{p=Date.now()},{passive:!0});function x(){const e=Date.now();return e-u<5e3||e-p<5e3}async function l(e,i=0){if(h()&&i<3){console.log(`[GreenBreathe] Retry attempt ${i+1}/3 after 30s`),setTimeout(()=>l(e,i+1),3e4);return}if(x()&&i===0){console.log("[GreenBreathe] User actively interacting, delaying 10s"),setTimeout(()=>l(e,i),1e4);return}const a=(await chrome.storage.local.get("userProfile")).userProfile?.notificationPosition||"top_right",n=await y(e,a);let o=document.getElementById("green-breathe-notification-root");o||(o=b()),o.innerHTML="",o.appendChild(n),setTimeout(()=>{const r=n.shadowRoot?.querySelector(".notification-card");r&&r.classList.add("show")},100),setTimeout(()=>{g(n)},8e3)}async function y(e,i){const t=document.createElement("div");t.className=`green-breathe-notification ${i}`;const a=t.attachShadow({mode:"open"}),o=(await chrome.storage.local.get("userProfile")).userProfile?.mbtiType||"INFP",r=o.includes("T"),c=o.includes("N");let s="";r?s=e.instruction.mbtiAdaptation.T:c?s=e.instruction.mbtiAdaptation.N:s=e.instruction.mbtiAdaptation.F;const d=["了解啦","谢谢关心","OK","收到","这就去"],m=d[Math.floor(Math.random()*d.length)];return a.innerHTML=`
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      /* 🎨 翠绿森林毛玻璃美学 */
      .notification-card {
        width: 420px;
        min-height: 240px;
        background: rgba(15, 40, 20, 0.45); /* 深翠绿半透明底色 */
        backdrop-filter: blur(24px) saturate(150%);
        -webkit-backdrop-filter: blur(24px) saturate(150%);
        border-radius: 20px;
        padding: 40px 32px;
        box-shadow: 
          0 20px 40px rgba(0, 0, 0, 0.2),
          inset 0 1px 1px rgba(255, 255, 255, 0.15),
          inset 0 0 20px rgba(100, 200, 100, 0.05);
        border: 1px solid rgba(150, 220, 150, 0.15);
        font-family: 'STKaiti', 'KaiTi', '楷体', 'Source Han Serif CN', 'Noto Serif SC', serif;
        opacity: 0;
        filter: blur(10px);
        transform: scale(0.95);
        transition: all 1.5s cubic-bezier(0.22, 1, 0.36, 1);
        position: relative;
        overflow: hidden;
        /* 🎯 核心：仅卡片本体可交互，不阻挡页面 */
        pointer-events: none;
        display: flex;
        flex-direction: column;
        align-items: flex-start;
        justify-content: center;
      }
      
      .notification-card.show {
        opacity: 1;
        filter: blur(0);
        transform: scale(1);
      }
      
      /* 🎨 森林风景画背景 (叠加在毛玻璃底层) */
      .forest-bg {
        position: absolute;
        inset: 0;
        background-image: url('https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100003000/9c20.png');
        background-size: cover;
        background-position: center;
        opacity: 0.25;
        mix-blend-mode: overlay;
        pointer-events: none;
        z-index: 0;
      }
      
      .content {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        width: 100%;
      }
      
      /* 🌟 文字透出背景效果 (Text Clip) */
      .encouragement {
        font-size: 26px;
        line-height: 1.5;
        margin-bottom: 24px;
        font-weight: 600;
        letter-spacing: 2px;
        
        /* 核心：文字透明，透出背景图 */
        background-image: url('https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100003000/9c20.png');
        background-size: cover;
        background-position: center;
        background-attachment: fixed;
        color: transparent;
        -webkit-background-clip: text;
        background-clip: text;
        
        /* 柔和的发光背景，确保在任何底色上都清晰 */
        filter: drop-shadow(0 0 8px rgba(255, 255, 255, 0.8)) drop-shadow(0 0 2px rgba(255, 255, 255, 0.9));
      }
      
      .instruction {
        color: rgba(255, 255, 255, 0.9);
        font-size: 16px;
        margin-bottom: 32px;
        letter-spacing: 1.5px;
        text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        font-family: 'Source Han Sans CN', 'Noto Sans SC', sans-serif;
        font-weight: 300;
      }
      
      .actions {
        pointer-events: auto;
        align-self: flex-end;
      }
      
      .action-btn {
        padding: 10px 32px;
        background: rgba(255, 255, 255, 0.1);
        backdrop-filter: blur(10px);
        border: 1px solid rgba(255, 255, 255, 0.3);
        border-radius: 100px;
        color: #fff;
        font-size: 15px;
        font-family: 'Source Han Sans CN', 'Noto Sans SC', sans-serif;
        cursor: pointer;
        transition: all 0.4s ease;
        letter-spacing: 2px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
      }
      
      .action-btn:hover {
        background: rgba(255, 255, 255, 0.2);
        border-color: rgba(255, 255, 255, 0.6);
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(0, 0, 0, 0.15), 0 0 12px rgba(150, 255, 150, 0.2);
      }
    </style>
    
    <div class="notification-card">
      <div class="forest-bg"></div>
      <div class="content">
        <div class="encouragement">${e.encouragement}</div>
        <div class="instruction">${e.instruction.instruction} · ${s}</div>
        <div class="actions">
          <button class="action-btn action-dismiss">${m}</button>
        </div>
      </div>
    </div>
  `,a.querySelector(".action-dismiss")?.addEventListener("click",()=>{v("dismissed",e.taskType),g(t)}),t}function g(e){const t=e.shadowRoot?.querySelector(".notification-card");t&&(t.style.opacity="0",t.style.filter="blur(10px)",t.style.transform="scale(0.95)"),setTimeout(()=>{e.remove()},2e3)}async function v(e,i){try{const t={timestamp:Date.now(),action:e,taskType:i},n=(await chrome.storage.local.get("interactionLog")).interactionLog||[];n.push(t),n.length>100&&n.splice(0,n.length-100),await chrome.storage.local.set({interactionLog:n})}catch(t){console.error("Error logging interaction:",t)}}chrome.runtime.onMessage.addListener((e,i,t)=>{e.type==="SHOW_NOTIFICATION"&&(l(e.data),t({success:!0}))});const f=document.createElement("style");f.textContent=`
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
`;document.head.appendChild(f);console.log("GreenBreathe Content Script Loaded");
