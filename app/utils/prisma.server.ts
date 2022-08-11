import { PrismaClient } from "@prisma/client";

let prisma :PrismaClient

declare global {
    var __db: PrismaClient | undefined
}

if (process.env.NODE_ENV === 'production') {
    prisma = new PrismaClient()
    prisma.$connect()
    
} else {
    if (!global.__db) {
        global.__db = new PrismaClient()
        global.__db.$connect()
    }

    prisma = global.__db
}

//  There are precautions put into place above that prevent live-reloads 
//  from saturating your database with connections while developing.

export { prisma }