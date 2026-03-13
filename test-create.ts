import prisma from './src/lib/prisma.js';

async function testCreate() {
    try {
        console.log('Attempting to create a board member...');
        const member = await prisma.boardMember.create({
            data: {
                name: 'Manual Test',
                role: 'Tester',
                image: 'https://example.com/test.jpg'
            }
        });
        console.log('Member created:', member);
        process.exit(0);
    } catch (err) {
        console.error('Failed to create member:', err);
        process.exit(1);
    }
}

testCreate();
