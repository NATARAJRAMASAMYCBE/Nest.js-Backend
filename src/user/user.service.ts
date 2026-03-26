import { BadRequestException, Injectable } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class UserService {
    constructor(private readonly databaseService: DatabaseService) {}

    async create(userData: Prisma.UserCreateInput | Prisma.UserCreateInput[]): Promise<User | User[]> {
        if (Array.isArray(userData)) {
            return Promise.all(userData.map((data) => this.databaseService.user.create({ data })));
        }
        const existingUser = await this.databaseService.user.findFirst({ where: { OR: [{ email: userData.email }, { name: userData.name }] } });
        if (existingUser) {
            throw new BadRequestException(`User already exists with email: ${userData.email} or name: ${userData.name}`);
        }
        return this.databaseService.user.create({ data: userData });
    }

    async findAll(): Promise<User[]> {
        return this.databaseService.user.findMany();
    }

    async findOne(id: number): Promise<User | null> {
        return this.databaseService.user.findUnique({ where: { id } });
    }

    async update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
        return this.databaseService.user.update({
            where: { id },
            data,
        });
    }

    async remove(id: number): Promise<User> {
        return this.databaseService.user.delete({ where: { id } });
    }

    async removeMany(ids: number[]): Promise<User[]> {
        return Promise.all(ids.map((id) => this.databaseService.user.delete({ where: { id } })));
    }
}
