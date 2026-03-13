import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
    // Seed Board Members
    await prisma.boardMember.createMany({
        data: [
            {
                name: "Alex Johnson",
                role: "President",
                image: "/images/board.png",
                github: "#",
                linkedin: "#",
                discord: "#"
            },
            {
                name: "Sarah Chen",
                role: "Vice President",
                image: "/images/board.png",
                github: "#",
                linkedin: "#",
                discord: "#"
            }
        ]
    });

    // Seed Events
    await prisma.event.createMany({
        data: [
            {
                title: "Eco-ML Hackathon",
                description: "Developing energy-efficient models for environmental data analysis.",
                date: "Current — March 15",
                location: "Botany Lab 3",
                time: "Ongoing",
                image: "/images/event1.png",
                tags: ["Green AI", "Research"],
                status: "LIVE"
            },
            {
                title: "Neural Mimicry Workshop",
                description: "Practical session on building biologically inspired neural layers.",
                date: "March 20, 2024",
                location: "Tech Lab 01",
                time: "2:00 PM – 5:00 PM",
                image: "/images/event2.png",
                tags: ["Workshop", "Biomimicry"],
                status: "UPCOMING"
            }
        ]
    });

    console.log('Seed data created successfully');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
