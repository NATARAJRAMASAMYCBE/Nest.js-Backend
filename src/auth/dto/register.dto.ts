import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
    @IsString()
    @Matches(/^[A-Za-z]+(?:\s[A-Za-z]+)*$/, {
        message: 'Name must contain only letters and spaces',
    })
    name: string;
    @IsEmail() email: string;
    @IsString() @MinLength(7) password: string;
}
