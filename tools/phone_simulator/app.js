// OS State Management
let isPowerOn = true;
let isLocked = true;
let activeApp = null;
let soundEnabled = true;

// DOM Elements
const offScreen = document.getElementById('off-screen');
const bootScreen = document.getElementById('boot-screen');
const lockScreen = document.getElementById('lock-screen');
const homeScreen = document.getElementById('home-screen');
const controlCenter = document.getElementById('control-center');
const appViewport = document.getElementById('app-viewport');
const phoneScreen = document.getElementById('phone-screen');
const statusTime = document.getElementById('status-time');
const lockTime = document.getElementById('lock-time');

// Web Audio API for Tactile Sounds
function playSound(type) {
  if (!soundEnabled) return;
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);

  if (type === 'click') {
    osc.frequency.setValueAtTime(400, ctx.currentTime);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.03);
  } else if (type === 'shutter') {
    osc.frequency.setValueAtTime(800, ctx.currentTime);
    gain.gain.setValueAtTime(0.1, ctx.currentTime);
    osc.start();
    osc.stop(ctx.currentTime + 0.08);
  }
}

// Clock Updater
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const timeStr = `${hours}:${minutes}`;
  statusTime.textContent = timeStr;
  lockTime.textContent = timeStr;
}
setInterval(updateClock, 1000);
updateClock();

// Hardware Power Button Toggle
document.getElementById('hw-power-btn').addEventListener('click', () => {
  playSound('click');
  if (isPowerOn) {
    offScreen.classList.remove('hidden');
    isPowerOn = false;
  } else {
    offScreen.classList.add('hidden');
    isPowerOn = true;
    if (isLocked) {
      lockScreen.classList.remove('hidden');
    }
  }
});

// Unlock Screen
lockScreen.addEventListener('click', () => {
  if (!isPowerOn) return;
  playSound('click');
  lockScreen.classList.add('hidden');
  homeScreen.classList.remove('hidden');
  isLocked = false;
});

// Navigation Bar Home Button
document.getElementById('nav-home-btn').addEventListener('click', () => {
  playSound('click');
  if (activeApp) {
    closeApp();
  } else if (!controlCenter.classList.contains('hidden')) {
    controlCenter.classList.add('hidden');
  }
});

// Status Bar Click -> Pull Down Control Center
document.getElementById('status-bar').addEventListener('click', () => {
  if (!isPowerOn || isLocked) return;
  playSound('click');
  controlCenter.classList.toggle('hidden');
});
document.getElementById('close-cc-btn').addEventListener('click', () => {
  controlCenter.classList.add('hidden');
});

// App Launching Logic
document.querySelectorAll('.app-item').forEach(item => {
  item.addEventListener('click', () => {
    if (!isPowerOn || isLocked) return;
    const appName = item.getAttribute('data-app');
    openApp(appName);
  });
});

function openApp(appName) {
  playSound('click');
  activeApp = appName;
  appViewport.classList.remove('hidden');
  
  document.querySelectorAll('.app-window').forEach(win => win.classList.add('hidden'));
  const targetApp = document.getElementById(`app-${appName}`);
  if (targetApp) targetApp.classList.remove('hidden');

  if (appName === 'camera') startWebcam();
  if (appName === 'game') startSnakeGame();
}

function closeApp() {
  appViewport.classList.add('hidden');
  activeApp = null;
  stopWebcam();
}

// Camera Functionality
let webcamStream = null;
async function startWebcam() {
  try {
    webcamStream = await navigator.mediaDevices.getUserMedia({ video: true });
    document.getElementById('webcam-feed').srcObject = webcamStream;
  } catch (err) {
    console.warn("Webcam unavailable.");
  }
}
function stopWebcam() {
  if (webcamStream) {
    webcamStream.getTracks().forEach(track => track.stop());
  }
}

document.getElementById('shutter-btn').addEventListener('click', () => {
  playSound('shutter');
  const video = document.getElementById('webcam-feed');
  const canvas = document.createElement('canvas');
  canvas.width = 300;
  canvas.height = 300;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, 300, 300);
  
  const imgUrl = canvas.toDataURL('image/png');
  const gallery = document.getElementById('gallery-grid');
  
  const emptyMsg = gallery.querySelector('.empty-msg');
  if (emptyMsg) emptyMsg.remove();

  const img = document.createElement('img');
  img.src = imgUrl;
  gallery.prepend(img);
});

// Calculator Logic
let calcVal = '0';
function calcInput(val) {
  playSound('click');
  const display = document.getElementById('calc-display');
  if (val === 'C') {
    calcVal = '0';
  } else if (val === '=') {
    try {
      calcVal = String(eval(calcVal));
    } catch {
      calcVal = 'Error';
    }
  } else {
    calcVal = calcVal === '0' ? val : calcVal + val;
  }
  display.textContent = calcVal;
}

// Notes Logic
document.getElementById('save-note-btn').addEventListener('click', () => {
  playSound('click');
  const title = document.getElementById('note-title').value;
  const content = document.getElementById('note-content').value;
  if (title) {
    localStorage.setItem(`hyper_note_${title}`, content);
    alert('Note saved!');
  }
});

// Game Turbo (Snake) Logic
let snakeDir = 'RIGHT';
function changeSnakeDir(dir) {
  snakeDir = dir;
}
function startSnakeGame() {
  const canvas = document.getElementById('snake-canvas');
  const ctx = canvas.getContext('2d');
  let snake = [{x: 10, y: 10}];
  let food = {x: 5, y: 5};
  let score = 0;

  function gameLoop() {
    if (activeApp !== 'game') return;

    let head = {...snake[0]};
    if (snakeDir === 'UP') head.y--;
    if (snakeDir === 'DOWN') head.y++;
    if (snakeDir === 'LEFT') head.x--;
    if (snakeDir === 'RIGHT') head.x++;

    // Collision Check
    if (head.x < 0 || head.x >= 14 || head.y < 0 || head.y >= 14) {
      alert('Game Over! Score: ' + score);
      return;
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += 10;
      document.getElementById('snake-score').textContent = `Score: ${score}`;
      food = {Math.floor(Math.random()*14), Math.floor(Math.random()*14)};
    } else {
      snake.pop();
    }

    // Render Canvas
    ctx.fillStyle = '#1c1c1e';
    ctx.fillRect(0, 0, 280, 280);

    ctx.fillStyle = '#ff6900';
    ctx.fillRect(food.x*20, food.y*20, 18, 18);

    ctx.fillStyle = '#38ef7d';
    snake.forEach(part => ctx.fillRect(part.x*20, part.y*20, 18, 18));

    setTimeout(gameLoop, 200);
  }
  gameLoop();
}

// Settings Controls
document.getElementById('wallpaper-select').addEventListener('change', (e) => {
  phoneScreen.style.background = e.target.value;
});
document.getElementById('brightness-slider').addEventListener('input', (e) => {
  phoneScreen.style.filter = `brightness(${e.target.value}%)`;
});
document.getElementById('sound-toggle').addEventListener('change', (e) => {
  soundEnabled = e.target.checked;
});
