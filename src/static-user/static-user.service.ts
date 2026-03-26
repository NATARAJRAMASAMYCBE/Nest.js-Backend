import { Injectable } from '@nestjs/common';
import { CreateStaticUserDto } from './dto/create-static-user.dto';
import { UpdateStaticUserDto } from './dto/update-static-user.dto';

@Injectable()
export class StaticUserService {
  create(createStaticUserDto: CreateStaticUserDto) {
    return 'This action adds a new staticUser';
  }

  findAll() {
    return `This action returns all staticUser`;
  }

  findOne(id: number) {
    return `This action returns a #${id} staticUser`;
  }

  update(id: number, updateStaticUserDto: UpdateStaticUserDto) {
    return `This action updates a #${id} staticUser`;
  }

  remove(id: number) {
    return `This action removes a #${id} staticUser`;
  }
}
