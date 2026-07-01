print("🚨 THIS FILE IS RUNNING")

import os
import requests
from pathlib import Path
from dotenv import load_dotenv

from sentence_transformers import SentenceTransformer
import numpy as np
import faiss

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PyPDF2 import PdfReader
import re
import json

# =========================
# ENV LOAD
# =========================
env_path = Path(__file__).parent / ".env"
load_dotenv(dotenv_path=env_path)

# =========================
# APP INIT
# =========================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================
# 📊 STATS (DASHBOARD)
# =========================
total_questions = 0
total_quizzes = 0
total_score = 0
# =========================
# MODEL
# =========================
mpnet_model = SentenceTransformer('all-mpnet-base-v2')

dim = 768
index_mpnet = faiss.IndexFlatL2(dim)
texts_mpnet = []

# =========================
# HELPERS
# =========================
def clean_text(text):
    text = re.sub(r'\S+@\S+', '', text)
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def chunk_text(text, size=300):
    words = text.split()
    return [" ".join(words[i:i+size]) for i in range(0, len(words), size)]

# =========================
# 🔥 SMART SEARCH
# =========================
def search(index, texts, question, q_emb, k=3):
    q_emb = np.array([q_emb]).astype("float32")
    distances, indices = index.search(q_emb, k * 3)

    candidates = []
    stopwords = {"who", "is", "what", "the", "a", "an"}

    for pos, i in enumerate(indices[0]):
        if i < len(texts):
            text = texts[i]

            score = 1 / (1 + distances[0][pos])

            for w in question.lower().split():
                if w not in stopwords and w in text.lower():
                    score += 0.5

            if any(word in text.lower() for word in question.lower().split()):
                score += 1

            candidates.append((score, text))

    candidates.sort(reverse=True)
    top_chunks = [t for _, t in candidates[:k]]

    filtered_lines = []
    for chunk in top_chunks:
        for line in re.split(r'[.\n]', chunk):
            if any(word in line.lower() for word in question.lower().split()) and len(line.strip()) > 20:
                filtered_lines.append(line.strip())

    context = ". ".join(filtered_lines[:5])

    if not context:
        context = top_chunks[0] if top_chunks else ""

    return context, candidates[0][0] if candidates else 0

# =========================
# 🔥 ANSWER API
# =========================
def generate_answer(context, question):

    context = context[:800]

    prompt = f"""
Answer using context.

Give only final answer.

Context:
{context}

Question:
{question}

Answer:
"""

    try:
        response = requests.post(
            "http://127.0.0.1:11434/api/generate",
            json={
                "model": "mistral",
                "prompt": prompt,
                "stream": False,
                "options": {"num_predict": 120}
            },
            timeout=90
        )

        if response.status_code != 200:
            return "Ollama API error"

        data = response.json()
        ans = data.get("response", "").strip()

        if ans:
            return ans

        # fallback
        fallback = requests.post(
            "http://127.0.0.1:11434/api/generate",
            json={"model": "tinyllama", "prompt": prompt, "stream": False},
            timeout=60
        )

        return fallback.json().get("response", "").strip()

    except:
        return "Ollama failed"

# =========================
# PDF UPLOAD
# =========================
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/upload-pdf")
async def upload_pdf(file: UploadFile = File(...)):

    safe_name = file.filename.replace(" ", "_")
    path = os.path.join(UPLOAD_DIR, safe_name)

    with open(path, "wb") as f:
        f.write(await file.read())

    reader = PdfReader(path)
    text = ""

    for p in reader.pages:
        text += (p.extract_text() or "") + "\n"

    text = clean_text(text)
    chunks = chunk_text(text)

    emb = mpnet_model.encode(chunks)

    for i, chunk in enumerate(chunks):
        e = np.array(emb[i]).astype("float32")
        index_mpnet.add(np.array([e]))
        texts_mpnet.append(chunk)

    return {"message": "PDF processed", "chunks": len(chunks)}

# =========================
# ASK API
# =========================
@app.post("/ask")
def ask_question(query: dict):
    
    global total_questions

    q = query.get("question")

    if not q:
        return {"error": "Question required"}

    if len(texts_mpnet) == 0:
        return {"error": "Upload PDF first"}

    q_emb = mpnet_model.encode([q])[0]

    context, score = search(index_mpnet, texts_mpnet, q, q_emb)

    if score < 0.2:
        return {"answer": "Low confidence"}
    
    total_questions += 1 

    answer = generate_answer(context, q)

    return {"answer": answer}

# =========================
# 🔥 MCQ API (FIXED)
# =========================
@app.post("/generate-mcq")
def generate_mcq(data: dict):
    
    global total_quizzes
    topic = data.get("topic", "")
    num_questions = data.get("num_questions", 5)

    if len(texts_mpnet) == 0:
        return {"error": "Upload PDF first"}

    q_emb = mpnet_model.encode([topic])[0]
    context, _ = search(index_mpnet, texts_mpnet, topic, q_emb)

    context = context[:800]

    prompt = f"""
Generate {num_questions} MCQs.

Format EXACTLY like this:

Q1. Question
A. Option
B. Option
C. Option
D. Option
Answer: A

Context:
{context}
"""

    try:
        response = requests.post(
            "http://127.0.0.1:11434/api/generate",
            json={
                "model": "mistral",
                "prompt": prompt,
                "stream": False
            },
            timeout=120
        )

        raw = response.json().get("response", "").strip()
        print("🔥 RAW:", raw)

        import re

        mcqs = []
        blocks = raw.split("Q")[1:]

        for block in blocks:
            try:
                lines = [l.strip() for l in block.split("\n") if l.strip()]

                if not lines:
                    continue

                # ✅ QUESTION
                q = lines[0]

                # ✅ OPTIONS (SAFE REGEX)
                opts = []
                for l in lines:
                    if re.match(r"^[A-D]\.", l):
                        opts.append(l[2:].strip())

                if len(opts) < 4:
                    continue   # skip bad MCQ

                # ✅ ANSWER
                ans = 0
                ans_line = [l for l in lines if "Answer" in l]

                if ans_line:
                    match = re.search(r"[A-D]", ans_line[0].upper())
                    if match:
                        ans = ["A","B","C","D"].index(match.group())

                mcqs.append({
                    "q": q,
                    "opts": opts[:4],
                    "ans": ans,
                    "exp": ""
                })

            except Exception as e:
                print("⚠️ Skipping broken MCQ:", e)
                continue

        print("✅ FINAL MCQs:", len(mcqs))
        total_quizzes += 1
        return {"mcqs": mcqs}

    except Exception as e:
        print("❌ ERROR:", e)
        return {"error": "MCQ failed"}
    

# =========================
# 📊 STATS API (FOR DASHBOARD)
# =========================
@app.get("/stats")
def get_stats():

    avg = 0
    if total_quizzes > 0:
        avg = total_score / total_quizzes

    return {
        "docs": len(texts_mpnet),        # number of chunks (approx docs)
        "questions": total_questions,
        "quizzes": total_quizzes,
        "avg_score": avg
    }