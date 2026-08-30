// NVIDIA NIM / Dynamo & Python API Client & AI Study Engine

export interface NvidiaModelOption {
  id: string;
  name: string;
  provider: string;
  description: string;
  recommendedFor: string;
}

export const DEFAULT_NVIDIA_MODEL = 'meta/llama-3.2-11b-vision-instruct';
export const DEFAULT_NVIDIA_BASE_URL = 'https://integrate.api.nvidia.com/v1';
export const DEFAULT_NVIDIA_API_KEY = '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';

export const NVIDIA_MODELS: NvidiaModelOption[] = [
  {
    id: 'meta/llama-3.2-11b-vision-instruct',
    name: 'Llama 3.2 11B Vision Instruct',
    provider: 'Meta',
    description: 'Ultra-fast, high-intelligence model with vision & multimodal reasoning. Delivers instant problem-solving, CBSE exam paper synthesis, and active recall explanations.',
    recommendedFor: '⭐ Recommended Default: Instant AI Tutoring, Mock Exam Synthesis & Fast Problem Solving',
  },
  {
    id: 'meta/llama-3.2-90b-vision-instruct',
    name: 'Llama 3.2 90B Vision Instruct',
    provider: 'Meta',
    description: 'Flagship 90B model delivering elite multi-step geometry proofs, rigorous CBSE rubric grading, and deep syllabus diagnostic evaluations.',
    recommendedFor: 'Complex Geometry Proofs, Detailed Marking Rubrics & Full Syllabus Diagnostic Exams',
  },
  {
    id: 'nvidia/nemotron-3.5-lightning-30b-a3b',
    name: 'Nemotron 3.5 Lightning 30B A3B',
    provider: 'NVIDIA',
    description: 'NVIDIA Nemotron 3.5 reasoning engine providing deep step-by-step chain-of-thought analysis for complex physics numericals and algebraic derivations.',
    recommendedFor: 'Step-by-Step Physics Numericals & Algebraic Derivations with Thinking Process',
  },
  {
    id: 'nvidia/nemotron-3-nano-30b-a3b',
    name: 'Nemotron 3 Nano 30B A3B',
    provider: 'NVIDIA',
    description: 'Lightweight NVIDIA Nemotron model optimized for low-latency active recall flashcards, formula lookups, and quick revision checks.',
    recommendedFor: 'Active Recall Testing & Formula Verification',
  },
  {
    id: 'openai/gpt-oss-120b',
    name: 'GPT-OSS 120B Instruct',
    provider: 'OpenAI / Open-Source',
    description: 'High-capacity 120B open model for comprehensive academic problem solving and deep question explanation.',
    recommendedFor: 'Comprehensive Subject Explanations & Theory Review',
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
 * Returns effective base URL, routing through local Vite proxy in browser to prevent CORS 'Failed to fetch' errors
 */
export function getEffectiveBaseUrl(baseUrl?: string): string {
  const url = (baseUrl || DEFAULT_NVIDIA_BASE_URL).trim().replace(/\/+$/, '');
  if (typeof window !== 'undefined') {
    if (url === 'https://integrate.api.nvidia.com/v1' || url === DEFAULT_NVIDIA_BASE_URL || url === '') {
      return '/api/nvidia';
    }
  }
  return url;
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

  try {
    const response = await fetch(`${cleanBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${activeKey}`,
      },
      body: JSON.stringify({
        model: model.trim(),
        messages: [
          { role: 'user', content: 'Respond with exactly one word: "Connected".' },
        ],
        temperature: 0.1,
        max_tokens: 32,
      }),
    });

    const latencyMs = Math.round(performance.now() - startTime);

    if (!response.ok) {
      const errText = await response.text();
      let parsedErr = errText;
      try {
        const json = JSON.parse(errText);
        parsedErr = json.error?.message || json.detail || errText;
      } catch {}
      return {
        success: false,
        latencyMs,
        message: `NVIDIA API Error (${response.status}): ${parsedErr}`,
      };
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content?.trim() || 'Connected';

    return {
      success: true,
      latencyMs,
      message: `Connection Verified! Model: ${model} (Latency: ${latencyMs}ms, Response: "${reply}")`,
    };
  } catch (err) {
    const latencyMs = Math.round(performance.now() - startTime);
    return {
      success: false,
      latencyMs,
      message: `Network/CORS Error: ${err instanceof Error ? err.message : 'Failed to reach NVIDIA API endpoint'}. Ensure your key is active and endpoint is reachable.`,
    };
  }
}

// Call NVIDIA Chat Completions API with Multimodal Vision & Reasoning Support
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
    maxTokens?: number;
    enableThinking?: boolean;
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
    temperature: options?.temperature ?? 0.3,
    max_tokens: options?.maxTokens ?? 1500,
  };

  // Optional thinking configuration for models that explicitly support reasoning kwargs
  if (options?.enableThinking && (model.includes('nemotron-3-ultra') || model.includes('reasoning'))) {
    payload.extra_body = {
      chat_template_kwargs: { enable_thinking: true },
    };
  }

  let response = await fetch(`${cleanBaseUrl}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify(payload),
  });

  // If 400 Bad Request occurs (possibly due to extra_body), retry without extra_body
  if (!response.ok && payload.extra_body && response.status === 400) {
    delete payload.extra_body;
    response = await fetch(`${cleanBaseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey.trim()}`,
      },
      body: JSON.stringify(payload),
    });
  }

  if (!response.ok) {
    const errText = await response.text();
    let msg = errText;
    try {
      const parsed = JSON.parse(errText);
      msg = parsed.error?.message || parsed.detail || errText;
    } catch {}
    throw new Error(`NVIDIA API ${response.status}: ${msg}`);
  }

  const data = await response.json();
  const choice = data.choices?.[0]?.message;
  if (!choice) return '';

  const reasoning = choice.reasoning_content;
  let content = choice.content || '';

  // Extract <think> tags if model embedded thinking in content
  const thinkMatch = content.match(/<think>([\s\S]*?)<\/think>/);
  let extractedThinking = reasoning;
  if (thinkMatch) {
    extractedThinking = thinkMatch[1].trim();
    content = content.replace(/<think>[\s\S]*?<\/think>/, '').trim();
  }

  if (extractedThinking && extractedThinking.trim()) {
    return `> 💭 **AI Thinking Process:**\n> ${extractedThinking.trim().replace(/\n/g, '\n> ')}\n\n${content}`;
  }

  return content;
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
    maxTokens: 1500,
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
    { apiKey, model, baseUrl, temperature: 0.2, maxTokens: 2500, enableThinking: false }
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
    { apiKey, model, baseUrl, temperature: 0.1, maxTokens: 2000, enableThinking: false }
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
        maxTokens: 1000,
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


