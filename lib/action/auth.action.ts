"use server";

import { auth, db } from "@/firebase/admin";
import { cookies } from "next/headers";
import { FieldValue } from "firebase-admin/firestore";

/* =====================================================
   Session Configuration
===================================================== */
const SESSION_DURATION = 60 * 60 * 24 * 7; // 7 days

/* =====================================================
   Session Helpers
===================================================== */
async function setSessionCookie(idToken: string) {
    const cookieStore = await cookies();

    const sessionCookie = await auth.createSessionCookie(idToken, {
        expiresIn: SESSION_DURATION * 1000,
    });

    cookieStore.set("session", sessionCookie, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: SESSION_DURATION,
    });
}

/* =====================================================
   Auth Actions
===================================================== */
export async function signUp(params: {
    uid: string;
    name: string;
    email: string;
}) {
    const { uid, name, email } = params;

    const userRef = db.collection("users").doc(uid);
    const snapshot = await userRef.get();

    if (snapshot.exists) {
        return { success: false, message: "User already exists." };
    }

    await userRef.set({
        name,
        email,
        createdAt: FieldValue.serverTimestamp(),
    });

    return { success: true };
}

export async function signIn(params: {
    email: string;
    idToken: string;
}) {
    const { email, idToken } = params;

    await auth.getUserByEmail(email);
    await setSessionCookie(idToken);

    return { success: true };
}

export async function signOut() {
    const cookieStore = await cookies();
    cookieStore.delete("session");
}

/* =====================================================
   Current User
===================================================== */
export async function getCurrentUser() {
    const cookieStore = await cookies();
    const session = cookieStore.get("session")?.value;

    if (!session) return null;

    const decoded = await auth.verifySessionCookie(session, true);
    const doc = await db.collection("users").doc(decoded.uid).get();

    if (!doc.exists) return null;

    return {
        id: doc.id,
        ...doc.data(),
    };
}

/* =====================================================
   Interview Creation (FIXED)
===================================================== */
export async function createInterview(params: {
    userId: string;
    title?: string;
    level: string;
    questions: string[];
    coverImage?: string;
}) {
    const { userId, level, questions, coverImage } = params;

    const ref = await db.collection("interviews").add({
        userId, // 🔴 REQUIRED
        level,
        questions,
        coverImage: coverImage ?? "/covers/default.png",

        finalized: true,
        createdAt: FieldValue.serverTimestamp(), // 🔴 MUST be Timestamp
    });

    return { success: true, interviewId: ref.id };
}

/* =====================================================
   Interview Queries
===================================================== */
export async function getInterviewsByUserId(userId: string) {
    if (!userId) return [];

    const snapshot = await db
        .collection("interviews")
        .where("userId", "==", userId)
        .orderBy("createdAt", "desc")
        .get();

    return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
    }));
}

export async function getLatestInterviews(params: {
    userId: string;
    limit?: number;
}) {
    const { userId, limit = 10 } = params;

    const snapshot = await db
        .collection("interviews")
        .where("finalized", "==", true)
        .orderBy("createdAt", "desc")
        .limit(limit + 5)
        .get();

    return snapshot.docs
        .map((doc) => ({
            id: doc.id,
            ...doc.data(),
        }))
        .filter((i) => i.userId !== userId)
        .slice(0, limit);
}

/* =====================================================
   ONE-TIME MIGRATION (RUN ONCE)
===================================================== */
export async function migrateInterviews(userId: string) {
    const snapshot = await db.collection("interviews").get();
    const batch = db.batch();

    snapshot.docs.forEach((doc) => {
        const data = doc.data();

        if (!data.userId) {
            batch.update(doc.ref, {
                userId,
                createdAt: FieldValue.serverTimestamp(),
                finalized: true,
            });
        }
    });

    await batch.commit();
    return { success: true };
}
