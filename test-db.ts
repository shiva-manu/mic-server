import prisma from './src/lib/prisma.js';

async function test() {
    try {
        console.log('Testing Prisma connection...');
        const count = await prisma.boardMember.count();
        console.log('Board member count:', count);
        process.exit(0);
    } catch (err) {
        console.error('Prisma connection test failed:', err);
        process.exit(1);
    }
}

test();
