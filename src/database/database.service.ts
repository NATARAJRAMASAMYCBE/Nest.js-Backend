import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class DatabaseService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    // constructor() {
    //     // const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });
    //     // super({ adapter });
    //     super();
    // }
    constructor() {
        const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
        super({ adapter });

        console.log('DB URL 👉fdgdfgdfgdf', process.env.DATABASE_URL);
    }

    // async onModuleInit() {
    //     await this.$connect();
    // }

    async onModuleInit() {
        console.log('Connecting to DB...');
        await this.$connect();
        console.log('Connected!');
    }

    async onModuleDestroy() {
        await this.$disconnect();
    }
}
