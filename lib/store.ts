import { prisma } from "@/lib/prisma";

export async function getStoreSettings() {
  return prisma.storeSetting.upsert({
    where: { id: "main" },
    create: { id: "main" },
    update: {}
  });
}
