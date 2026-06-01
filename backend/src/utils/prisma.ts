import { PrismaClient } from '@prisma/client';

// PrismaClient dung chung cho backend.
// Import instance nay thay vi tao moi o moi file de tranh mo qua nhieu connection DB.
const prisma = new PrismaClient();

export default prisma;
