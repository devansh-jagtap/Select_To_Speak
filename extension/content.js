let controlBox = null;
let ttsAudio = null;

document.addEventListener("mouseup", (e) => {
  if (e.target.closest(".tts-container")) return;

  const text = window.getSelection().toString().trim();
  removeControls();

  if (text.length > 0) {
    showControls(text);
  }
});

function showControls(text) {
  const selection = window.getSelection();
  if (!selection.rangeCount) return;

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();

  controlBox = document.createElement("div");
  controlBox.className = "tts-container";

  // Speak
  const speakBtn = createButton(iconSpeak(), "Speak", (e) => {
    e.stopPropagation();
    speakText(text);
  });

  // Pause / Resume
  const pauseBtn = createButton(iconPause(), "Pause", (e) => {
    e.stopPropagation();
    if (!ttsAudio) return;
    if (!ttsAudio.paused) {
      ttsAudio.pause();
      pauseBtn.innerHTML = "";
      pauseBtn.appendChild(iconResume());
      pauseBtn.title = "Resume";
    } else {
      ttsAudio.play();
      pauseBtn.innerHTML = "";
      pauseBtn.appendChild(iconPause());
      pauseBtn.title = "Pause";
    }
  });

  // Stop
  const stopBtn = createButton(iconStop(), "Stop", (e) => {
    e.stopPropagation();
    stopSpeaking();
    pauseBtn.innerHTML = "";
    pauseBtn.appendChild(iconPause());
    pauseBtn.title = "Pause";
  });

  controlBox.appendChild(speakBtn);
  controlBox.appendChild(pauseBtn);
  controlBox.appendChild(stopBtn);

  controlBox.style.top = `${window.scrollY + rect.bottom + 8}px`;
  controlBox.style.left = `${window.scrollX + rect.left}px`;

  document.body.appendChild(controlBox);
}

function createButton(iconEl, title, onClick) {
  const btn = document.createElement("button");
  btn.title = title;
  btn.appendChild(iconEl);
  btn.onclick = onClick;
  return btn;
}

async function speakText(text) {
  stopSpeaking();

  try {
    const response = await fetch("http://127.0.0.1:8000/speak", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      console.error("TTS server error:", response.status);
      return;
    }

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    ttsAudio = new Audio(url);
    ttsAudio.onended = () => URL.revokeObjectURL(url);
    ttsAudio.play();

  } catch (err) {
    console.error("TTS fetch failed:", err);
  }
}

function stopSpeaking() {
  if (ttsAudio) {
    ttsAudio.pause();
    ttsAudio.currentTime = 0;
    ttsAudio = null;
  }
}

function removeControls() {
  stopSpeaking();
  if (controlBox) {
    controlBox.remove();
    controlBox = null;
  }
}

// --- SVG Icons ---
function iconSpeak() {
  return svgIcon(`
    <polygon points="11,5 6,9 2,9 2,15 6,15 11,19" fill="currentColor"/>
    <path d="M15.54,8.46a5,5,0,0,1,0,7.07" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
    <path d="M19,5a9,9,0,0,1,0,14" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round"/>
  `);
}

function iconPause() {
  return svgIcon(`
    <rect x="6" y="4" width="4" height="16" rx="1" fill="currentColor"/>
    <rect x="14" y="4" width="4" height="16" rx="1" fill="currentColor"/>
  `);
}

function iconResume() {
  return svgIcon(`
    <polygon points="5,3 19,12 5,21" fill="currentColor"/>
  `);
}

function iconStop() {
  return svgIcon(`
    <rect x="4" y="4" width="16" height="16" rx="2" fill="currentColor"/>
  `);
}

function svgIcon(innerSVG) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "16");
  svg.setAttribute("height", "16");
  svg.innerHTML = innerSVG;
  return svg;
}