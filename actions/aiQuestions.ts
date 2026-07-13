"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { currentUser } from "@clerk/nextjs/server";

type Category =
    | "FRONTEND"
    | "BACKEND"
    | "FULLSTACK"
    | "DSA"
    | "SYSTEM_DESIGN"
    | "BEHAVIORAL"
    | "DEVOPS"
    | "MOBILE";

interface InterviewQuestion {
    question: string;
    answer: string;
}

interface GenerateInterviewQuestionsParams {
    category: Category;
}

interface GenerateInterviewQuestionsResult {
    questions: InterviewQuestion[];
}

const CATEGORY_PROMPTS: Record<Category, string> = {
    FRONTEND: "React, JavaScript, CSS, performance, accessibility, browser APIs",
    BACKEND:
        "Node.js, REST APIs, databases, authentication, caching, scalability",
    FULLSTACK:
        "full-stack architecture, API design, state management, deployment",
    DSA: "data structures, algorithms, time complexity, problem solving",
    SYSTEM_DESIGN:
        "distributed systems, scalability, databases, microservices, caching",
    BEHAVIORAL:
        "leadership, teamwork, conflict resolution, career growth, STAR method",
    DEVOPS: "CI/CD, Docker, Kubernetes, cloud infrastructure, monitoring",
    MOBILE:
        "React Native, iOS/Android, performance, offline support, app lifecycle",
};

const GEMINI_MODEL = "gemini-2.5-flash-lite";

export const generateInterviewQuestions = async ({
    category,
}: GenerateInterviewQuestionsParams): Promise<GenerateInterviewQuestionsResult> => {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    if (!category || !CATEGORY_PROMPTS[category]) {
        throw new Error("Invalid category");
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("Missing GEMINI_API_KEY environment variable");

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    const prompt = `You are an expert technical interviewer. Generate 6 interview questions for a ${category} role covering: ${CATEGORY_PROMPTS[category]}.
For each question, provide a concise but complete answer (2-4 sentences) that an interviewer can use to evaluate responses.
Respond ONLY with a valid JSON array. No markdown, no backticks, no explanation. Example format:
[{"question": "...", "answer": "..."}, {"question": "...", "answer": "..."}]`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const clean = text.replace(/^```json|^```|```$/gm, "").trim();

    let questions: InterviewQuestion[];
    try {
        questions = JSON.parse(clean) as InterviewQuestion[];
    } catch {
        throw new Error("Failed to parse interview questions from model response");
    }

    return { questions };
};