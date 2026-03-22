import os
import json
import re

import httpx
from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse, Response
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import google.generativeai as genai

from characters import CHARACTERS

# ElevenLabs voice IDs matched to each character's personality
ELEVENLABS_VOICES = {
    "athena":     "21m00Tcm4TlvDq8ikWAM",  # Rachel — calm, authoritative female
    "odysseus":   "ErXwobaYiN019PkySvjV",  # Antoni — well-rounded, confident male
    "odin":       "VR6AewLTigWG4xSOukaG",  # Arnold — crisp, commanding male
    "loki":       "yoZ06aMxZJJ28mfd3POQ",  # Sam — raspy, unpredictable male
    "thoth":      "pNInz6obpgDQGcFmaJgB",  # Adam — deep, wise male
    "isis":       "EXAVITQu4vr4xnSDxMaL",  # Bella — soft, mystical female
    "sun_wukong": "TxGEqnHWrfWFTfGW9XjX",  # Josh — energetic male
    "guanyin":    "MF3mGyEYCl7XYWbV9V6O",  # Elli — warm, compassionate female
}

def strip_markdown(text: str) -> str:
    """Remove markdown syntax so TTS reads cleanly."""
    text = re.sub(r'#{1,6}\s+', '', text)          # headers
    text = re.sub(r'\*\*(.+?)\*\*', r'\1', text)   # bold
    text = re.sub(r'\*(.+?)\*', r'\1', text)        # italic
    text = re.sub(r'`(.+?)`', r'\1', text)          # inline code
    text = re.sub(r'\[(.+?)\]\(.+?\)', r'\1', text) # links
    text = re.sub(r'^\s*[-*+]\s+', '', text, flags=re.MULTILINE)  # bullets
    text = re.sub(r'^\s*\d+\.\s+', '', text, flags=re.MULTILINE)  # numbered lists
    return text.strip()

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

app = FastAPI(title="The Oracle", description="Mythological wisdom for the modern age")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/characters")
async def get_characters():
    """Return character metadata (without system_prompt) for the frontend."""
    return [
        {k: v for k, v in c.items() if k != "system_prompt"}
        for c in CHARACTERS.values()
    ]


@app.post("/api/chat")
async def chat(request: Request):
    """Stream a character's response to the user's message via SSE."""
    body = await request.json()
    character_id = body["character_id"]
    messages = body["messages"]

    character = CHARACTERS.get(character_id)
    if not character:
        return {"error": "Character not found"}

    model = genai.GenerativeModel(
        model_name="gemini-2.5-flash",
        system_instruction=character["system_prompt"],
    )

    # Build chat history from all messages except the last one
    history = []
    for msg in messages[:-1]:
        role = "user" if msg["role"] == "user" else "model"
        history.append({"role": role, "parts": [msg["content"]]})

    chat_session = model.start_chat(history=history)

    async def generate():
        try:
            response = chat_session.send_message(
                messages[-1]["content"], stream=True
            )
            for chunk in response:
                if chunk.text:
                    yield f"data: {json.dumps({'text': chunk.text})}\n\n"
            yield "data: [DONE]\n\n"
        except Exception as e:
            error_msg = str(e)
            print(f"[ORACLE ERROR] {error_msg}")
            if "429" in error_msg or "rate" in error_msg.lower() or "quota" in error_msg.lower():
                yield f"data: {json.dumps({'error': 'The spirits need a moment to rest... try again shortly.'})}\n\n"
            elif "403" in error_msg or "leaked" in error_msg.lower() or "api key" in error_msg.lower():
                yield f"data: {json.dumps({'error': 'The Oracle is momentarily unavailable. Please try again soon.'})}\n\n"
            else:
                yield f"data: {json.dumps({'error': 'The Oracle is momentarily unavailable. Please try again soon.'})}\n\n"
            yield "data: [DONE]\n\n"

    return StreamingResponse(generate(), media_type="text/event-stream")


@app.post("/api/tts")
async def text_to_speech(request: Request):
    """Convert AI response text to speech using ElevenLabs."""
    api_key = os.getenv("ELEVENLABS_API_KEY")
    if not api_key or api_key == "your_elevenlabs_api_key_here":
        return Response(
            content=json.dumps({"error": "ElevenLabs API key not configured"}),
            status_code=503,
            media_type="application/json",
        )

    body = await request.json()
    character_id = body.get("character_id", "")
    text = strip_markdown(body.get("text", ""))

    if not text:
        return Response(status_code=400)

    voice_id = ELEVENLABS_VOICES.get(character_id, "21m00Tcm4TlvDq8ikWAM")

    async with httpx.AsyncClient() as client:
        resp = await client.post(
            f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}",
            headers={"xi-api-key": api_key, "Content-Type": "application/json"},
            json={
                "text": text,
                "model_id": "eleven_monolingual_v1",
                "voice_settings": {"stability": 0.5, "similarity_boost": 0.75},
            },
            timeout=60.0,
        )

    if resp.status_code != 200:
        return Response(
            content=json.dumps({"error": f"ElevenLabs error: {resp.status_code}"}),
            status_code=resp.status_code,
            media_type="application/json",
        )

    return Response(content=resp.content, media_type="audio/mpeg")
