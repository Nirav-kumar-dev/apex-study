# NVIDIA NIM & Apex Study OS Distributed Python API Server
# Built for Apex Study OS Frontend & High-Performance Reasoning Engine

import os
import re
import json
import time
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

try:
    from openai import OpenAI
    HAS_OPENAI = True
except ImportError:
    HAS_OPENAI = False

DEFAULT_MODEL = "meta/llama-3.2-11b-vision-instruct"
DEFAULT_BASE_URL = "https://integrate.api.nvidia.com/v1"
DEFAULT_API_KEY = "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"

app = FastAPI(
    title="Apex Study OS — AI Tutoring & Reasoning API Server",
    description="High-performance Python backend powering AI Exam Generation, Reasoning & Textbook Tutoring",
    version="1.1.0"
)

from fastapi.staticfiles import StaticFiles

# Enable CORS for Vite Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

if os.path.exists("book"):
    app.mount("/book", StaticFiles(directory="book"), name="book")

# --- Helper Functions ---
def extract_json_payload(raw_text: str) -> Any:
    """Safely extract and parse JSON from model output containing markdown or conversational text."""
    cleaned = raw_text.strip()
    
    # Check for markdown code fences
    fence_match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", cleaned)
    if fence_match:
        cleaned = fence_match.group(1).strip()
        
    try:
        return json.loads(cleaned)
    except Exception:
        pass

    # Find first { and matching last }
    first_brace = cleaned.find("{")
    last_brace = cleaned.rfind("}")
    if first_brace != -1 and last_brace != -1 and last_brace > first_brace:
        try:
            return json.loads(cleaned[first_brace:last_brace + 1])
        except Exception:
            pass

    # Find first [ and matching last ]
    first_bracket = cleaned.find("[")
    last_bracket = cleaned.rfind("]")
    if first_bracket != -1 and last_bracket != -1 and last_bracket > first_bracket:
        try:
            return json.loads(cleaned[first_bracket:last_bracket + 1])
        except Exception:
            pass

    return json.loads(cleaned)


# --- Pydantic Data Models ---
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    api_key: Optional[str] = None
    model: Optional[str] = DEFAULT_MODEL
    base_url: Optional[str] = DEFAULT_BASE_URL
    temperature: Optional[float] = 0.2
    top_p: Optional[float] = 0.95
    max_tokens: Optional[int] = 4096
    enable_thinking: Optional[bool] = False

class TestConnectionRequest(BaseModel):
    api_key: Optional[str] = None
    model: Optional[str] = DEFAULT_MODEL
    base_url: Optional[str] = DEFAULT_BASE_URL

class MockGenerateRequest(BaseModel):
    subject_name: str
    chapter_names: List[str]
    difficulty: str = "standard"
    api_key: Optional[str] = None
    model: Optional[str] = DEFAULT_MODEL
    base_url: Optional[str] = DEFAULT_BASE_URL

class ExamEvaluationRequest(BaseModel):
    subject_name: str
    questions: List[Dict[str, Any]]
    student_answers: Dict[str, str]
    api_key: Optional[str] = None
    model: Optional[str] = DEFAULT_MODEL
    base_url: Optional[str] = DEFAULT_BASE_URL

class ProblemSolveRequest(BaseModel):
    query: str
    subject_name: Optional[str] = "Mathematics"
    api_key: Optional[str] = None
    model: Optional[str] = DEFAULT_MODEL
    base_url: Optional[str] = DEFAULT_BASE_URL


def get_client(api_key: Optional[str], base_url: Optional[str]):
    """Instantiate OpenAI client with NVIDIA Base URL"""
    clean_url = (base_url or DEFAULT_BASE_URL).rstrip("/")
    clean_key = (api_key or os.environ.get("NVIDIA_API_KEY") or DEFAULT_API_KEY).strip()
    
    if not clean_key:
        raise HTTPException(
            status_code=400,
            detail="NVIDIA API Key is required. Please set NVIDIA_API_KEY environment variable or supply it in the request."
        )
    
    if HAS_OPENAI:
        return OpenAI(base_url=clean_url, api_key=clean_key)
    raise HTTPException(status_code=500, detail="OpenAI client library is required on the server.")


@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "Apex Study OS — Python NVIDIA API Engine",
        "default_model": DEFAULT_MODEL,
        "features": ["Reasoning Tokens", "Mock Exam Synthesis", "CBSE Evaluation", "Textbook Tutoring"]
    }


@app.post("/api/test-connection")
def test_connection(req: TestConnectionRequest):
    """Test connection to NVIDIA NIM / Dynamo endpoint"""
    start_time = time.perf_counter()
    api_key = (req.api_key or os.environ.get("NVIDIA_API_KEY") or DEFAULT_API_KEY).strip()
    
    if not api_key:
        return {"success": False, "latency_ms": 0, "message": "API key is required."}

    try:
        client = get_client(api_key, req.base_url or DEFAULT_BASE_URL)
        model_to_use = req.model or DEFAULT_MODEL

        response = client.chat.completions.create(
            model=model_to_use,
            messages=[{"role": "user", "content": "Respond with single word: Connected"}],
            max_tokens=32,
            temperature=0.1
        )
        
        latency = round((time.perf_counter() - start_time) * 1000)
        reply = response.choices[0].message.content.strip()
        
        return {
            "success": True,
            "latency_ms": latency,
            "model": model_to_use,
            "message": f"Connection Verified! Latency: {latency}ms, Response: '{reply}'"
        }
    except Exception as e:
        latency = round((time.perf_counter() - start_time) * 1000)
        return {
            "success": False,
            "latency_ms": latency,
            "message": f"Connection failed: {str(e)}"
        }


@app.post("/api/chat")
def chat_completion(req: ChatRequest):
    """Chat endpoint supporting reasoning and standard chat completions"""
    client = get_client(req.api_key, req.base_url or DEFAULT_BASE_URL)
    model = req.model or DEFAULT_MODEL

    try:
        extra_body = {}
        if req.enable_thinking and ("reasoning" in model or "nemotron-3-ultra" in model):
            extra_body["chat_template_kwargs"] = {"enable_thinking": True}

        formatted_messages = [{"role": m.role, "content": m.content} for m in req.messages]

        try:
            completion = client.chat.completions.create(
                model=model,
                messages=formatted_messages,
                temperature=req.temperature,
                top_p=req.top_p,
                max_tokens=req.max_tokens,
                extra_body=extra_body if extra_body else None
            )
        except Exception:
            # If extra_body failed, retry without extra_body
            if extra_body:
                completion = client.chat.completions.create(
                    model=model,
                    messages=formatted_messages,
                    temperature=req.temperature,
                    top_p=req.top_p,
                    max_tokens=req.max_tokens
                )
            else:
                raise

        choice = completion.choices[0]
        content = choice.message.content or ""
        reasoning_content = getattr(choice.message, "reasoning_content", None)

        return {
            "content": content,
            "reasoning_content": reasoning_content,
            "model": model
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/generate-mock")
def generate_mock_exam(req: MockGenerateRequest):
    """Generate Class 9 CBSE examination paper"""
    client = get_client(req.api_key, req.base_url or DEFAULT_BASE_URL)
    model = req.model or DEFAULT_MODEL

    prompt = f"""Generate a realistic Class 9 Half-Yearly examination question paper for CBSE / standard school syllabus.
Subject: {req.subject_name}
Chapters Included: {', '.join(req.chapter_names)}
Exam Difficulty: {req.difficulty}

Please return a valid JSON object with the following structure:
{{
  "title": "{req.subject_name} Half-Yearly Mock Exam",
  "totalMarks": 40,
  "durationMinutes": 90,
  "instructions": [
    "All questions are compulsory.",
    "Section A contains 4 MCQs of 1 mark each.",
    "Section B contains 3 Short Answer questions of 2 marks each.",
    "Section C contains 2 Long Answer questions of 3 marks each.",
    "Section D contains 2 Comprehensive / Proof questions of 5 marks each."
  ],
  "questions": [
    {{
      "id": "q1",
      "question": "Question text here",
      "type": "mcq",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correctOptionIndex": 0,
      "modelAnswer": "Detailed step-by-step correct answer",
      "marks": 1,
      "topic": "{req.chapter_names[0] if req.chapter_names else req.subject_name}"
    }}
  ]
}}

Ensure questions strictly follow Class 9 curriculum standards. Return ONLY the raw JSON object."""

    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are an expert CBSE examination author. Output valid JSON only with zero markdown or conversational wrapper."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=3000
        )

        raw = completion.choices[0].message.content or ""
        return extract_json_payload(raw)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Mock Exam generation failed: {str(e)}")


@app.post("/api/evaluate-exam")
def evaluate_exam(req: ExamEvaluationRequest):
    """Evaluate student submission against CBSE rubric"""
    client = get_client(req.api_key, req.base_url or DEFAULT_BASE_URL)
    model = req.model or DEFAULT_MODEL

    qa_pairs = [
        {
            "questionId": q.get("id"),
            "question": q.get("question"),
            "maxMarks": q.get("marks", 1),
            "modelAnswer": q.get("modelAnswer", ""),
            "studentAnswer": req.student_answers.get(q.get("id", ""), "(No answer submitted)")
        }
        for q in req.questions
    ]

    prompt = f"""Evaluate the following student's answers for a Class 9 {req.subject_name} exam against model answers.

Questions and Student Submissions:
{json.dumps(qa_pairs, indent=2)}

Provide an objective assessment following official CBSE marking rubrics. Return a JSON object with:
{{
  "totalScore": <number>,
  "maxScore": <number>,
  "percentage": <number>,
  "feedbackSummary": "<overall diagnostic assessment of student's readiness>",
  "evaluatedQuestions": [
    {{
      "questionId": "q1",
      "marksObtained": <number>,
      "maxMarks": <number>,
      "feedback": "<concise feedback>",
      "improvementTip": "<actionable study advice>"
    }}
  ]
}}

Return ONLY valid JSON."""

    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are an expert strict and encouraging CBSE exam evaluator. Return valid JSON only."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.1,
            max_tokens=2500
        )

        raw = completion.choices[0].message.content or ""
        return extract_json_payload(raw)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Exam evaluation failed: {str(e)}")


@app.post("/api/solve-problem")
def solve_problem(req: ProblemSolveRequest):
    """Step-by-step problem solver with reasoning output"""
    client = get_client(req.api_key, req.base_url or DEFAULT_BASE_URL)
    model = req.model or DEFAULT_MODEL

    system_prompt = """You are an expert CBSE Class 9 Math & Science problem solver.
Explain the step-by-step derivation, formula used, algebraic reasoning, and final answer with proper SI units.
Format equations cleanly using markdown. Also note common mistakes students make on this type of question."""

    try:
        completion = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": req.query}
            ],
            temperature=0.2,
            max_tokens=2500
        )

        choice = completion.choices[0]
        content = choice.message.content or ""
        reasoning = getattr(choice.message, "reasoning_content", None)

        return {
            "solution": content,
            "reasoning_content": reasoning,
            "model": model
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Problem solving failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8001))
    print(f"Starting Apex Study OS Python API Server on http://localhost:{port} ...")
    uvicorn.run("api_server:app", host="127.0.0.1", port=port, reload=True)

