import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, Users } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UserService {
    constructor(private readonly databaseService: DatabaseService) {}

    async create(userData: Prisma.UsersCreateInput | Prisma.UsersCreateInput[]): Promise<Users | Users[]> {
        if (Array.isArray(userData)) {
            return Promise.all(userData.map((data) => this.databaseService.users.create({ data })));
        }
        const existingUser = await this.databaseService.users.findFirst({ where: { OR: [{ email: userData.email }, { name: userData.name }] } });
        if (existingUser) {
            throw new BadRequestException(`User already exists with email: ${userData.email} or name: ${userData.name}`);
        }
        return this.databaseService.users.create({ data: userData });
    }

    async findAll(): Promise<Users[]> {
        return this.databaseService.users.findMany();
    }

    // async findAll(): Promise<Users[]> {
    //     try {
    //         return await this.databaseService.users.findMany();
    //     } catch (error) {
    //         console.error('🔥 FIND ALL ERROR:', error);
    //         throw error;
    //     }
    // }

    async findOne(id: number): Promise<Users | null> {
        return this.databaseService.users.findUnique({ where: { id } });
    }

    async update(id: number, data: Prisma.UsersUpdateInput): Promise<Users> {
        const user = await this.findOne(id);
        if (!user) {
            throw new BadRequestException('User not found');
        }
        return this.databaseService.users.update({
            where: { id },
            data,
        });
    }

    async remove(id: number): Promise<Users> {
        return this.databaseService.users.delete({ where: { id } });
    }

    async removeMany(ids: number[]): Promise<Users[]> {
        return Promise.all(ids.map((id) => this.databaseService.users.delete({ where: { id } })));
    }
}
