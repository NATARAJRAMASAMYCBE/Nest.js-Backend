import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { StaticUserService } from './static-user.service';
import { CreateStaticUserDto } from './dto/create-static-user.dto';
import { UpdateStaticUserDto } from './dto/update-static-user.dto';

@Controller('static-user')
export class StaticUserController {
    constructor(private readonly staticUserService: StaticUserService) {}

    @Post()
    create(@Body() createStaticUserDto: CreateStaticUserDto) {
        return this.staticUserService.create(createStaticUserDto);
    }

    @Get()
    findAll() {
        return this.staticUserService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.staticUserService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateStaticUserDto: UpdateStaticUserDto) {
        return this.staticUserService.update(+id, updateStaticUserDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.staticUserService.remove(+id);
    }
}
