import io
import wave
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from pydantic import BaseModel
from piper.voice import PiperVoice

MODEL_PATH = "models/en_US-lessac-medium.onnx"
voice = PiperVoice.load(MODEL_PATH)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["POST"],
    allow_headers=["Content-Type"],
)

class TTSRequest(BaseModel):
    text: str

@app.post("/speak")
def speak(req: TTSRequest):
    if not req.text or not req.text.strip():
        return Response(status_code=400)

    buffer = io.BytesIO()
    wav_file = wave.open(buffer, "wb")
    voice.synthesize_wav(req.text, wav_file)
    wav_file.close()

    buffer.seek(0)
    return Response(
        content=buffer.read(),
        media_type="audio/wav",
        headers={"Content-Disposition": "inline"}
    )