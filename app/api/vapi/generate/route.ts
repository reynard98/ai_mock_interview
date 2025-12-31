import Groq from "groq-sdk";

import { db } from "@/firebase/admin";
import { getRandomInterviewCover } from "@/lib/utils";

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY!,
});

export async function POST(request: Request) {
    try {
        const body = await request.json();

        console.log("REQUEST BODY:", body);

        const {
            type,
            role,
            level,
            techstack,
            amount,
            userid,
            userId,
        } = body;

        const resolvedUserId = userid ?? userId;

        if (
            !type ||
            !role ||
            !level ||
            !techstack ||
            amount == null ||
            !resolvedUserId
        ) {
            return Response.json(
                {
                    success: false,
                    error: "Missing required fields",
                    received: body,
                },
                { status: 400 }
            );
        }

        const completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            temperature: 0.3,
            messages: [
                {
                    role: "system",
                    content:
                        "You are an API that returns ONLY valid JSON. No explanations. No markdown. No extra text.",
                },
                {
                    role: "user",
                    content: `
Generate interview questions.

Rules:
- Output must be a JSON array of strings
- Do not use special characters such as / or *
- Do not include any text outside the JSON array

Context:
Job role: ${role}
Experience level: ${level}
Tech stack: ${techstack}
Focus: ${type}
Number of questions: ${amount}

Return format:
["Question 1", "Question 2", "Question 3"]
          `.trim(),
                },
            ],
        });

        const text = completion.choices[0]?.message?.content;

        if (!text) {
            return Response.json(
                { success: false, error: "Empty model response" },
                { status: 502 }
            );
        }

        let parsedQuestions: string[];

        try {
            parsedQuestions = JSON.parse(text);

            if (
                !Array.isArray(parsedQuestions) ||
                !parsedQuestions.every(q => typeof q === "string")
            ) {
                throw new Error();
            }
        } catch {
            return Response.json(
                {
                    success: false,
                    error: "Invalid JSON from model",
                    raw: text,
                },
                { status: 502 }
            );
        }

        const interview = {
            role: role,
            type: type,
            level: level,
            techstack: techstack.split(",").map((t: string) => t.trim()),
            questions: parsedQuestions,
            userId: resolvedUserId,
            finalized: true,
            coverImage: getRandomInterviewCover(),
            createdAt: new Date().toISOString(),
        };

        await db.collection("interviews").add(interview);

        return Response.json({ success: true }, { status: 200 });
    } catch (error) {
        console.error("Error:", error);
        return Response.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function GET() {
    return Response.json(
        { success: true, data: "Thank you!" },
        { status: 200 }
    );
}
