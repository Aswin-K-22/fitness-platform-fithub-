import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});
async function ensureIndexes() {
  try {
    await prisma.$runCommandRaw({
      createIndexes: 'Gym',
      indexes: [
        {
          key: { location: '2dsphere' },
          name: 'location_2dsphere',
        },
      ],
    });
    console.log('2dsphere index created on Gym.location');
  } catch (error) {
    console.error('Failed to create 2dsphere index:', error);
  } finally {
    await prisma.$disconnect();
  }
}

ensureIndexes();
export default prisma;