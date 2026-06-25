import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const l = await p.lesson.findFirst({
  include: { sentences: { orderBy: { sortOrder: "asc" } } },
});
console.log(`课文: ${l.title} | 总时长: ${l.duration}s`);
l.sentences.forEach((s) =>
  console.log(`  [${s.startTime.toFixed(1)}-${s.endTime.toFixed(1)}] ${s.text}`)
);
await p.$disconnect();
