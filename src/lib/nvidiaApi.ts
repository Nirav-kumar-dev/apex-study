// NVIDIA NIM / Dynamo & Python API Client & AI Study Engine
import { Capacitor, CapacitorHttp } from '@capacitor/core';

export interface NvidiaModelOption {
  id: string;
  name: string;
  provider: string;
  description: string;
  recommendedFor: string;
}

export const DEFAULT_NVIDIA_MODEL = 'nvidia/nemotron-3.5-lightning-30b-a3b';
export const DEFAULT_NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';
export const DEFAULT_NVIDIA_API_KEY = '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';

export const NVIDIA_MODELS: NvidiaModelOption[] = [
  {
    id: 'nvidia/nemotron-3.5-lightning-30b-a3b',
    name: 'Nemotron 3.5 Lightning 30B A3B',
    provider: 'NVIDIA',
    description: 'Flagship NVIDIA Nemotron 3.5 reasoning engine providing deep step-by-step chain-of-thought analysis for complex physics numericals, algebraic derivations, and exam synthesis.',
    recommendedFor: '⭐ Recommended: Step-by-Step Physics Numericals, Proofs & Thinking Process',
  },
  {
    id: 'meta/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B Instruct',
    provider: 'Meta',
    description: 'State-of-the-art 70B flagship model delivering master-grade explanations, rigorous CBSE Board answer writing, and flawless math/science reasoning.',
    recommendedFor: '⭐ Highest Academic Accuracy: Master Explanations & Board Exam Answer Writing',
  },
  {
    id: 'meta/llama-3.2-11b-vision-instruct',
    name: 'Llama 3.2 11B Vision Instruct',
    provider: 'Meta',
    description: 'Ultra-fast, high-intelligence model with vision & multimodal reasoning. Delivers instant problem-solving, CBSE exam paper synthesis, and active recall explanations.',
    recommendedFor: 'Instant AI Tutoring, Mock Exam Synthesis & Diagram Problem Solving',
  },
  {
    id: 'meta/llama-3.2-90b-vision-instruct',
    name: 'Llama 3.2 90B Vision Instruct',
    provider: 'Meta',
    description: 'Flagship 90B model delivering elite multi-step geometry proofs, rigorous CBSE rubric grading, and deep syllabus diagnostic evaluations.',
    recommendedFor: 'Complex Geometry Proofs, Detailed Marking Rubrics & Full Syllabus Diagnostic Exams',
  },
  {
    id: 'mistralai/mistral-large-2-instruct',
    name: 'Mistral Large 2 Instruct',
    provider: 'Mistral AI',
    description: 'Top-tier 123B parameter reasoning model with exceptional multilingual fluency, precise coding, and rigorous logical deductions.',
    recommendedFor: 'Advanced Reasoning, Logic & Comprehensive Explanations',
  },
  {
    id: 'deepseek-ai/deepseek-r1',
    name: 'DeepSeek R1 Reasoning',
    provider: 'DeepSeek',
    description: 'Specialized deep reasoning model with exceptional mathematical theorem proving, Olympiad-level logic, and rigorous step verification.',
    recommendedFor: 'Mathematical Proofs, Derivations & Olympiad Level Numericals',
  },
  {
    id: 'openai/gpt-oss-120b',
    name: 'GPT-OSS 120B Instruct',
    provider: 'OpenAI / Open-Source',
    description: 'High-capacity 120B open model for comprehensive academic problem solving and deep question explanation.',
    recommendedFor: 'Comprehensive Subject Explanations & Theory Review',
  },
  {
    id: 'qwen/qwen2.5-coder-32b-instruct',
    name: 'Qwen 2.5 Coder 32B',
    provider: 'Qwen',
    description: 'Powerful model with specialized coding, AI project cycle, algorithm design, and Python programming proficiency.',
    recommendedFor: 'Artificial Intelligence (Subject Code 417) & Python Programming',
  },
  {
    id: 'nvidia/riva-translate-4b-instruct-v1.1',
    name: 'Riva Translate 4B Instruct',
    provider: 'NVIDIA',
    description: 'Specialized multilingual language model designed for Hindi grammar (Vyakaran), Sanskrit, and English language comprehension.',
    recommendedFor: 'Hindi & English Grammar, Vyakaran, and Translation Tasks',
  },
];

/**
 * Robust JSON extractor that handles code fences, preambles, and conversational wrappers
 */
export function extractJson<T = any>(text: string): T {
  let cleaned = text.trim();
  const codeBlockMatch = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeBlockMatch) {
    cleaned = codeBlockMatch[1].trim();
  }

  try {
    return JSON.parse(cleaned);
  } catch {}

  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    try {
      return JSON.parse(cleaned.substring(firstBrace, lastBrace + 1));
    } catch {}
  }

  const firstBracket = cleaned.indexOf('[');
  const lastBracket = cleaned.lastIndexOf(']');
  if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
    try {
      return JSON.parse(cleaned.substring(firstBracket, lastBracket + 1));
    } catch {}
  }

  return JSON.parse(cleaned);
}

/**
 * Reconstructs standard chat completion object from SSE streaming lines (e.g. data: {...}\n\n)
 */
function parseSseResponse(rawText: string): any {
  if (!rawText || !rawText.includes('data:')) return null;

  const lines = rawText.split('\n');
  let fullContent = '';
  let fullReasoning = '';

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || !trimmed.startsWith('data:')) continue;
    const jsonStr = trimmed.slice(5).trim();
    if (jsonStr === '[DONE]') continue;
    try {
      const parsed = JSON.parse(jsonStr);
      const choice = parsed.choices?.[0];
      if (choice) {
        if (choice.delta?.content) fullContent += choice.delta.content;
        if (choice.delta?.reasoning_content) fullReasoning += choice.delta.reasoning_content;
        if (choice.message?.content) fullContent += choice.message.content;
        if (choice.message?.reasoning_content) fullReasoning += choice.message.reasoning_content;
        if (choice.text) fullContent += choice.text;
      }
    } catch {}
  }

  if (fullContent || fullReasoning) {
    return {
      choices: [
        {
          message: {
            role: 'assistant',
            content: fullContent,
            reasoning_content: fullReasoning,
          },
        },
      ],
    };
  }
  return null;
}

/**
 * Sanitizes and extracts human-readable message from error text (handles JSON and HTML error responses)
 */
function cleanErrorMessage(rawText: string, status: number): string {
  try {
    const json = JSON.parse(rawText);
    return json.error?.message || json.detail || json.message || rawText;
  } catch {}
  if (rawText.includes('<!DOCTYPE') || rawText.includes('<html')) {
    const msgMatch = rawText.match(/<p>Message:\s*([^<]+)<\/p>/i) ||
                     rawText.match(/<p>Error code explanation:\s*([^<]+)<\/p>/i) ||
                     rawText.match(/<h1>([^<]+)<\/h1>/i) ||
                     rawText.match(/<title>([^<]+)<\/title>/i);
    if (msgMatch) {
      return msgMatch[1].trim();
    }
    return `Server returned error (${status}). Please check local desktop service or API key.`;
  }
  return rawText.slice(0, 300);
}

/**
 * Returns effective base URL, routing through local proxy in browser if running in dev,
 * or using direct HTTPS URL in native Android/iOS Capacitor environments.
 */
export function getEffectiveBaseUrl(baseUrl?: string): string {
  const url = (baseUrl || DEFAULT_NVIDIA_BASE_URL).trim().replace(/\/+$/, '');
  if (Capacitor.isNativePlatform()) {
    return url || DEFAULT_NVIDIA_BASE_URL;
  }
  if (typeof window !== 'undefined') {
    if ((url === 'https://integrate.api.nvidia.com/v1' || url === DEFAULT_NVIDIA_BASE_URL || url === '') && window.location.hostname === 'localhost' && window.location.port === '5173') {
      return '/api/nvidia';
    }
  }
  return url || DEFAULT_NVIDIA_BASE_URL;
}

interface HttpRequestResult {
  ok: boolean;
  status: number;
  data: any;
  rawText: string;
}

/**
 * Universal HTTP POST executor that uses native CapacitorHttp on Android / iOS
 * (bypassing Android WebView CORS restrictions completely, exactly like curl / shell)
 * with graceful browser fetch fallback.
 */
async function executeNvidiaPost(
  url: string,
  apiKey: string,
  payload: any
): Promise<HttpRequestResult> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Authorization': `Bearer ${apiKey.trim()}`,
  };

  // 1. If running inside native Android/iOS Capacitor app, use native OkHttp client (bypasses browser CORS completely)
  if (Capacitor.isNativePlatform()) {
    try {
      const nativeRes = await CapacitorHttp.request({
        url,
        method: 'POST',
        headers,
        data: payload,
      });

      const ok = nativeRes.status >= 200 && nativeRes.status < 300;
      let data = nativeRes.data;
      const rawText = typeof data === 'string' ? data : JSON.stringify(data);

      if (typeof data === 'string') {
        try {
          data = JSON.parse(data);
        } catch {
          const sseData = parseSseResponse(data);
          if (sseData) data = sseData;
        }
      }

      return {
        ok,
        status: nativeRes.status,
        data,
        rawText,
      };
    } catch (nativeErr: any) {
      console.warn('Native CapacitorHttp request failed, falling back to fetch:', nativeErr);
    }
  }

  // 2. Browser / Desktop fetch
  try {
    const fetchRes = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const status = fetchRes.status;
    const rawText = await fetchRes.text();
    let data: any = null;
    try {
      data = JSON.parse(rawText);
    } catch {
      const sseData = parseSseResponse(rawText);
      data = sseData || rawText;
    }

    return {
      ok: fetchRes.ok,
      status,
      data,
      rawText,
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 0,
      data: null,
      rawText: err instanceof Error ? err.message : String(err),
    };
  }
}

export async function testNvidiaConnection(
  apiKey: string = DEFAULT_NVIDIA_API_KEY,
  model: string = DEFAULT_NVIDIA_MODEL,
  baseUrl: string = DEFAULT_NVIDIA_BASE_URL
): Promise<{ success: boolean; latencyMs: number; message: string }> {
  const activeKey = (apiKey || DEFAULT_NVIDIA_API_KEY).trim();
  if (!activeKey) {
    return { success: false, latencyMs: 0, message: 'Please enter a valid NVIDIA API Key (nvapi-...)' };
  }

  const cleanBaseUrl = getEffectiveBaseUrl(baseUrl);
  const startTime = performance.now();

  const reqBody = {
    model: model.trim(),
    messages: [
      { role: 'user', content: 'Respond with exactly one word: "Connected".' },
    ],
    temperature: 0.1,
    max_tokens: 64,
  };

  const targetEndpoint = `${cleanBaseUrl}/chat/completions`;
  let result = await executeNvidiaPost(targetEndpoint, activeKey, reqBody);

  // If local endpoint failed (e.g. 501, 404, or network 0), fallback directly to NVIDIA endpoint
  if (!result.ok && (result.status === 501 || result.status === 404 || result.status === 0) && cleanBaseUrl !== DEFAULT_NVIDIA_BASE_URL) {
    result = await executeNvidiaPost(`${DEFAULT_NVIDIA_BASE_URL}/chat/completions`, activeKey, reqBody);
  }

  const latencyMs = Math.round(performance.now() - startTime);

  if (!result.ok) {
    const parsedErr = cleanErrorMessage(result.rawText, result.status);
    return {
      success: false,
      latencyMs,
      message: `NVIDIA API Error (${result.status}): ${parsedErr}`,
    };
  }

  const data = result.data;
  const reply = data?.choices?.[0]?.message?.content?.trim() || data?.choices?.[0]?.text?.trim() || 'Connected';

  return {
    success: true,
    latencyMs,
    message: `Connection Verified! Model: ${model} (Latency: ${latencyMs}ms, Response: "${reply}")`,
  };
}

// Call NVIDIA Chat Completions API with Multimodal Vision & Reasoning Support


/**
 * Strips all internal reasoning tokens, <think> blocks, meta outlines, and "Here's a thinking process:" dumps,
 * ensuring the user receives only crystal-clear, direct, polished textbook answers.
 */
export function cleanAiAnswer(rawText: string): string {
  if (!rawText) return '';

  let cleaned = rawText.trim();

  // 1. Strip <think>...</think> tags
  cleaned = cleaned.replace(/<think>[\s\S]*?<\/think>/gi, '');

  // 2. Strip "Here's a thinking process:..." blocks and numbered meta-analysis
  cleaned = cleaned.replace(
    /^(?:> )?(?:💭 )?(?:\*\*)?(?:Here(?:'s| is) a thinking process|Thinking Process|AI Thinking Process)(?:\*\*)?[:\n][\s\S]*?(?=(?:\n#{1,4}\s|\n\*\*[A-Z]|\n\d+\.\s+\*\*[A-Z]|Solution:|Explanation:|Definition:|In Class|\bTo solve|\bAccording to|\bSummary|\bStep 1|\n\n[A-Z]|$))/i,
    ''
  );

  // 3. Strip standalone "> 💭 **AI Thinking Process:**" wrappers
  cleaned = cleaned.replace(/> 💭 \*\*AI Thinking Process:\*\*[\s\S]*?\n\n/g, '');

  // 4. Strip lines that look like internal prompt echoing or meta-analysis
  cleaned = cleaned.replace(/^> \d+\.\s+\*\*Analyze User Input:\*\*[\s\S]*?(?=\n\n|\n[A-Z])/g, '');

  return cleaned.trim();
}

// Call NVIDIA Chat Completions API with Multimodal Vision & Direct Pedagogical Response
export async function callNvidiaChat(
  messages: {
    role: 'system' | 'user' | 'assistant';
    content: string | (
      | { type: 'text'; text: string }
      | { type: 'image_url'; image_url: { url: string } }
    )[];
  }[],
  options?: {
    apiKey?: string;
    model?: string;
    baseUrl?: string;
    temperature?: number;
    topP?: number;
    maxTokens?: number;
    reasoningBudget?: number;
    enableThinking?: boolean;
    stream?: boolean;
  }
): Promise<string> {
  const apiKey = (options?.apiKey || DEFAULT_NVIDIA_API_KEY).trim();
  const model = options?.model || DEFAULT_NVIDIA_MODEL;
  const cleanBaseUrl = getEffectiveBaseUrl(options?.baseUrl);

  if (!apiKey) {
    throw new Error('NVIDIA API Key is missing. Please enter your API key in Settings or the AI Tutor panel.');
  }

  const payload: any = {
    model: model.trim(),
    messages,
    temperature: options?.temperature ?? 0.25,
    top_p: options?.topP ?? 0.95,
    max_tokens: options?.maxTokens ?? 4096,
  };

  const targetEndpoint = `${cleanBaseUrl}/chat/completions`;
  let result = await executeNvidiaPost(targetEndpoint, apiKey, payload);

  // If local proxy returned 501, 404, or 0 (network fail), try direct NVIDIA endpoint
  if (!result.ok && (result.status === 501 || result.status === 404 || result.status === 0) && cleanBaseUrl !== DEFAULT_NVIDIA_BASE_URL) {
    result = await executeNvidiaPost(`${DEFAULT_NVIDIA_BASE_URL}/chat/completions`, apiKey, payload);
  }

  if (!result.ok) {
    const msg = cleanErrorMessage(result.rawText, result.status);
    throw new Error(`NVIDIA API ${result.status}: ${msg}`);
  }

  const data = result.data;
  const choice = data?.choices?.[0]?.message;
  if (!choice && typeof data === 'string') {
    return cleanAiAnswer(data);
  }
  if (!choice) {
    return cleanAiAnswer(data?.choices?.[0]?.text || '');
  }

  const rawContent = choice.content || choice.reasoning_content || '';
  return cleanAiAnswer(rawContent);
}

/**
 * Multimodal Image & Document Analysis with NVIDIA Vision NIM
 */
export async function analyzeImageWithNvidiaVision(
  imageBase64: string,
  prompt: string,
  options?: {
    apiKey?: string;
    model?: string;
    baseUrl?: string;
  }
): Promise<string> {
  const model = options?.model || DEFAULT_NVIDIA_MODEL;
  const visionModel = model.includes('vision') ? model : 'meta/llama-3.2-11b-vision-instruct';

  const messages: any[] = [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: prompt || 'Analyze this study document / date sheet image in detail and extract all key information.',
        },
        {
          type: 'image_url',
          image_url: {
            url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
          },
        },
      ],
    },
  ];

  return callNvidiaChat(messages, {
    apiKey: options?.apiKey,
    model: visionModel,
    baseUrl: options?.baseUrl,
    temperature: 0.2,
    maxTokens: 2048,
  });
}

// AI Question & Mock Test Generator
export async function generateNvidiaMockTest(
  subjectName: string,
  chapterNames: string[],
  difficulty: 'easy' | 'standard' | 'challenging',
  apiKey?: string,
  model: string = DEFAULT_NVIDIA_MODEL,
  baseUrl?: string
): Promise<any> {
  const prompt = `Generate a realistic Class 9 Half-Yearly examination question paper for CBSE / standard school syllabus.
Subject: ${subjectName}
Chapters Included: ${chapterNames.join(', ')}
Exam Difficulty: ${difficulty}

Please return a valid JSON object with the following structure:
{
  "title": "${subjectName} Half-Yearly Mock Exam",
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
    {
      "id": "q1",
      "question": "Question text here",
      "type": "mcq",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correctOptionIndex": 0,
      "modelAnswer": "Detailed step-by-step correct answer",
      "marks": 1,
      "topic": "${chapterNames[0] || subjectName}"
    },
    {
      "id": "q2",
      "question": "Numerical or theoretical problem",
      "type": "numerical",
      "modelAnswer": "Full derivation and mathematical calculation with units",
      "marks": 2,
      "topic": "${chapterNames[0] || subjectName}"
    }
  ]
}

Ensure the questions strictly follow Class 9 curriculum standards. Return ONLY the JSON object.`;

  const rawText = await callNvidiaChat(
    [
      {
        role: 'system',
        content: 'You are an expert CBSE Class 9 examination author and school evaluator. Output valid JSON only with zero markdown conversational filler.',
      },
      { role: 'user', content: prompt },
    ],
    { apiKey, model, baseUrl, temperature: 0.2, maxTokens: 4096, enableThinking: false }
  );

  return extractJson(rawText);
}

// AI Evaluation of Student Exam Answers
export async function evaluateStudentExamWithNvidia(
  subjectName: string,
  questions: any[],
  studentAnswers: Record<string, string>,
  apiKey?: string,
  model: string = DEFAULT_NVIDIA_MODEL,
  baseUrl?: string
): Promise<{
  totalScore: number;
  maxScore: number;
  percentage: number;
  feedbackSummary: string;
  evaluatedQuestions: {
    questionId: string;
    marksObtained: number;
    maxMarks: number;
    feedback: string;
    improvementTip: string;
  }[];
}> {
  const qaPairs = questions.map(q => ({
    questionId: q.id,
    question: q.question,
    maxMarks: q.marks,
    modelAnswer: q.modelAnswer,
    studentAnswer: studentAnswers[q.id] || '(No answer provided)',
  }));

  const prompt = `Evaluate the following student's answers for a Class 9 ${subjectName} exam against the model answers.

Questions and Student Submissions:
${JSON.stringify(qaPairs, null, 2)}

Provide an objective assessment following official CBSE marking rubrics. Return a JSON object with:
{
  "totalScore": <number>,
  "maxScore": <number>,
  "percentage": <number>,
  "feedbackSummary": "<overall diagnostic assessment of student's readiness>",
  "evaluatedQuestions": [
    {
      "questionId": "q1",
      "marksObtained": <number>,
      "maxMarks": <number>,
      "feedback": "<concise feedback on where student succeeded or made mistakes>",
      "improvementTip": "<actionable study advice>"
    }
  ]
}

Return ONLY valid JSON.`;

  const rawText = await callNvidiaChat(
    [
      {
        role: 'system',
        content: 'You are an expert strict and encouraging CBSE exam evaluator. Return valid JSON only.',
      },
      { role: 'user', content: prompt },
    ],
    { apiKey, model, baseUrl, temperature: 0.1, maxTokens: 4096, enableThinking: false }
  );

  return extractJson(rawText);
}

export interface NimStudyConfigResult {
  aiStrategyQuote: string;
  recommendedFocus: string;
  subjectWeights: Record<string, number>;
  highYieldTopics: string[];
  revisionStrategy: string;
  dailyStudyTips: string[];
}

/**
 * Configure AI Study Workspace & Dynamic Planner using NVIDIA NIM
 */
export async function configureStudySystemWithNim(
  classGrade: string,
  exams: { subjectName: string; date: string }[],
  studyHours: { schoolDays: number; weekends: number },
  config?: { apiKey?: string; model?: string; baseUrl?: string }
): Promise<NimStudyConfigResult> {
  const prompt = `You are the NVIDIA NIM Apex Study OS Core Intelligence Engine.
Configure an optimized CBSE academic strategy and calendar weighting for a student in ${classGrade}.

Exam Schedule:
${exams.map(e => `- ${e.subjectName}: ${e.date}`).join('\n')}

Daily Availability:
- Weekdays: ${studyHours.schoolDays} hours/day
- Weekends: ${studyHours.weekends} hours/day

Task:
Analyze the syllabus urgency, chronological exam sequence, and cognitive load distribution.
Return a valid JSON object matching this schema:
{
  "aiStrategyQuote": "<short punchy motivational strategy slogan for ${classGrade}>",
  "recommendedFocus": "<key strategic focus area>",
  "subjectWeights": {
    "maths": <number percentage e.g. 35>,
    "science": <number percentage e.g. 30>,
    "english": <number percentage e.g. 15>,
    "sst": <number percentage e.g. 15>,
    "others": <number percentage e.g. 5>
  },
  "highYieldTopics": ["<topic 1>", "<topic 2>", "<topic 3>", "<topic 4>"],
  "revisionStrategy": "<description of spaced repetition timing>",
  "dailyStudyTips": [
    "<actionable tip 1>",
    "<actionable tip 2>",
    "<actionable tip 3>"
  ]
}

Return ONLY valid JSON.`;

  try {
    const raw = await callNvidiaChat(
      [
        {
          role: 'system',
          content: 'You are the NVIDIA NIM academic reasoning engine for CBSE curricula. Always respond in pure JSON.',
        },
        { role: 'user', content: prompt },
      ],
      {
        apiKey: config?.apiKey,
        model: config?.model || DEFAULT_NVIDIA_MODEL,
        baseUrl: config?.baseUrl,
        temperature: 0.2,
        maxTokens: 2048,
      }
    );

    const parsed = extractJson<NimStudyConfigResult>(raw);
    if (parsed && parsed.aiStrategyQuote && Array.isArray(parsed.highYieldTopics)) {
      return parsed;
    }
  } catch (err) {
    console.warn('NIM Study Configuration API call fallback:', err);
  }

  // High quality deterministic fallback
  const isClass10 = classGrade.includes('10');
  const isClass7 = classGrade.includes('7');
  const isClass8 = classGrade.includes('8');

  return {
    aiStrategyQuote: isClass10
      ? 'Master high-yield Board questions first; precision in proofs and diagrams guarantees distinction.'
      : isClass7
      ? 'Build rock-solid foundational concepts in Maths & Science with daily active recall.'
      : isClass8
      ? 'Focus on numerical problem solving and systematic chapter revision cycles.'
      : 'Target theorem proofs, formula derivations, and spaced recall to secure 95%+ in Half-Yearly.',
    recommendedFocus: isClass10
      ? 'Trigonometry identities, Light ray diagrams, and Triangles BPT theorem'
      : isClass7
      ? 'Integers, Simple Equations, and Heat transfer principles'
      : isClass8
      ? 'Linear equations word problems and Combustion & Flame diagrams'
      : 'Polynomial identities, Lines & Angles proofs, and Equations of Motion',
    subjectWeights: {
      maths: isClass10 ? 40 : 35,
      science: 30,
      english: 15,
      sst: 15,
      others: 5,
    },
    highYieldTopics: isClass10
      ? ['Triangles BPT Theorem', 'Trigonometric Identities', 'Light Reflection & Refraction', 'Life Processes Circulation']
      : isClass7
      ? ['Integers Properties', 'Simple Equations Transposition', 'Heat Conduction & Convection', 'Plant Nutrition Photosynthesis']
      : isClass8
      ? ['Linear Equations in One Variable', 'Crop Production Cycle', 'Combustion Flame Zones', 'Understanding Quadrilaterals']
      : ['Polynomials Factor Theorem', 'Motion Graphical Derivations', 'Lines & Angles Transversal Theorems', 'Cell Organelles Function'],
    revisionStrategy: 'Ebbinghaus 1-3-7-14 Day Spaced Intervals with Nightly Error Rectification',
    dailyStudyTips: [
      'Begin each study block with 5 minutes of active formula recall before solving problems.',
      'Spend at least 45 minutes every evening resolving questions logged in the Error Notebook.',
      'Complete one timed mock test section every 4 days leading up to the September exams.',
    ],
  };
}

export interface NimChapterIdentificationResult {
  chapterNumber: number;
  chapterTitle: string;
  subjectName: string;
  summary: string;
}

/**
 * Standard NCERT PDF File Codebook Dictionary for instantaneous (0ms) identification
 */
export const NCERT_CODEBOOK_MAP: Record<string, { chapterNumber: number; chapterTitle: string; subjectName: string; summary: string }> = {
  // Class 9 Maths (iemh1)
  iemh101: { chapterNumber: 1, chapterTitle: 'Chapter 1: Number Systems', subjectName: 'Mathematics', summary: 'Real numbers, irrational numbers, decimal expansions, laws of exponents.' },
  iemh102: { chapterNumber: 2, chapterTitle: 'Chapter 2: Polynomials', subjectName: 'Mathematics', summary: 'Zeroes of polynomials, remainder theorem, factor theorem, algebraic identities.' },
  iemh103: { chapterNumber: 3, chapterTitle: 'Chapter 3: Coordinate Geometry', subjectName: 'Mathematics', summary: 'Cartesian plane, coordinates of a point, quadrants and axes.' },
  iemh104: { chapterNumber: 4, chapterTitle: 'Chapter 4: Linear Equations in Two Variables', subjectName: 'Mathematics', summary: 'Standard form ax+by+c=0, solutions of linear equations, graph representation.' },
  iemh105: { chapterNumber: 5, chapterTitle: "Chapter 5: Introduction to Euclid's Geometry", subjectName: 'Mathematics', summary: "Euclid's definitions, axioms, postulates, and geometric foundations." },
  iemh106: { chapterNumber: 6, chapterTitle: 'Chapter 6: Lines and Angles', subjectName: 'Mathematics', summary: 'Intersecting lines, vertically opposite angles, transversal and parallel lines.' },
  iemh107: { chapterNumber: 7, chapterTitle: 'Chapter 7: Triangles', subjectName: 'Mathematics', summary: 'Congruence criteria (SAS, ASA, SSS, RHS), properties of isosceles triangles.' },
  iemh108: { chapterNumber: 8, chapterTitle: 'Chapter 8: Quadrilaterals', subjectName: 'Mathematics', summary: 'Properties of parallelogram, mid-point theorem, quadrilateral angle sum.' },
  iemh109: { chapterNumber: 9, chapterTitle: 'Chapter 9: Circles', subjectName: 'Mathematics', summary: 'Chords, subtended angles, cyclic quadrilaterals, perpendicular from centre.' },
  iemh110: { chapterNumber: 10, chapterTitle: "Chapter 10: Heron's Formula", subjectName: 'Mathematics', summary: "Area of triangle using semi-perimeter s and Heron's formula." },
  iemh111: { chapterNumber: 11, chapterTitle: 'Chapter 11: Surface Areas and Volumes', subjectName: 'Mathematics', summary: 'Surface area & volume of right circular cones, spheres and hemispheres.' },
  iemh112: { chapterNumber: 12, chapterTitle: 'Chapter 12: Statistics', subjectName: 'Mathematics', summary: 'Graphical representation of data, bar graphs, histograms, frequency polygons.' },
  iemh1ps: { chapterNumber: 0, chapterTitle: 'Proofs in Mathematics & Answers', subjectName: 'Mathematics', summary: 'Mathematical proof principles and complete textbook exercise solutions.' },

  // Class 9 Science (iesc1)
  iesc101: { chapterNumber: 1, chapterTitle: 'Chapter 1: Matter in Our Surroundings', subjectName: 'Science', summary: 'States of matter, evaporation, latent heat, effect of temperature and pressure.' },
  iesc102: { chapterNumber: 2, chapterTitle: 'Chapter 2: Is Matter Around Us Pure', subjectName: 'Science', summary: 'Mixtures, solutions, suspensions, colloids, separation techniques, physical & chemical changes.' },
  iesc103: { chapterNumber: 3, chapterTitle: 'Chapter 3: Atoms and Molecules', subjectName: 'Science', summary: 'Laws of chemical combination, Dalton atomic theory, atomic mass, chemical formulae.' },
  iesc104: { chapterNumber: 4, chapterTitle: 'Chapter 4: Structure of the Atom', subjectName: 'Science', summary: 'Thomson, Rutherford, Bohr models, electrons, protons, neutrons, valency, isotopes.' },
  iesc105: { chapterNumber: 5, chapterTitle: 'Chapter 5: The Fundamental Unit of Life', subjectName: 'Science', summary: 'Cell structure, plasma membrane, nucleus, cytoplasm, ER, Golgi, lysosomes, mitochondria.' },
  iesc106: { chapterNumber: 6, chapterTitle: 'Chapter 6: Tissues', subjectName: 'Science', summary: 'Plant tissues (meristematic, permanent, xylem, phloem) & animal tissues (epithelial, muscular, nervous).' },
  iesc107: { chapterNumber: 7, chapterTitle: 'Chapter 7: Motion', subjectName: 'Science', summary: 'Distance, displacement, velocity, acceleration, uniform circular motion, equations of motion.' },
  iesc108: { chapterNumber: 8, chapterTitle: 'Chapter 8: Force and Laws of Motion', subjectName: 'Science', summary: "Newton's three laws of motion, inertia, momentum, conservation of momentum." },
  iesc109: { chapterNumber: 9, chapterTitle: 'Chapter 9: Gravitation', subjectName: 'Science', summary: 'Universal law of gravitation, free fall, mass vs weight, thrust, pressure, Archimedes principle.' },
  iesc110: { chapterNumber: 10, chapterTitle: 'Chapter 10: Work and Energy', subjectName: 'Science', summary: 'Scientific concept of work, kinetic & potential energy, law of conservation of energy, power.' },
  iesc111: { chapterNumber: 11, chapterTitle: 'Chapter 11: Sound', subjectName: 'Science', summary: 'Production & propagation of sound, longitudinal waves, reflection of sound, echo, human ear.' },
  iesc112: { chapterNumber: 12, chapterTitle: 'Chapter 12: Improvement in Food Resources', subjectName: 'Science', summary: 'Crop variety improvement, nutrient management, animal husbandry, poultry, fisheries.' },
  iesc1ps: { chapterNumber: 0, chapterTitle: 'Answers to Science Exercises', subjectName: 'Science', summary: 'Complete NCERT Science exemplar solutions and answers.' },

  // Class 9 English (iebe1 - Beehive)
  iebe101: { chapterNumber: 1, chapterTitle: 'Chapter 1: The Fun They Had', subjectName: 'English', summary: 'Story by Isaac Asimov about future computerized schooling, plus poem "The Road Not Taken".' },
  iebe102: { chapterNumber: 2, chapterTitle: 'Chapter 2: The Sound of Music', subjectName: 'English', summary: 'Evelyn Glennie and Bismillah Khan, plus poem "Wind".' },
  iebe103: { chapterNumber: 3, chapterTitle: 'Chapter 3: The Little Girl', subjectName: 'English', summary: 'Kezia relationship with her father by Katherine Mansfield, plus poem "Rain on the Roof".' },
  iebe104: { chapterNumber: 4, chapterTitle: 'Chapter 4: A Truly Beautiful Mind', subjectName: 'English', summary: 'Biographical study of Albert Einstein, plus poem "The Lake Isle of Innisfree".' },
  iebe105: { chapterNumber: 5, chapterTitle: 'Chapter 5: The Snake and the Mirror', subjectName: 'English', summary: 'Vaikom Muhammad Basheer narrative, plus poem "A Legend of the Northland".' },
  iebe106: { chapterNumber: 6, chapterTitle: 'Chapter 6: My Childhood', subjectName: 'English', summary: 'Dr. A.P.J. Abdul Kalam early life extracts from Wings of Fire, plus poem "No Men Are Foreign".' },
  iebe107: { chapterNumber: 7, chapterTitle: 'Chapter 7: Reach for the Top', subjectName: 'English', summary: 'Santosh Yadav and Maria Sharapova, plus poem "On Killing a Tree".' },
  iebe108: { chapterNumber: 8, chapterTitle: 'Chapter 8: Kathmandu', subjectName: 'English', summary: 'Vikram Seth travelogue of Pashupatinath and Baudhnath temples, plus poem "A Slumber Did My Spirit Seal".' },
  iebe109: { chapterNumber: 9, chapterTitle: 'Chapter 9: If I Were You', subjectName: 'English', summary: 'Play by Douglas James featuring Gerrard outwitting an intruder.' },

  // Class 9 Social Science - History (iest1)
  iest101: { chapterNumber: 1, chapterTitle: 'Chapter 1: The French Revolution', subjectName: 'Social Science (History)', summary: 'Storming of Bastille, National Assembly, Reign of Terror, abolition of slavery.' },
  iest102: { chapterNumber: 2, chapterTitle: 'Chapter 2: Socialism in Europe and the Russian Revolution', subjectName: 'Social Science (History)', summary: 'Liberals, radicals, conservatives, Bolsheviks, October Revolution, Stalin collectivization.' },
  iest103: { chapterNumber: 3, chapterTitle: 'Chapter 3: Nazism and the Rise of Hitler', subjectName: 'Social Science (History)', summary: 'Weimar Republic crisis, Hitler rise to power, Nazi worldview, youth in Nazi Germany.' },
  iest104: { chapterNumber: 4, chapterTitle: 'Chapter 4: Forest Society and Colonialism', subjectName: 'Social Science (History)', summary: 'Deforestation, commercial forestry, rebellion in the forest, Java forest transformations.' },
  iest105: { chapterNumber: 5, chapterTitle: 'Chapter 5: Pastoralists in the Modern World', subjectName: 'Social Science (History)', summary: 'Pastoral nomads in mountains and plateaus, colonial rule impacts on pastoral life.' },

  // Class 9 Social Science - Geography (iest2)
  iest201: { chapterNumber: 1, chapterTitle: 'Chapter 1: India - Size and Location', subjectName: 'Social Science (Geography)', summary: 'Latitudinal & longitudinal extent, standard meridian, India and the world, neighbours.' },
  iest202: { chapterNumber: 2, chapterTitle: 'Chapter 2: Physical Features of India', subjectName: 'Social Science (Geography)', summary: 'Himalayas, Northern Plains, Peninsular Plateau, Indian Desert, Coastal Plains, Islands.' },
  iest203: { chapterNumber: 3, chapterTitle: 'Chapter 3: Drainage', subjectName: 'Social Science (Geography)', summary: 'Himalayan and Peninsular river systems, lakes, economic role of rivers, pollution.' },
  iest204: { chapterNumber: 4, chapterTitle: 'Chapter 4: Climate', subjectName: 'Social Science (Geography)', summary: 'Climatic controls, Indian monsoon mechanisms, seasons, rainfall distribution.' },
  iest205: { chapterNumber: 5, chapterTitle: 'Chapter 5: Natural Vegetation and Wildlife', subjectName: 'Social Science (Geography)', summary: 'Forest types (tropical evergreen, deciduous, thorn, montane, mangrove), wildlife conservation.' },
  iest206: { chapterNumber: 6, chapterTitle: 'Chapter 6: Population', subjectName: 'Social Science (Geography)', summary: 'Population size, distribution, growth, processes of change, age composition, literacy.' },

  // Class 9 Social Science - Pol Sci (iest3)
  iest301: { chapterNumber: 1, chapterTitle: 'Chapter 1: What is Democracy? Why Democracy?', subjectName: 'Social Science (Pol Sci)', summary: 'Features of democracy, arguments for and against democracy, broader meanings.' },
  iest302: { chapterNumber: 2, chapterTitle: 'Chapter 2: Constitutional Design', subjectName: 'Social Science (Pol Sci)', summary: 'Democratic constitution in South Africa, why we need a constitution, guiding values of Indian Constitution.' },
  iest303: { chapterNumber: 3, chapterTitle: 'Chapter 3: Electoral Politics', subjectName: 'Social Science (Pol Sci)', summary: 'Why elections, system of elections in India, Election Commission, democratic participation.' },
  iest304: { chapterNumber: 4, chapterTitle: 'Chapter 4: Working of Institutions', subjectName: 'Social Science (Pol Sci)', summary: 'Parliament, Prime Minister and Council of Ministers, President, Judiciary.' },
  iest305: { chapterNumber: 5, chapterTitle: 'Chapter 5: Democratic Rights', subjectName: 'Social Science (Pol Sci)', summary: 'Life without rights, rights in a democracy, fundamental rights in Indian Constitution.' },

  // Class 9 Social Science - Economics (iest4)
  iest401: { chapterNumber: 1, chapterTitle: 'Chapter 1: The Story of Village Palampur', subjectName: 'Social Science (Economics)', summary: 'Factors of production (land, labour, capital, enterprise), farming and non-farming activities.' },
  iest402: { chapterNumber: 2, chapterTitle: 'Chapter 2: People as Resource', subjectName: 'Social Science (Economics)', summary: 'Human capital investment in education & health, economic activities by men and women, unemployment.' },
  iest403: { chapterNumber: 3, chapterTitle: 'Chapter 3: Poverty as a Challenge', subjectName: 'Social Science (Economics)', summary: 'Poverty line estimation, causes of poverty, anti-poverty measures and future challenges.' },
  iest404: { chapterNumber: 4, chapterTitle: 'Chapter 4: Food Security in India', subjectName: 'Social Science (Economics)', summary: 'Food security dimensions, buffer stock, Public Distribution System (PDS), role of cooperatives.' },

  // Class 9 Hindi - Kshitij (ihga1)
  ihga101: { chapterNumber: 1, chapterTitle: 'Chapter 1: Do Bailon Ki Katha', subjectName: 'Hindi (Kshitij)', summary: 'Premchand famous story of Heera and Moti.' },
  ihga102: { chapterNumber: 2, chapterTitle: 'Chapter 2: Lhasa Ki Aur', subjectName: 'Hindi (Kshitij)', summary: 'Rahul Sankrityayan travelogue to Tibet.' },
  ihga103: { chapterNumber: 3, chapterTitle: 'Chapter 3: Upbhoktavad Ki Sanskriti', subjectName: 'Hindi (Kshitij)', summary: 'Shyama Charan Dube essay on consumerism culture.' },
  ihga104: { chapterNumber: 4, chapterTitle: 'Chapter 4: Saanwle Sapno Ki Yaad', subjectName: 'Hindi (Kshitij)', summary: 'Jabir Hussain memoir remembering bird watcher Salim Ali.' },
  ihga105: { chapterNumber: 5, chapterTitle: 'Chapter 5: Premchand Ke Phate Joote', subjectName: 'Hindi (Kshitij)', summary: 'Harishankar Parsai sharp satirical essay.' },
  ihga106: { chapterNumber: 6, chapterTitle: 'Chapter 6: Mere Bachpan Ke Din', subjectName: 'Hindi (Kshitij)', summary: 'Mahadevi Verma reminiscence of her childhood and hostel days.' },
  ihga107: { chapterNumber: 7, chapterTitle: 'Chapter 7: Sakhiyan Evam Sabad (Kabir)', subjectName: 'Hindi (Kshitij)', summary: 'Kabir devotional dohas and philosophical poems.' },
  ihga108: { chapterNumber: 8, chapterTitle: 'Chapter 8: Vaakh (Lal Ded)', subjectName: 'Hindi (Kshitij)', summary: 'Kashmiri saint-poet Lal Ded spiritual verses.' },
  ihga109: { chapterNumber: 9, chapterTitle: 'Chapter 9: Savaiye (Raskhan)', subjectName: 'Hindi (Kshitij)', summary: 'Raskhan devotion to Lord Krishna in Braj.' },
  ihga110: { chapterNumber: 10, chapterTitle: 'Chapter 10: Kaidi Aur Kokila', subjectName: 'Hindi (Kshitij)', summary: 'Makhanlal Chaturvedi patriotic poem on freedom struggle in jail.' },
};

/**
 * Fast & Intelligent Chapter Name Identifier
 * 1. Checks NCERT Standard Codebook dictionary (instant 0ms)
 * 2. Uses NVIDIA NIM AI on the filename / folder name directly (<200ms) without heavy PDF loading!
 */
export async function identifyChapterFromFileNameWithNim(
  fileName: string,
  folderName: string = '',
  classGrade: string = 'Class 9',
  options?: {
    apiKey?: string;
    model?: string;
    baseUrl?: string;
  }
): Promise<NimChapterIdentificationResult> {
  const baseCode = fileName.toLowerCase().replace(/\.pdf$/i, '').trim();

  // 1. Instant 0ms Match in NCERT Codebook
  if (NCERT_CODEBOOK_MAP[baseCode]) {
    return NCERT_CODEBOOK_MAP[baseCode];
  }

  // Check if baseCode matches substring like "iemh101" inside longer name
  for (const [code, val] of Object.entries(NCERT_CODEBOOK_MAP)) {
    if (baseCode.includes(code)) {
      return val;
    }
  }

  // 2. Query NVIDIA NIM AI on filename & folder name
  const prompt = `You are an expert CBSE/NCERT curriculum classifier and textbook indexer.
Given the file name "${fileName}" in folder "${folderName}" for "${classGrade}":

Identify the official textbook Chapter Number, exact Chapter Name/Title, and Subject.
Return a valid JSON object matching this schema:
{
  "chapterNumber": <integer e.g. 1, 2, 3...>,
  "chapterTitle": "<Official Title e.g. 'Chapter 1: Number Systems' or 'Chapter 6: Lines and Angles'>",
  "subjectName": "<e.g. 'Mathematics', 'Science', 'English', 'Social Science', 'Hindi'>",
  "summary": "<1-sentence summary>"
}

Return ONLY valid JSON.`;

  try {
    const rawText = await callNvidiaChat(
      [
        {
          role: 'system',
          content: 'You are the NVIDIA NIM academic curriculum indexer. Always output valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      {
        apiKey: options?.apiKey,
        model: options?.model || DEFAULT_NVIDIA_MODEL,
        baseUrl: options?.baseUrl,
        temperature: 0.1,
        maxTokens: 256,
        enableThinking: false,
      }
    );

    const parsed = extractJson<NimChapterIdentificationResult>(rawText);
    if (parsed && parsed.chapterTitle) {
      return parsed;
    }
  } catch (err) {
    console.warn('NIM filename identification error:', err);
  }

  // 3. Fallback heuristic
  const numMatch = fileName.match(/(\d+)/);
  const chapterNumber = numMatch ? parseInt(numMatch[1], 10) : 1;
  const cleanName = fileName.replace(/\.pdf$/i, '').replace(/[_\-]+/g, ' ');

  return {
    chapterNumber,
    chapterTitle: `Chapter ${chapterNumber}: ${cleanName}`,
    subjectName: folderName || 'Textbook',
    summary: 'NCERT Textbook Chapter',
  };
}

/**
 * Uses NVIDIA NIM AI to inspect PDF content directly,
 * identifying the real chapter title and subject purely from the PDF text.
 * Sends only the chapter label (e.g. "Ch 1", "Ch 2"...) and PDF text content.
 */
export async function identifyAndRenamePdfChapterWithNim(
  pdfText: string,
  chapterLabel: string = 'Ch 1',
  classGrade: string = 'Class 9',
  options?: {
    apiKey?: string;
    model?: string;
    baseUrl?: string;
  }
): Promise<NimChapterIdentificationResult> {
  const cleanLabel = chapterLabel.startsWith('Ch ') || chapterLabel.startsWith('Chapter ')
    ? chapterLabel
    : `Ch ${chapterLabel}`;

  const numMatch = cleanLabel.match(/(\d+)/);
  const fallbackNum = numMatch ? parseInt(numMatch[1], 10) : 1;

  if (!pdfText || pdfText.trim().length < 15) {
    return {
      chapterNumber: fallbackNum,
      chapterTitle: `${cleanLabel}: NCERT Content`,
      subjectName: 'Textbook',
      summary: 'NCERT Textbook Chapter',
    };
  }

  const prompt = `You are the NVIDIA NIM Textbook Indexer & Curriculum AI.
Analyze the following text extracted directly from the PDF document for ${cleanLabel} (${classGrade}).
Inspect the headings, definitions, exercise titles, and introductory paragraphs printed inside this PDF:

Extracted PDF Content:
"""
${pdfText.slice(0, 3000)}
"""

Task:
From the text content inside this PDF:
1. Identify the official Chapter Number (e.g. 1, 2, 3...)
2. Identify the official Chapter Name/Title (format strictly as: "${cleanLabel}: <Official Name>", e.g. "${cleanLabel}: Number Systems" or "${cleanLabel}: Matter in Our Surroundings")
3. Identify the Subject Name (e.g. "Mathematics", "Science", "English", "Social Science", "Hindi")
4. Provide a 1-sentence summary of the chapter.

Return a valid JSON object matching this schema:
{
  "chapterNumber": <integer>,
  "chapterTitle": "${cleanLabel}: <Official Name>",
  "subjectName": "<Subject Name>",
  "summary": "<1-sentence summary>"
}

Return ONLY valid JSON.`;

  try {
    const rawText = await callNvidiaChat(
      [
        {
          role: 'system',
          content: 'You are an expert CBSE textbook curriculum indexer. Always output valid JSON.',
        },
        { role: 'user', content: prompt },
      ],
      {
        apiKey: options?.apiKey,
        model: options?.model || DEFAULT_NVIDIA_MODEL,
        baseUrl: options?.baseUrl,
        temperature: 0.1,
        maxTokens: 512,
        enableThinking: false,
      }
    );

    const parsed = extractJson<NimChapterIdentificationResult>(rawText);
    if (parsed && parsed.chapterTitle) {
      if (!parsed.chapterTitle.toLowerCase().startsWith('ch ') && !parsed.chapterTitle.toLowerCase().startsWith('chapter ')) {
        parsed.chapterTitle = `${cleanLabel}: ${parsed.chapterTitle}`;
      }
      return parsed;
    }
  } catch (err) {
    console.warn('NIM PDF text identification error:', err);
  }

  return {
    chapterNumber: fallbackNum,
    chapterTitle: `${cleanLabel}: NCERT Content`,
    subjectName: 'Textbook',
    summary: 'NCERT Textbook Chapter',
  };
}
