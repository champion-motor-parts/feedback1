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
  { branchKey: "hq", area: "repair", code: "KH-R01", position: "Repair / Foreman", name: "MOHAMMAD FADLI BIN MOHD RODZI (PADIL)" },
  { branchKey: "hq", area: "repair", code: "KH-R02", position: "Repair / Foreman", name: "MOHD SHAIFUL HISHAM BIN RAMLI (ISAM)" },
  { branchKey: "hq", area: "repair", code: "KH-R03", position: "Repair / Foreman", name: "MUHAMMAD FARIDUDIN BIN ROSLAN (ALONG)" },
  { branchKey: "hq", area: "repair", code: "KH-R04", position: "Repair / Foreman", name: "MOHD RAIHAN BIN TAIB (WATA)" },
  { branchKey: "hq", area: "repair", code: "KH-R05", position: "Repair / Foreman", name: "MUHAMMAD AIMAN BIN RAMLI (AMEN)" },
  { branchKey: "hq", area: "repair", code: "KH-R06", position: "Repair / Foreman", name: "MUHAMAD ARSYAD BIN AHMAD SUBARI (ACAI)" },
  { branchKey: "hq", area: "repair", code: "KH-R07", position: "Repair / Foreman", name: "MOHD KAMAL FAZMIE BIN HISYAM (AWEI)" },
  { branchKey: "hq", area: "repair", code: "KH-R08", position: "Repair / Foreman", name: "MUHAMMAD AMIN RIDZUAN BIN ZAKARIA (GANU)" },
  { branchKey: "hq", area: "repair", code: "KH-R09", position: "Repair / Foreman", name: "MOHAMAD HASIM BIN RAZALI (AMI)" },
  { branchKey: "hq", area: "repair", code: "KH-R10", position: "Repair / Foreman", name: "MOHAMAD RAKIN BIN A RAHMAN (MUHMUD)" },
  { branchKey: "hq", area: "repair", code: "KH-R11", position: "Repair / Foreman", name: "MOHD FIRDAUS BIN AMRAN (HAPPY)" },
  { branchKey: "hq", area: "repair", code: "KH-R12", position: "Repair / Foreman", name: "MUHAMMAD AMIRUDDIN BIN AMRAN (AMIN)" },
  { branchKey: "hq", area: "repair", code: "KH-R13", position: "Repair / Foreman", name: "WAN MUHAMMAD AKIQ SYAMIN BIN WAN MOHD ANUAR (AKAIT)" },
  { branchKey: "hq", area: "repair", code: "KH-R14", position: "Repair / Foreman", name: "MEGAT SHAHREEZ FAROUQHAIRULLAH BIN JAMIL (MEGAT)" },
  { branchKey: "hq", area: "repair", code: "KH-R15", position: "Repair / Foreman", name: "NOOR SHAHRIZWAN BIN NOOR AIDI (WAN)" },
  { branchKey: "hq", area: "repair", code: "KH-R16", position: "Repair / Foreman", name: "NAZRUL IDHAM BIN MOHD JASWARDY (AU)" },
  { branchKey: "hq", area: "showroom", code: "KH-S01", position: "Showroom Sales", name: "NUR SHAHYRAH BINTI ABD RAHMAN (SHERA)" },
  { branchKey: "hq", area: "showroom", code: "KH-S02", position: "Showroom Sales", name: "NURUL DAYANA BINTI ZULZAIN (NANA)" },
  { branchKey: "hq", area: "showroom", code: "KH-S03", position: "Showroom Sales", name: "SAIDATUL NADIRA BINTI SALEH (SAI)" },
  { branchKey: "hq", area: "showroom", code: "KH-S04", position: "Showroom Sales", name: "MOHAMAD HAIRIE FARIZ BIN ABDUL MAJID (HAIRIE)" },
  { branchKey: "hq", area: "showroom", code: "KH-S05", position: "Showroom Sales", name: "MUHAMMAD ADHA DANISH BIN MOHD NATTA (ADHA)" },
  { branchKey: "hq", area: "showroom", code: "KH-S06", position: "Showroom Sales", name: "PRINTS KINI RAIKKONEN (KIMI)" },
  { branchKey: "hq", area: "counter", code: "KH-C01", position: "Counter", name: "APEK" },
  { branchKey: "hq", area: "counter", code: "KH-C02", position: "Counter", name: "PENDEK" },
  { branchKey: "hq", area: "counter", code: "KH-C03", position: "Counter", name: "ACU" },
  { branchKey: "masai", area: "showroom", code: "MS-S01", position: "Showroom Sales", name: "NURUL NASUHA ROSLAN" },
  { branchKey: "masai", area: "showroom", code: "MS-S02", position: "Showroom Sales", name: "MUHAMMAD SHAHRUL RAHAIZAT BIN ROSLI" },
  { branchKey: "masai", area: "showroom", code: "MS-S03", position: "Showroom Sales", name: "MUHAMMAD AIDIL HAIRIE BIN MOHD FAIZUL" },
  { branchKey: "masai", area: "showroom", code: "MS-S04", position: "Showroom Sales", name: "ANGELIKA ELVY ANAK ENDON" },
  { branchKey: "masai", area: "repair", code: "MS-R01", position: "Repair / Pomen", name: "MUHAMAD KHAIRULLAH BIN MAHASSAN" },
  { branchKey: "masai", area: "repair", code: "MS-R02", position: "Repair / Pomen", name: "MUHAMMAD FAIZAL BIN ABU BAKAR" },
  { branchKey: "masai", area: "repair", code: "MS-R03", position: "Repair / Pomen", name: "MUHAMAD RAFIE BIN CHAMIYAN" },
  { branchKey: "masai", area: "repair", code: "MS-R04", position: "Repair / Pomen", name: "RIDZUAN SYAAH BIN ABDUR RAHMAN" },
  { branchKey: "masai", area: "counter", code: "MS-C01", position: "Counter", name: "AYANG" }
];

const staffPhotoByCode = {
  "KH-R01": "https://lh3.googleusercontent.com/d/1KFyL4QhaH0cxYGo9f6SjYpBGqnNj2qYb",
  "KH-R02": "https://lh3.googleusercontent.com/d/1nYhHGEKPp43W3pmOaHQ4sZdhol-qFqza",
  "KH-R03": "https://lh3.googleusercontent.com/d/1-c-m7uiwlKhoDhc-6mxpsu6p8ZV1bZE7",
  "KH-R04": "https://lh3.googleusercontent.com/d/1IBjD2qvpjzuCmCHBtz95uxXHTWS0pSA8",
  "KH-R05": "https://lh3.googleusercontent.com/d/1lKYlaWUM6EqVxO9AFZ6TmDRjvRtdg7wI",
  "KH-R06": "https://lh3.googleusercontent.com/d/11mIP7HwC5LGUgZEV7CjSqbjevLg3tXUZ",
  "KH-R08": "https://lh3.googleusercontent.com/d/11mU_plIfXeMfZ85aoV65dQswpbT8iPIU",
  "KH-R09": "https://lh3.googleusercontent.com/d/1nPTdgEH_s3PFaDeS_1ON3Xuu2oj7dsG_",
  "KH-R10": "https://lh3.googleusercontent.com/d/1mYQUswbGLzAfxmFoDgOc6-kdM0N5Ijg0",
  "KH-R11": "https://lh3.googleusercontent.com/d/1wgCskq3b6tIO_FHnGXNknEGGAq-dCgDZ",
  "KH-R12": "https://lh3.googleusercontent.com/d/1Djxd9OImBfsyAqgxhy0-SCuc0f1PUqR1",
  "KH-R13": "https://lh3.googleusercontent.com/d/1p7ZQo6l0QZrXKemqmeQSxFjOUJfuMUgg",
  "KH-R14": "https://lh3.googleusercontent.com/d/1MVnPwOLyFycAE_-t3rqamWNJaFbuLISy",
  "KH-R15": "https://lh3.googleusercontent.com/d/1Y3A2rA76VIEa9FMvRc_CZZ18dC1IiiqR",
  "KH-R16": "https://lh3.googleusercontent.com/d/1P3s62Ge6zCD-aZoAGgavu1lnmmVZ-XTk",
  "KH-S02": "https://lh3.googleusercontent.com/d/10JS92UZ7CsZROWrnWEbyWtafee1b-Yyr",
  "KH-S03": "https://lh3.googleusercontent.com/d/1tRgEVqky08Tx-6H5ZhAFm9XjDS55ApSe",
  "KH-S04": "https://lh3.googleusercontent.com/d/1-fknFIDwd5fY_5_tIukKGGvefFgFEweV",
  "KH-S05": "https://lh3.googleusercontent.com/d/1LV6jzn--0GqIP4-hCShDACWMBskSstkK",
  "KH-S06": "https://lh3.googleusercontent.com/d/1ndeRPzjP8NKkxhI9NkPHcuqJpF2FlgO0"
};

function daysAgo(days) {
  const date = new Date();
  date.setDate(date.getDate() - days);
  date.setHours(10 + (days % 8), (days * 7) % 60, 0, 0);
  return date;
}

function staffEmail(seed, index) {
  const rawPrefix = seed.code || `${seed.branchKey}-${String(index + 1).padStart(2, "0")}`;
  const prefix = rawPrefix.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
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
    const seedImageUrl = staffPhotoByCode[seed.code] || null;
    const existing = await prisma.user.findUnique({ where: { email } });
    const data = {
      name: seed.name,
      role: "staff",
      branch_id: branch.id,
      phone: null,
      position: seed.position,
      staff_code: seed.code,
      service_area: seed.area,
      image_url: existing?.image_url || seedImageUrl,
      status: "Active"
    };
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
      OR: [
        { branch_id: { notIn: activeBranchIds } },
        { name: { in: ["Akak", "Suha", "Nana", "YY"] } }
      ]
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

async function deleteInactiveLegacyData() {
  const inactiveStaff = await prisma.user.findMany({
    where: { role: "staff", status: "Inactive" },
    select: { id: true }
  });
  const inactiveStaffIds = inactiveStaff.map((person) => person.id);

  if (inactiveStaffIds.length) {
    await prisma.qRCode.deleteMany({ where: { staff_id: { in: inactiveStaffIds } } });
    await prisma.user.deleteMany({ where: { id: { in: inactiveStaffIds } } });
  }

  const inactiveBranches = await prisma.branch.findMany({
    where: { status: "Inactive" },
    select: { id: true }
  });
  const inactiveBranchIds = inactiveBranches.map((branch) => branch.id);

  if (inactiveBranchIds.length) {
    await prisma.qRCode.deleteMany({ where: { branch_id: { in: inactiveBranchIds } } });
    await prisma.branch.deleteMany({ where: { id: { in: inactiveBranchIds } } });
  }
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
        service_area: person.service_area || "showroom",
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
  const clearFeedbackData = process.env.CLEAR_FEEDBACK_DATA === "1";
  const seedDemoData = process.env.SEED_DEMO_DATA === "1" || resetDemoData;

  if (resetDemoData) {
    console.log("RESET_DEMO_DATA=1 detected. Recreating demo data.");
    await prisma.caseNote.deleteMany();
    await prisma.feedbackImage.deleteMany();
    await prisma.feedback.deleteMany();
    await prisma.qRCode.deleteMany();
    await prisma.user.deleteMany();
    await prisma.branch.deleteMany();
  } else if (clearFeedbackData) {
    console.log("CLEAR_FEEDBACK_DATA=1 detected. Clearing feedback, notes, and photos.");
    await prisma.caseNote.deleteMany();
    await prisma.feedbackImage.deleteMany();
    await prisma.feedback.deleteMany();
  }

  const baseData = await ensureBaseData();

  if (clearFeedbackData || resetDemoData) {
    await deleteInactiveLegacyData();
  }

  if (seedDemoData) {
    await createDemoFeedbacks(baseData);
  } else {
    console.log("Demo feedback not seeded. Branches and staff were synchronized.");
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
