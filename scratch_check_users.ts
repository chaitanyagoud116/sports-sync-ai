import { prisma } from './lib/db';

async function main() {
  const users = await prisma.user.findMany({
    select: { email: true, role: true, isActive: true }
  });
  console.log(JSON.stringify(users, null, 2));
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
