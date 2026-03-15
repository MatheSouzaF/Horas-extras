import { prisma } from './src/lib/prisma.js';
import bcrypt from 'bcryptjs';

async function main() {
  try {
    const user = await prisma.user.findUnique({ where: { email: 'matheusdsouza97@gmail.com' } });
    if (!user) { console.log('user not found'); return; }
    console.log('user found:', user.email);
    const match = await bcrypt.compare('72647264@Ma', user.passwordHash);
    console.log('password match:', match);
  } catch(e: any) { console.error('ERROR:', e.message); }
  await prisma.$disconnect();
}
main();
