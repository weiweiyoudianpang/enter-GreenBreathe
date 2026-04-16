// Demo Page Logic

const messages = {
  INTJ: {
    hydration: "系统检测到逻辑引擎冷却液不足，建议补充200ml",
    eyeCare: "视觉传感器疲劳度达阈值，执行20-20-20协议",
    movement: "战略休息：2分钟微运动，预计提升后续效率23%"
  },
  INTP: {
    hydration: "数据库连接需要润滑，补充水分以优化思维处理速度",
    eyeCare: "检测到视觉模块过热，建议远眺校准焦距",
    movement: "逻辑运算需要血氧支持，启动身体子系统运行"
  },
  INFP: {
    hydration: "你滋润了那么多心灵，也记得滋润自己呀~",
    eyeCare: "让目光穿越屏幕，去捕捉窗外的一片绿意和自由",
    movement: "身体想和你一起跳支小小的舞呢~"
  },
  INFJ: {
    hydration: "给疲惫的灵魂一杯清泉，让温柔从内而外流淌",
    eyeCare: "眼睛承载了太多情感，让它们休息片刻吧",
    movement: "身体也需要被理解和关怀，陪它活动一下"
  },
  ESTJ: {
    hydration: "执行补水任务：200ml，预计用时5秒，完成后效率提升",
    eyeCare: "护眼SOP：看远处20英尺，持续20秒，每20分钟执行",
    movement: "计划内休息时间：2分钟运动，保持最佳工作状态"
  },
  ENFP: {
    hydration: "喝杯水，让灵感继续冒泡吧！身体需要你的爱~",
    eyeCare: "眼睛想去冒险！带它看看窗外，会有惊喜哦~",
    movement: "来跳个舞吧！让身体和快乐一起飞起来！"
  },
  ISTP: {
    hydration: "工具需要保养，身体也是。补充水分，保持最佳状态",
    eyeCare: "切换焦点，观察远处一个物体的轮廓和细节",
    movement: "身体机能需要定期维护，执行简单运动程序"
  }
};

const instructions = {
  hydration: {
    icon: "💧",
    text: "饮用200ml温水",
    science: "轻度脱水（失水1-2%）会导致注意力下降17%",
    source: "Human Brain Mapping, 2018"
  },
  eyeCare: {
    icon: "👁️",
    text: "20-20-20法则",
    science: "每20分钟看20英尺外20秒，可有效缓解视疲劳",
    source: "Optometry and Vision Science, 2015"
  },
  movement: {
    icon: "🏃",
    text: "2分钟微运动",
    science: "短时运动可提升血液循环，改善认知功能",
    source: "British Journal of Sports Medicine, 2019"
  }
};

const actionButtons = ["了解啦~", "知道啦", "谢谢提醒", "OK"];

let currentNotification = null;

function getCurrentTime() {
  const now = new Date();
  return now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
}

function getRandomActionButton() {
  return actionButtons[Math.floor(Math.random() * actionButtons.length)];
}

function createNotification() {
  const mbtiType = document.getElementById('mbtiType').value;
  const taskType = document.getElementById('taskType').value;
  const position = document.getElementById('position').value;
  const nickname = document.getElementById('nickname').value || '朋友';
  
  const encouragement = messages[mbtiType][taskType];
  const instruction = instructions[taskType];
  const actionText = getRandomActionButton();
  const currentTime = getCurrentTime();
  
  const notification = document.createElement('div');
  notification.className = `notification ${position}`;
  
  notification.innerHTML = `
    <div class="ink-background"></div>
    <div class="notification-content">
      <div class="notification-header">
        <div class="notification-title">
          🌿 青植关怀 · ${mbtiType}
        </div>
        <div class="notification-time">${currentTime}</div>
      </div>
      
      <div class="notification-encouragement">
        ${encouragement}
      </div>
      
      <div class="instruction-box">
        <div class="instruction">
          <span>${instruction.icon}</span>
          <span>${instruction.text}</span>
        </div>
        <div class="science-text">
          ${instruction.science}
        </div>
        <div class="source-text">
          (${instruction.source})
        </div>
      </div>
      
      <div class="notification-actions">
        <button class="btn-acknowledge" onclick="handleAction('acknowledge')">${actionText}</button>
        <button class="btn-complete" onclick="handleAction('complete')">已完成 ✓</button>
        <button class="btn-later" onclick="handleAction('later')">稍后</button>
      </div>
    </div>
    
    <div class="plant-growth">
      <svg viewBox="0 0 24 24" class="plant-svg">
        <path class="plant-path" d="M 12 24 Q 12 15 12 6 M 8 8 L 16 8 M 7 13 L 17 13 M 9 18 L 15 18" />
      </svg>
    </div>
  `;
  
  return notification;
}

function showDemo() {
  // Remove existing notification
  if (currentNotification) {
    hideDemo();
    setTimeout(() => {
      showDemo();
    }, 300);
    return;
  }
  
  // Create and show notification
  currentNotification = createNotification();
  document.body.appendChild(currentNotification);
  
  // Trigger show animation
  setTimeout(() => {
    currentNotification.classList.add('show');
  }, 100);
  
  // Auto hide after 12 seconds
  setTimeout(() => {
    if (currentNotification && currentNotification.classList.contains('show')) {
      hideDemo();
    }
  }, 12000);
}

function hideDemo() {
  if (!currentNotification) return;
  
  currentNotification.classList.remove('show');
  
  setTimeout(() => {
    if (currentNotification && currentNotification.parentNode) {
      currentNotification.parentNode.removeChild(currentNotification);
    }
    currentNotification = null;
  }, 800);
}

function handleAction(type) {
  console.log(`[GreenBreathe Demo] Action: ${type}`);
  
  // Show feedback
  const notification = currentNotification;
  if (!notification) return;
  
  // Add completion animation
  if (type === 'complete') {
    const plant = notification.querySelector('.plant-growth');
    if (plant) {
      plant.style.transform = 'scale(1.2)';
      plant.style.opacity = '0.8';
      setTimeout(() => {
        plant.style.transform = 'scale(1)';
        plant.style.opacity = '0.5';
      }, 300);
    }
  }
  
  // Hide notification after action
  setTimeout(() => {
    hideDemo();
  }, 500);
}

// Make functions global
window.showDemo = showDemo;
window.hideDemo = hideDemo;
window.handleAction = handleAction;

// Auto show demo on load
window.addEventListener('load', () => {
  setTimeout(() => {
    showDemo();
  }, 1000);
});
