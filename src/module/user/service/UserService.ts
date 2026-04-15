import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import type { StringValue } from 'ms';
import { UserRepository } from '../repository/UserRepository';
import type { IJwtPayload, ITokenResponse } from '../../auth/interface';

@Injectable()
export class UserService {
    private readonly BCRYPT_ROUNDS = 10;

    constructor(
        private readonly userRepository: UserRepository,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    async register(email: string, firstName: string, lastName: string, password: string): Promise<ITokenResponse> {
        const existing = await this.userRepository.findByEmail(email);
        if (existing) {
            throw new ConflictException('Email already registered');
        }

        const passwordHash = await bcrypt.hash(password, this.BCRYPT_ROUNDS);
        const user = await this.userRepository.createUser(email, firstName, lastName, passwordHash);

        const tokens = this.issueTokens(user.userId, user.email);
        const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, this.BCRYPT_ROUNDS);
        await this.userRepository.updateRefreshTokenHash(user.userId, refreshTokenHash);

        return tokens;
    }

    async login(email: string, password: string): Promise<ITokenResponse> {
        const user = await this.userRepository.findByEmail(email);
        if (!user || !user.isActive) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const passwordMatches = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatches) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const tokens = this.issueTokens(user.userId, user.email);
        const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, this.BCRYPT_ROUNDS);
        await this.userRepository.updateRefreshTokenHash(user.userId, refreshTokenHash);

        return tokens;
    }

    async refresh(refreshToken: string): Promise<{ accessToken: string }> {
        let payload: IJwtPayload;

        try {
            const secret = this.configService.getOrThrow<string>('JWT_REFRESH_SECRET');
            payload = this.jwtService.verify<IJwtPayload>(refreshToken, {
                secret,
            });
        } catch {
            throw new UnauthorizedException('Invalid or expired refresh token');
        }

        const user = await this.userRepository.findById(payload.sub);
        if (!user || !user.isActive || !user.refreshTokenHash) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const tokenMatches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
        if (!tokenMatches) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const accessToken = this.signAccessToken(user.userId, user.email);
        return { accessToken };
    }

    private issueTokens(userId: number, email: string): ITokenResponse {
        const accessToken = this.signAccessToken(userId, email);
        const refreshToken = this.signRefreshToken(userId, email);
        return { accessToken, refreshToken };
    }

    private signAccessToken(userId: number, email: string): string {
        const payload: IJwtPayload = { sub: userId, email };
        const expiresIn = (this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m') as StringValue;
        return this.jwtService.sign(payload, {
            secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
            expiresIn,
        });
    }

    private signRefreshToken(userId: number, email: string): string {
        const payload: IJwtPayload = { sub: userId, email };
        const expiresIn = (this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d') as StringValue;
        return this.jwtService.sign(payload, {
            secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
            expiresIn,
        });
    }
}
