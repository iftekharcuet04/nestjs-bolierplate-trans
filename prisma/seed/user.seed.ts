import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      { email: 'user1@example.com', name: 'User One' },
      { email: 'user2@example.com', name: 'User Two' },
      { email: 'user3@example.com', name: 'User Three' },
    ],
    skipDuplicates: true, // Prevents inserting duplicates
  });

  console.log('Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
