const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

const feedbackTypes = [
  "Product Issue",
  "Installation Issue",
  "Service Attitude",
  "Slow Reply",
  "Wrong Item",
  "Warranty / Claim",
  "Compliment",
  "General Feedback",
  "Other"
];

const statuses = ["New", "In Progress", "Waiting Customer", "Resolved", "Escalated"];
const customerNames = [
  "Ahmad",
  "Mei Ling",
  "Kumar",
  "Siti",
  "Jason",
  "Farah",
  "Daniel",
  "Nadia",
  "Wei Han",
  "Arif",
  "Aina",
  "Kok Leong"
];

const comments = [
  "Need help checking the part fitment before installation.",
  "Reply was slower than expected, please follow up.",
  "The staff explained the warranty process clearly.",
  "Wrong item was packed and I need an exchange.",
  "Installation looks good but I hear a small noise.",
  "Product arrived with scratches on the cover.",
  "Service was friendly and the issue was solved quickly.",
  "Please call me back about the replacement part.",
  "Good experience overall, thank you.",
  "I need a status update for my claim."
];

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(10 + (days % 8), (days * 7) % 60, 0, 0);
  return date;
}

async function main() {
  const resetDemoData = process.env.RESET_DEMO_DATA === "1";
  const existingUsers = await prisma.user.count();
  const existingFeedbacks = await prisma.feedback.count();

  if (!resetDemoData && (existingUsers > 0 || existingFeedbacks > 0)) {
    console.log("Seed skipped: database already has data. Set RESET_DEMO_DATA=1 to recreate demo data.");
    return;
  }

  if (resetDemoData) {
    console.log("RESET_DEMO_DATA=1 detected. Recreating demo data.");
  }

  await prisma.caseNote.deleteMany();
  await prisma.feedbackImage.deleteMany();
  await prisma.feedback.deleteMany();
  await prisma.qRCode.deleteMany();
  await prisma.user.deleteMany();
  await prisma.branch.deleteMany();

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const staffPassword = await bcrypt.hash("Staff123!", 10);

  const branches = await Promise.all([
    prisma.branch.create({
      data: {
        name: "HQ Showroom",
        address: "No. 1 Jalan Motor, Johor Bahru",
        phone: "+607-111 0001"
      }
    }),
    prisma.branch.create({
      data: {
        name: "JB Branch",
        address: "No. 22 Jalan Service, Johor Bahru",
        phone: "+607-222 0002"
      }
    }),
    prisma.branch.create({
      data: {
        name: "Skudai Branch",
        address: "No. 33 Jalan Parts, Skudai",
        phone: "+607-333 0003"
      }
    })
  ]);

  const admin = await prisma.user.create({
    data: {
      name: "Boss Admin",
      email: "admin@championmotor.test",
      password_hash: adminPassword,
      role: "admin",
      phone: "+60120000000",
      position: "Owner",
      status: "Active"
    }
  });

  const staffSeed = [
    ["Akak", "akak@championmotor.test", "Senior Staff", branches[0].id, "+60121110001", "/staff/akak.svg"],
    ["Suha", "suha@championmotor.test", "Sales Staff", branches[1].id, "+60121110002", "/staff/suha.svg"],
    ["Nana", "nana@championmotor.test", "Sales Staff", branches[2].id, "+60121110003", "/staff/nana.svg"],
    ["YY", "yy@championmotor.test", "Sales Staff", branches[0].id, "+60121110004", "/staff/yy.svg"]
  ];

  const staff = [];
  for (const [name, email, position, branchId, phone, imageUrl] of staffSeed) {
    staff.push(
      await prisma.user.create({
        data: {
          name,
          email,
          password_hash: staffPassword,
          role: "staff",
          branch_id: branchId,
          phone,
          position,
          image_url: imageUrl,
          status: "Active"
        }
      })
    );
  }

  for (const branch of branches) {
    await prisma.qRCode.create({
      data: {
        type: "branch",
        branch_id: branch.id,
        qr_url: `${appUrl}/feedback?branchId=${branch.id}`
      }
    });
  }

  for (const person of staff) {
    await prisma.qRCode.create({
      data: {
        type: "staff",
        staff_id: person.id,
        qr_url: `${appUrl}/feedback?staffId=${person.id}`
      }
    });
  }

  for (let i = 1; i <= 84; i += 1) {
    const person = staff[(i - 1) % staff.length];
    const branch = branches[(i + 1) % branches.length];
    const type = feedbackTypes[(i * 2) % feedbackTypes.length];
    const rating = (i % 5) + 1;
    const status = statuses[i % statuses.length];
    const createdAt = daysAgo(i % 45);
    const resolvedAt = status === "Resolved" ? new Date(createdAt.getTime() + 2 * 86400000) : null;
    const feedback = await prisma.feedback.create({
      data: {
        case_id: `FB-${String(i).padStart(6, "0")}`,
        branch_id: branch.id,
        staff_id: person.id,
        customer_name: customerNames[i % customerNames.length],
        customer_phone: i % 3 === 0 ? `+6012${String(3000000 + i).padStart(7, "0")}` : `01${String(20000000 + i).padStart(8, "0")}`,
        feedback_type: type,
        rating,
        comment: comments[i % comments.length],
        status,
        priority: rating <= 2 ? "High" : "Normal",
        created_at: createdAt,
        updated_at: resolvedAt || createdAt,
        resolved_at: resolvedAt
      }
    });

    if (i % 5 === 0) {
      const demoImage =
        i % 10 === 0
          ? "/uploads/demo-installation.svg"
          : i % 15 === 0
            ? "/uploads/demo-warranty.svg"
            : "/uploads/demo-product-issue.svg";
      await prisma.feedbackImage.create({
        data: {
          feedback_id: feedback.id,
          image_url: demoImage
        }
      });
    }

    if (i % 7 === 0) {
      await prisma.caseNote.create({
        data: {
          feedback_id: feedback.id,
          user_id: admin.id,
          note: "Demo note: customer follow-up recorded for testing."
        }
      });
    }
  }

  console.log("Seed complete.");
  console.log("Admin login: admin@championmotor.test / Admin123!");
  console.log("Staff login: akak@championmotor.test / Staff123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
