import { PartialType } from '@nestjs/mapped-types';
import { CreateStaticUserDto } from './create-static-user.dto';

export class UpdateStaticUserDto extends PartialType(CreateStaticUserDto) {}
