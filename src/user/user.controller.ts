import { Body, Controller, Delete, Get, Param, Patch, Post, ValidationPipe } from '@nestjs/common';
import { Prisma, Users } from '@prisma/client';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
    constructor(private readonly usersService: UserService) {}

    @Post()
    async create(@Body() userData: Prisma.UsersCreateInput | Prisma.UsersCreateInput[]): Promise<Users | Users[]> {
        return this.usersService.create(userData);
    }

    @Get()
    async findAll(): Promise<Users[]> {
        return this.usersService.findAll();
    }

    @Get(':id')
    async findOne(@Param('id') id: number): Promise<Users | null> {
        return this.usersService.findOne(id);
    }

    @Patch(':id')
    async update(@Param('id') id: number, @Body(new ValidationPipe()) userData: Prisma.UsersUpdateInput): Promise<Users> {
        return this.usersService.update(id, userData);
    }

    @Delete(':id')
    async remove(@Param('id') id: number): Promise<Users> {
        return this.usersService.remove(id);
    }

    @Delete()
    async removeMany(@Body() ids: number[]): Promise<Users[]> {
        return this.usersService.removeMany(ids);
    }
}
