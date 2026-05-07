/* eslint-disable @typescript-eslint/no-unused-vars */
import { ConflictException, HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { DatabaseService } from 'src/database/database.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
    constructor(
        private jwt: JwtService,
        private config: ConfigService,
        private prisma: DatabaseService
    ) {}

    async register(dto: RegisterDto) {
        try {
            const exists = await this.prisma.users.findUnique({
                where: { email: dto.email },
            });

            if (exists) {
                throw new ConflictException('Email already registered');
            }

            const hashed = await bcrypt.hash(dto.password, 12);

            const user = await this.prisma.users.create({
                data: {
                    email: dto.email,
                    password: hashed,
                    name: dto.name,
                },
            });

            const tokens = await this.generateTokens(user.id, user.email);
            await this.saveRefreshToken(user.id, tokens.refreshToken);

            const { password, refreshToken, ...safeUser } = user;
            return {
                isSuccess: true,
                message: 'User registered successfully',
                data: {
                    user: safeUser,
                    accessToken: tokens.accessToken,
                    refreshToken: tokens.refreshToken,
                },
            };
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new HttpException(
                    {
                        isSuccess: false,
                        message: error.message || 'User Registration failed',
                    },
                    500
                );
            }

            throw new HttpException(
                {
                    isSuccess: false,
                    message: 'User Registration failed',
                },
                500
            );
        }
    }

    async login(dto: LoginDto) {
        const user = await this.prisma.users.findUnique({ where: { email: dto.email } });
        if (!user) throw new UnauthorizedException('Invalid credentials');

        const valid = await bcrypt.compare(dto.password, user.password);

        if (!valid) throw new UnauthorizedException('Invalid credentials');

        const tokens = await this.generateTokens(user.id, user.email);
        await this.saveRefreshToken(user.id, tokens.refreshToken);

        const { password, refreshToken, ...safeUser } = user;

        return {
            isSuccess: true,
            message: 'User logged in successfully',
            data: {
                ...safeUser,
                accessToken: tokens.accessToken,
                refreshToken: tokens.refreshToken,
            },
        };
    }

    async logout(id: number) {
        await this.prisma.users.update({
            where: { id: id },
            data: { refreshToken: null },
        });
        return { message: 'Logged out successfully' };
    }

    async refresh(id: number, rawToken: string) {
        const user = await this.prisma.users.findUnique({ where: { id: id } });
        if (!user?.refreshToken) throw new UnauthorizedException('Access denied');

        const valid = await bcrypt.compare(rawToken, user.refreshToken);
        if (!valid) throw new UnauthorizedException('Access denied');

        const tokens = await this.generateTokens(user.id, user.email);
        await this.saveRefreshToken(user.id, tokens.refreshToken);
        return tokens;
    }

    async getMe(id: number) {
        const user = await this.prisma.users.findUnique({ where: { id: id } });
        if (!user) throw new UnauthorizedException();
        const { refreshToken, ...safeUser } = user;
        return {
            user: safeUser,
        };
    }

    private async generateTokens(id: number, email: string) {
        const payload = { sub: id, email };
        const [accessToken, refreshToken] = await Promise.all([
            this.jwt.signAsync(payload, {
                secret: this.config.get('JWT_ACCESS_SECRET'),
                expiresIn: this.config.get('JWT_ACCESS_EXPIRES') ?? '15m',
            }),
            this.jwt.signAsync(payload, {
                secret: this.config.get('JWT_REFRESH_SECRET'),
                expiresIn: this.config.get('JWT_REFRESH_EXPIRES') ?? '7d',
            }),
        ]);
        return { accessToken, refreshToken };
    }

    private async saveRefreshToken(id: number, token: string) {
        const hashed = await bcrypt.hash(token, 12);
        await this.prisma.users.update({
            where: { id: id },
            data: { refreshToken: hashed },
        });
    }
}
