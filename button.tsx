import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const RESULT_LIMIT = 20;
const RATE_LIMIT_MAX = 60;
const RATE_LIMIT_WINDOW_MS = 60_000;

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const globalForRateLimit = globalThis as typeof globalThis & {
  latestFeedbackRateLimits?: Map<string, RateLimitEntry>;
};

const rateLimits = globalForRateLimit.latestFeedbackRateLimits ?? new Map<string, RateLimitEntry>();
globalForRateLimit.latestFeedbackRateLimits = rateLimits;

function clientKey(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwardedFor || request.headers.get("x-real-ip") || "unknown";
}

function checkRateLimit(request: Request) {
  const now = Date.now();
  const key = clientKey(request);
  const current = rateLimits.get(key);

  if (!current || current.resetAt <= now) {
    const next = { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS };
    rateLimits.set(key, next);
    return { allowed: true, remaining: RATE_LIMIT_MAX - 1, resetAt: next.resetAt };
  }

  if (current.count >= RATE_LIMIT_MAX) {
    return { allowed: false, remaining: 0, resetAt: current.resetAt };
  }

  current.count += 1;
  return { allowed: true, remaining: RATE_LIMIT_MAX - current.count, resetAt: current.resetAt };
}

function rateLimitHeaders(remaining: number, resetAt: number) {
  return {
    "Cache-Control": "no-store",
    "X-RateLimit-Limit": String(RATE_LIMIT_MAX),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000))
  };
}

export async function GET(request: Request) {
  const rateLimit = checkRateLimit(request);
  const headers = rateLimitHeaders(rateLimit.remaining, rateLimit.resetAt);

  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      {
        status: 429,
        headers: {
          ...headers,
          "Retry-After": String(Math.max(1, Math.ceil((rateLimit.resetAt - Date.now()) / 1000)))
        }
      }
    );
  }

  const sinceValue = new URL(request.url).searchParams.get("since");
  const since = sinceValue ? new Date(sinceValue) : null;

  if (sinceValue !== null && (!sinceValue || Number.isNaN(since?.getTime()))) {
    return NextResponse.json(
      { error: "Invalid since parameter. Use an ISO 8601 date and time." },
      { status: 400, headers }
    );
  }

  try {
    const feedbacks = await prisma.feedback.findMany({
      where: since ? { created_at: { gte: since } } : undefined,
      orderBy: [{ created_at: "desc" }, { id: "desc" }],
      take: RESULT_LIMIT,
      select: {
        id: true,
        created_at: true,
        feedback_type: true,
        rating: true,
        comment: true,
        branch: { select: { name: true } },
        staff: { select: { name: true } }
      }
    });

    return NextResponse.json(
      feedbacks.map((feedback) => ({
        id: feedback.id,
        created_at: feedback.created_at.toISOString(),
        type: feedback.feedback_type,
        branch: feedback.branch.name,
        staff_name: feedback.staff?.name ?? null,
        rating: feedback.rating,
        message: feedback.comment
      })),
      { headers }
    );
  } catch (error) {
    console.error("Unable to load latest feedback.", error);
    return NextResponse.json({ error: "Unable to load feedback." }, { status: 500, headers });
  }
}
