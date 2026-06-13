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

const branchSeed = [
  {
    key: "hq",
    name: "Kempas Branch (HQ)",
    address: "Kempas, Johor",
    phone: ""
  },
  {
    key: "masai",
    name: "Masai Branch",
    address: "Masai, Johor",
    phone: ""
  }
];

const staffSeed = [
  { branchKey: "hq", code: "A029", name: "MOHAMMAD ADHA DANISH BIN MOHD NATTA" },
  { branchKey: "hq", name: "MOHAMMAD FADLI BIN MOHD RODZI" },
  { branchKey: "hq", name: "MOHAMAD HASIM BIN RAZALI" },
  { branchKey: "hq", name: "MOHAMAD RAKIN BIN A RAHMAN" },
  { branchKey: "hq", name: "MOHD FIRDAUS BIN AMRAN" },
  { branchKey: "hq", name: "MUHAMMAD AMIRUDDIN BIN AMRAN" },
  { branchKey: "hq", name: "WAN MUHAMMAD AKIQ SYAMIN BIN WAN MOHD ANUAR" },
  { branchKey: "hq", name: "MEGAT SHAHREEZ FAROUQHAIRULLAH BIN JAMIL" },
  { branchKey: "hq", name: "NOOR SHAHRIZWAN BIN NOOR AIDI" },
  { branchKey: "hq", name: "NAZRUL IDHAM BIN MOHD JASWARDY" },
  { branchKey: "hq", name: "MOHD SHAIFUL HISHAM BIN RAMLI" },
  { branchKey: "hq", name: "MUHAMMAD FARIDUDIN BIN ROSLAN" },
  { branchKey: "hq", name: "MOHD RAIHAN BIN TAIB" },
  { branchKey: "hq", name: "MUHAMMAD AIMAN BIN RAMLI" },
  { branchKey: "hq", name: "MUHAMAD ARSYAD BIN AHMAD SUBARI" },
  { branchKey: "hq", name: "MOHD KAMAL FAZMIE BIN HISYAM" },
  { branchKey: "hq", name: "MUHAMMAD AMIN RIDZUAN BIN ZAKARIA" },
  { branchKey: "masai", code: "A016", name: "NURUL NASUHA ROSLAN" },
  { branchKey: "masai", code: "A025", name: "MUHAMMAD SHAHRUL RAHAIZAT BIN ROSLI" },
  { branchKey: "masai", code: "MS01", name: "MUHAMMAD AIDIL HAIRIE BIN MOHD FAIZUL" },
  { branchKey: "masai", code: "MS02", name: "MUHAMAD KHAIRULLAH BIN MAHASSAN" },
  { branchKey: "masai", code: "MS03", name: "MUHAMAD RAFIE BIN CHAMIYAN" },
  { branchKey: "masai", code: "MS04", name: "MUHAMMAD FAIZAL BIN ABU BAKAR" },
  { branchKey: "masai", code: "MS05", name: "RIDZUAN SYAAH BIN ABDUR RAHMAN" },
  { branchKey: "masai", code: "MS06", name: "ANGELIKA ELVY ANAK ENDON" }
];

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(10 + (days % 8), (days * 7) % 60, 0, 0);
  return date;
}

function staffEmail(seed, index) {
  const prefix = seed.code ? seed.code.toLowerCase() : `${seed.branchKey}-${String(index + 1).padStart(2, "0")}`;
  return `${prefix}@championmotor.test`;
}

async function findOrCreateBranch(seed) {
  const existing = await prisma.branch.findFirst({ where: { name: seed.name } });
  const data = {
    name: seed.name,
    address: seed.address || null,
    phone: seed.phone || null,
    status: "Active"
  };

  if (existing) {
    return prisma.branch.update({ where: { id: existing.id }, data });
  }

  return prisma.branch.create({ data });
}

async function ensureQRCode(data) {
  const where = data.type === "branch"
    ? { type: "branch", branch_id: data.branch_id }
    : { type: "staff", staff_id: data.staff_id };
  const existing = await prisma.qRCode.findFirst({ where });

  if (existing) {
    return prisma.qRCode.update({ where: { id: existing.id }, data });
  }

  return prisma.qRCode.create({ data });
}

async function ensureBaseData() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const staffPassword = await bcrypt.hash("Staff123!", 10);

  const branchesByKey = {};
  for (const seed of branchSeed) {
    branchesByKey[seed.key] = await findOrCreateBranch(seed);
  }

  const activeBranchIds = Object.values(branchesByKey).map((branch) => branch.id);
  await prisma.branch.updateMany({
    where: { id: { notIn: activeBranchIds } },
    data: { status: "Inactive" }
  });

  const existingAdmin = await prisma.user.findUnique({ where: { email: "admin@championmotor.test" } });
  const admin = existingAdmin
    ? await prisma.user.update({
        where: { email: "admin@championmotor.test" },
        data: {
          name: "Boss Admin",
          role: "admin",
          phone: "+60120000000",
          position: "Owner",
          status: "Active",
          branch_id: null
        }
      })
    : await prisma.user.create({
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

  const activeStaffEmails = [];
  const staff = [];

  for (const [index, seed] of staffSeed.entries()) {
    const email = staffEmail(seed, index);
    const branch = branchesByKey[seed.branchKey];
    const data = {
      name: seed.name,
      role: "staff",
      branch_id: branch.id,
      phone: null,
      position: seed.code || branch.name,
      image_url: null,
      status: "Active"
    };
    const existing = await prisma.user.findUnique({ where: { email } });
    const person = existing
      ? await prisma.user.update({ where: { email }, data })
      : await prisma.user.create({
          data: {
            ...data,
            email,
            password_hash: staffPassword
          }
        });

    activeStaffEmails.push(email);
    staff.push(person);
  }

  await prisma.user.updateMany({
    where: {
      role: "staff",
      email: { notIn: activeStaffEmails }
    },
    data: { status: "Inactive" }
  });

  for (const branch of activeBranchIds.map((id) => Object.values(branchesByKey).find((item) => item.id === id)).filter(Boolean)) {
    await ensureQRCode({
      type: "branch",
      branch_id: branch.id,
      qr_url: `${appUrl}/feedback?branchId=${branch.id}`
    });
  }

  for (const person of staff) {
    await ensureQRCode({
      type: "staff",
      staff_id: person.id,
      qr_url: `${appUrl}/feedback?staffId=${person.id}`
    });
  }

  return { admin, branches: Object.values(branchesByKey), staff };
}

async function createDemoFeedbacks({ admin, branches, staff }) {
  for (let i = 1; i <= 84; i += 1) {
    const person = staff[(i - 1) % staff.length];
    const branch = branches.find((item) => item.id === person.branch_id) || branches[(i + 1) % branches.length];
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
        target_type: "staff",
        target_label: person.name,
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
}

async function main() {
  const resetDemoData = process.env.RESET_DEMO_DATA === "1";
  const existingFeedbacks = await prisma.feedback.count();

  if (resetDemoData) {
    console.log("RESET_DEMO_DATA=1 detected. Recreating demo data.");
    await prisma.caseNote.deleteMany();
    await prisma.feedbackImage.deleteMany();
    await prisma.feedback.deleteMany();
    await prisma.qRCode.deleteMany();
    await prisma.user.deleteMany();
    await prisma.branch.deleteMany();
  }

  const baseData = await ensureBaseData();

  if (resetDemoData || existingFeedbacks === 0) {
    await createDemoFeedbacks(baseData);
  } else {
    console.log("Existing feedback records preserved. Branches and staff were synchronized.");
  }

  console.log("Seed complete.");
  console.log("Admin login: admin@championmotor.test / Admin123!");
  console.log("Staff login password for new staff: Staff123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
