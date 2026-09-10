import { NextResponse } from "next/server";
import { executeTravelAgent } from "@/lib/agent/orchestrator";
import { prisma } from "@/lib/prisma";
import { QuizAnswers } from "@/lib/agent/types";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { sessionToken, answers } = body as {
      sessionToken: string;
      answers: QuizAnswers;
    };

    if (!sessionToken || !answers) {
      return NextResponse.json(
        { success: false, error: "Missing sessionToken or answers" },
        { status: 400 }
      );
    }

    const result = await executeTravelAgent({
      sessionToken,
      userMessage: "quiz",
      quizAnswers: answers,
    });

    if (!result.quizResult) {
      return NextResponse.json(
        { success: false, error: "No quiz result returned" },
        { status: 500 }
      );
    }

    // Persist QuizSession and QuizResult
    const session = await prisma.quizSession.upsert({
      where: { sessionToken },
      update: {
        answers: JSON.stringify(answers),
        completedAt: new Date(),
      },
      create: {
        sessionToken,
        answers: JSON.stringify(answers),
      },
    });

    await prisma.quizResult.upsert({
      where: { sessionId: session.id },
      update: {
        region: result.quizResult.region,
        season: result.quizResult.season,
        travelStyle: result.quizResult.travelStyle,
        personalizedCard: result.quizResult.personalizedCard,
      },
      create: {
        sessionId: session.id,
        region: result.quizResult.region,
        season: result.quizResult.season,
        travelStyle: result.quizResult.travelStyle,
        personalizedCard: result.quizResult.personalizedCard,
      },
    });

    return NextResponse.json({
      success: true,
      data: {
        quizResult: result.quizResult,
        sessionId: session.id,
      },
    });
  } catch (error: any) {
    console.error("Quiz API Error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
