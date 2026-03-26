import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { Prisma, User } from '@prisma/client';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly usersService: UserService) {}

    @Post()
    async create(@Body() userData: Prisma.UserCreateInput | Prisma.UserCreateInput[]): Promise<User | User[]> {
        return this.usersService.create(userData);
    }

    @Get()
    async findAll(): Promise<User[]> {
        return this.usersService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: string): Promise<User | null> {
        return this.usersService.findOne(Number(id));
    }

    @Patch(':id')
    async update(@Param('id') id: string, @Body() userData: Prisma.UserUpdateInput): Promise<User> {
        return this.usersService.update(Number(id), userData);
    }

    @Delete(':id')
    async remove(@Param('id') id: string): Promise<User> {
        return this.usersService.remove(Number(id));
    }

    @Delete()
    async removeMany(@Body() ids: number[]): Promise<User[]> {
        return this.usersService.removeMany(ids);
    }
}
