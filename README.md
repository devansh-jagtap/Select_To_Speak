# Select to Speak

A Chrome extension that reads any selected text aloud using a fully local TTS engine — no APIs, no subscriptions, no internet required after setup.

## Demo

> Select any text on a webpage → click Speak → it narrates it for you.

---

## How It Works

- **Chrome Extension** detects text selection and shows a floating toolbar
- **Local Python server** (FastAPI + Piper TTS) synthesizes audio on your machine
- Audio is streamed back to the browser and played instantly

---

## Project Structure

```
select-to-speak/
├── extension/        ← Load this in Chrome
│   ├── manifest.json
│   ├── content.js
│   └── style.css
└── local-tts/        ← Run this as the backend
    └── server.py
```

---

## Setup

### 1. Install Python dependencies

Requires **Python 3.10+**

```bash
pip install piper-tts fastapi uvicorn
```

### 2. Download the voice model (one time only)

```bash
python -c "
import urllib.request, os
os.makedirs('local-tts/models', exist_ok=True)
urllib.request.urlretrieve(
    'https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx',
    'local-tts/models/en_US-lessac-medium.onnx'
)
urllib.request.urlretrieve(
    'https://huggingface.co/rhasspy/piper-voices/resolve/main/en/en_US/lessac/medium/en_US-lessac-medium.onnx.json',
    'local-tts/models/en_US-lessac-medium.onnx.json'
)
print('Done.')
"
```

### 3. Start the TTS server

```bash
cd local-tts
uvicorn server:app --host 127.0.0.1 --port 8000
```

Keep this running in the background while using the extension.

### 4. Load the extension in Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `extension/` folder

---

## Usage

1. Make sure the local server is running
2. Select any text on any webpage
3. A floating toolbar appears with three buttons:

| Button | Action |
|--------|--------|
| 🔊 Speaker | Speak selected text |
| ⏸ Pause | Pause / Resume playback |
| ⏹ Stop | Stop playback |

---

## Requirements

- Python 3.10 or higher
- Google Chrome
- Windows / macOS / Linux
- No GPU needed — runs entirely on CPU

---

## Notes

- The voice model (~60MB) is not included in this repo — download it using the script above
- The server must be running locally for the extension to work
- No data ever leaves your machine

---

## License

MIT
