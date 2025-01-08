import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create initial channels
  const channels = [
    { name: 'general' },
    { name: 'random' },
    { name: 'introductions' },
  ]

  for (const channel of channels) {
    try {
      const existing = await prisma.channel.findFirst({
        where: {
          name: channel.name
        }
      });

      if (!existing) {
        const created = await prisma.channel.create({
          data: {
            name: channel.name,
          },
        });
        console.log(`Created channel: ${created.name} with ID: ${created.id}`);
      } else {
        console.log(`Channel ${channel.name} already exists with ID: ${existing.id}`);
      }
    } catch (error) {
      console.error(`Error processing channel ${channel.name}:`, error);
    }
  }

  const allChannels = await prisma.channel.findMany();
  console.log('\nAll channels:', allChannels);
}

main()
  .catch((e) => {
    console.error('Failed to initialize database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 