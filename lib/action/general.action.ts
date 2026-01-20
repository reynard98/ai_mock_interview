"use server";

import { generateObject } from "ai";
import { groq } from "@ai-sdk/groq";

import { db } from "@/firebase/admin";
import { feedbackSchema } from "@/constants";

export async function createFeedback(params: CreateFeedbackParams) {
    const { interviewId, userId, transcript, feedbackId } = params;

    try {
        const formattedTranscript = transcript
            .map(
                (sentence: { role: string; content: string }) =>
                    `- ${sentence.role}: ${sentence.content}\n`
            )
            .join("");

        const {
            object: {
                totalScore,
                categoryScores,
                strengths,
                areasForImprovement,
                finalAssessment,
            },
        } = await generateObject({
            model: groq("openai/gpt-oss-20b"),
            schema: feedbackSchema,
            prompt: `
You are an AI interviewer analyzing a mock interview. Be strict and detailed. Provide the feedback in Japanese

Transcript:
${formattedTranscript}

Please score the candidate from 0 to 100 in:
- communication skill
- technical knowledge
- problem solving
- Cultural fit
- 自信と言語化能力
      `,
            system:
                "You are a professional interviewer analyzing a mock interview.",
        });

        // ✅ FIX: SINGLE WRITE ONLY
        const feedbackRef = feedbackId
            ? db.collection("feedback").doc(feedbackId)
            : db.collection("feedback").doc();

        await feedbackRef.set({
            interviewId,
            userId,
            totalScore,
            categoryScores,
            strengths,
            areasForImprovement,
            finalAssessment,
            createdAt: new Date().toISOString(),
        });

        return { success: true, feedbackId: feedbackRef.id };
    } catch (error) {
        console.error("Error saving feedback:", error);
        return { success: false };
    }
}

/* =========================
   READ FUNCTIONS
========================= */

export async function getInterviewById(
    id: string
): Promise<Interview | null> {
    const interview = await db.collection("interviews").doc(id).get();
    if (!interview.exists) return null;

    return { id: interview.id, ...interview.data() } as Interview;
}

export async function getFeedbackByInterviewId(
    params: GetFeedbackByInterviewIdParams
): Promise<Feedback | null> {
    const { interviewId, userId } = params;

    const querySnapshot = await db
        .collection("feedback")
        .where("interviewId", "==", interviewId)
        // .where("userId", "==", userId)
        .limit(1)
        .get();

    if (querySnapshot.empty) return null;

    const feedbackDoc = querySnapshot.docs[0];
    return { id: feedbackDoc.id, ...feedbackDoc.data() } as Feedback;
}

export async function getLatestInterviews(
    params: GetLatestInterviewsParams
): Promise<Interview[] | null> {
    const { userId, limit = 20 } = params;

    const interviews = await db
        .collection("interviews")
        .where("finalized", "==", true)
        // .where("userId", "!=", userId)
        .orderBy("userId")
        .orderBy("createdAt", "desc")
        .limit(limit)
        .get();

    return interviews.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Interview[];
}

export async function getInterviewsByUserId(
    userId: string
): Promise<Interview[] | null> {
    const interviews = await db
        .collection("interviews")
        // .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();

    return interviews.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    })) as Interview[];
}
