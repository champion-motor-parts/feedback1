import QRCode from "qrcode";
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { feedbackLink } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET(request: Request) {
  await requireUser("admin");
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const id = Number(url.searchParams.get("id"));
  const download = url.searchParams.get("download") === "1";

  if (!id || (type !== "staff" && type !== "branch")) {
    return NextResponse.json({ error: "Invalid QR request." }, { status: 400 });
  }

  let qrUrl = "";
  let fileName = "feedback-qr.png";
  if (type === "staff") {
    const staff = await prisma.user.findFirst({ where: { id, role: "staff", status: "Active" } });
    if (!staff) return NextResponse.json({ error: "Staff not found." }, { status: 404 });
    qrUrl = feedbackLink({ staffId: staff.id });
    fileName = `${staff.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-feedback-qr.png`;
  } else {
    const branch = await prisma.branch.findFirst({ where: { id, status: "Active" } });
    if (!branch) return NextResponse.json({ error: "Branch not found." }, { status: 404 });
    qrUrl = feedbackLink({ branchId: branch.id });
    fileName = `${branch.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-feedback-qr.png`;
  }

  const png = await QRCode.toBuffer(qrUrl, {
    type: "png",
    width: 640,
    margin: 2,
    color: {
      dark: "#121212",
      light: "#ffffff"
    }
  });

  return new Response(png, {
    headers: {
      "Content-Type": "image/png",
      "Cache-Control": "no-store",
      ...(download ? { "Content-Disposition": `attachment; filename="${fileName}"` } : {})
    }
  });
}
