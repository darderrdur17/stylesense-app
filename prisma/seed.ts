import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { DEMO_USER_EMAIL, DEMO_USER_PASSWORD } from "../src/lib/demo-account";
import { DEFAULT_INSPIRATIONS } from "../src/lib/seed-inspo";

const prisma = new PrismaClient();

async function main() {
  if (process.env.SEED_DEMO_ACCOUNT === "false") {
    console.log("Skipping demo account (SEED_DEMO_ACCOUNT=false).");
    return;
  }

  const password =
    process.env.DEMO_SEED_PASSWORD?.trim() || DEMO_USER_PASSWORD;
  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.upsert({
    where: { email: DEMO_USER_EMAIL },
    create: {
      email: DEMO_USER_EMAIL,
      name: "Demo User",
      passwordHash,
      preferredStyles: ["casual", "minimalist"],
      location: "New York",
      temperatureUnit: "celsius",
    },
    update: {
      passwordHash,
      name: "Demo User",
    },
  });

  const inspoCount = await prisma.inspiration.count({
    where: { userId: user.id },
  });
  if (inspoCount === 0) {
    await prisma.inspiration.createMany({
      data: DEFAULT_INSPIRATIONS.map((row) => ({
        userId: user.id,
        name: row.name,
        imageUrl: row.imageUrl,
        tags: row.tags,
      })),
    });
  }

  console.log(`Demo user ready: ${DEMO_USER_EMAIL}`);
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
