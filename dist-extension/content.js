console.log("[GreenBreathe Content] Script loaded on:",window.location.href);function T(){const e=document.createElement("div");return e.id="green-breathe-notification-root",document.body.appendChild(e),e}function S(){if(document.fullscreenElement)return console.log("[GreenBreathe] Delayed: Fullscreen detected"),!0;const e=document.activeElement;if(e&&(e.tagName==="INPUT"||e.tagName==="TEXTAREA"||e.getAttribute("contenteditable")==="true"))return console.log("[GreenBreathe] Delayed: User is typing"),!0;const i=document.querySelectorAll("video");for(const o of i){const a=o.getBoundingClientRect(),c=a.width>200&&a.height>150;if(!o.paused&&o.currentTime>0&&c)return console.log("[GreenBreathe] Delayed: Video playing"),!0}const t=document.querySelectorAll("audio");for(const o of t)if(!o.paused&&o.currentTime>0)return console.log("[GreenBreathe] Delayed: Audio playing"),!0;return navigator.mediaDevices&&document.querySelector("video[autoplay]")?(console.log("[GreenBreathe] Delayed: Video call detected"),!0):document.querySelectorAll('form[data-submitting="true"]').length>0?(console.log("[GreenBreathe] Delayed: Form submitting"),!0):(console.log("[GreenBreathe] ✓ Safe to show notification"),!1)}let f=0,g=0;document.addEventListener("mousemove",()=>{f=Date.now()},{passive:!0});document.addEventListener("scroll",()=>{g=Date.now()},{passive:!0});function k(){const e=Date.now();return e-f<5e3||e-g<5e3}async function l(e,i=0){if(S()&&i<3){console.log(`[GreenBreathe] Retry attempt ${i+1}/3 after 30s`),setTimeout(()=>l(e,i+1),3e4);return}if(k()&&i===0){console.log("[GreenBreathe] User actively interacting, delaying 10s"),setTimeout(()=>l(e,i),1e4);return}const r=(await chrome.storage.local.get("userProfile")).userProfile?.notificationPosition||"top_right",n=await B(e,r);let o=document.getElementById("green-breathe-notification-root");o||(o=T()),o.innerHTML="",o.appendChild(n),setTimeout(()=>{const a=n.shadowRoot?.querySelector(".notification-card");a&&a.classList.add("show")},100),setTimeout(()=>{p(n)},8e3)}async function B(e,i){const t=document.createElement("div");t.className=`green-breathe-notification ${i}`;const r=t.attachShadow({mode:"open"}),n=await chrome.storage.local.get("userProfile"),o=n.userProfile?.mbtiType||"INFP",a=n.userProfile?.cardSize||"medium",c={small:{width:960,height:570},medium:{width:1280,height:760},large:{width:1600,height:950}},{width:m,height:b}=c[a],x=o.includes("T"),y=o.includes("N");let s="";x?s=e.instruction.mbtiAdaptation.T:y?s=e.instruction.mbtiAdaptation.N:s=e.instruction.mbtiAdaptation.F;const d=["了解啦","谢谢关心","OK","收到","这就去"],v=d[Math.floor(Math.random()*d.length)],u=["https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100003000/a4ec.png","https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100003000/f5db.png","https://grazia-prod.oss-ap-southeast-1.aliyuncs.com/resources/uid_100003000/e7ab.png"],w=u[Math.floor(Math.random()*u.length)];return r.innerHTML=`
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      @keyframes inkWashSpread {
        0% {
          opacity: 0;
          filter: blur(30px) contrast(1.2) brightness(1.2);
          transform: scale(1.05);
        }
        40% {
          opacity: 0.6;
          filter: blur(15px) contrast(1.1) brightness(1.1);
        }
        100% {
          opacity: 1;
          filter: blur(0px) contrast(1) brightness(1);
          transform: scale(1);
        }
      }

      @keyframes inkWashText {
        0% {
          opacity: 0;
          filter: blur(12px);
          transform: translateY(10px);
        }
        40% {
          opacity: 0;
          filter: blur(12px);
          transform: translateY(10px);
        }
        100% {
          opacity: 1;
          filter: blur(0px);
          transform: translateY(0);
        }
      }
      
      /* 🎨 整体卡片：根据用户设置调整尺寸，背景图片覆盖整张卡片 */
      .notification-card {
        width: ${m}px;
        height: ${b}px;
        border-radius: 24px;
        box-shadow: 
          0 30px 60px rgba(0, 0, 0, 0.2),
          0 0 0 1px rgba(255, 255, 255, 0.15);
        font-family: 'Microsoft YaHei', 'PingFang SC', 'Helvetica Neue', sans-serif;
        opacity: 0;
        position: relative;
        overflow: hidden;
        /* 🎯 核心：仅卡片本体可交互，不阻挡页面 */
        pointer-events: none;
        display: flex;
        flex-direction: column;
        justify-content: flex-end; /* 内容靠下对齐 */
        
        /* 清晰的翠绿风景背景，覆盖整张卡片 */
        background-image: url('${w}');
        background-size: cover;
        background-position: center;
      }
      
      .notification-card.show {
        animation: inkWashSpread 2.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }
      
      /* 🎨 文本框区域：毛玻璃质感，只占整个窗口的 30% */
      .content-box {
        position: relative;
        z-index: 1;
        width: 100%;
        height: 30%; /* 严格控制占比 30% */
        padding: 40px 60px;
        
        /* 毛玻璃效果：白色半透明底色，让文字清晰，同时透出背景 */
        background: rgba(255, 255, 255, 0.75);
        backdrop-filter: blur(20px) saturate(120%);
        -webkit-backdrop-filter: blur(20px) saturate(120%);
        border-top: 1px solid rgba(255, 255, 255, 0.4);
        
        display: flex;
        flex-direction: column;
        justify-content: center;
      }
      
      .notification-card.show .content-box {
        animation: inkWashText 2.5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
      }
      
      .encouragement {
        font-size: 32px;
        line-height: 1.5;
        margin-bottom: 16px;
        font-weight: 600;
        letter-spacing: 1px;
        color: #1a331a; /* 深翠绿色文字 */
      }
      
      .instruction {
        color: #3a5a3a; /* 柔和的绿色 */
        font-size: 20px;
        margin-bottom: 24px;
        line-height: 1.5;
        font-weight: 400;
      }
      
      .actions {
        pointer-events: auto;
        align-self: flex-end;
        margin-top: auto;
      }
      
      .action-btn {
        padding: 12px 40px;
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid rgba(150, 200, 150, 0.4);
        border-radius: 100px;
        color: #2c4c2c;
        font-size: 18px;
        font-family: 'Microsoft YaHei', 'PingFang SC', sans-serif;
        cursor: pointer;
        transition: all 0.3s ease;
        font-weight: 500;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
      }
      
      .action-btn:hover {
        background: #ffffff;
        border-color: #8fbc8f;
        transform: translateY(-2px);
        box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
      }
    </style>
    
    <div class="notification-card">
      <div class="content-box">
        <div class="encouragement">${e.encouragement}</div>
        <div class="instruction">${e.instruction.instruction} · ${s}</div>
        <div class="actions">
          <button class="action-btn action-dismiss">${v}</button>
        </div>
      </div>
    </div>
  `,r.querySelector(".action-dismiss")?.addEventListener("click",()=>{N("dismissed",e.taskType),p(t)}),t}function p(e){const t=e.shadowRoot?.querySelector(".notification-card");t&&(t.style.animation="none",t.style.transition="all 1.5s cubic-bezier(0.22, 1, 0.36, 1)",t.style.opacity="0",t.style.filter="blur(10px)",t.style.transform="scale(0.95)"),setTimeout(()=>{e.remove()},2e3)}async function N(e,i){try{const t={timestamp:Date.now(),action:e,taskType:i},n=(await chrome.storage.local.get("interactionLog")).interactionLog||[];n.push(t),n.length>100&&n.splice(0,n.length-100),await chrome.storage.local.set({interactionLog:n})}catch(t){console.error("Error logging interaction:",t)}}chrome.runtime.onMessage.addListener((e,i,t)=>{if(e.type==="SHOW_NOTIFICATION")return console.log("[GreenBreathe Content] Received SHOW_NOTIFICATION message",e.data),l(e.data).then(()=>{console.log("[GreenBreathe Content] Notification displayed successfully"),t({success:!0})}).catch(r=>{console.error("[GreenBreathe Content] Error showing notification:",r),t({success:!1,error:r.message})}),!0});const h=document.createElement("style");h.textContent=`
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
`;document.head.appendChild(h);console.log("GreenBreathe Content Script Loaded");
