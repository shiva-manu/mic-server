import type { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const createContact = async (req: Request, res: Response) => {
    try {
        const { name, rollnumber, phone, email } = req.body;

        if (!name || !rollnumber || !phone || !email) {
            return res.status(400).json({ error: 'All fields are required' });
        }

        const contact = await prisma.contact.create({
            data: {
                name,
                rollnumber,
                phone,
                email
            }
        });

        res.status(201).json(contact);
    } catch (error) {
        console.error('Error creating contact:', error);
        res.status(500).json({ error: 'Failed to submit contact form' });
    }
};

export const getContacts = async (req: Request, res: Response) => {
    try {
        const contacts = await prisma.contact.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ error: 'Failed to fetch contacts' });
    }
};

export const deleteContact = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        await prisma.contact.delete({
            where: { id: id as string }
        });
        res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({ error: 'Failed to delete contact' });
    }
};
