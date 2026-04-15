import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import type { StringValue } from 'ms';
import { AuthUserRepository } from '../repository/AuthUserRepository';
import type { IJwtPayload, ITokenResponse } from '../interface';

@Injectable()
export class AuthService {
    private readonly BCRYPT_ROUNDS = 10;

    constructor(
        private readonly authUserRepository: AuthUserRepository,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) {}

    async register(email: string, password: string): Promise<ITokenResponse> {
        const existing = await this.authUserRepository.findByEmail(email);
        if (existing) {
            throw new ConflictException('Email already registered');
        }

        const passwordHash = await bcrypt.hash(password, this.BCRYPT_ROUNDS);
        const user = await this.authUserRepository.createUser(email, passwordHash);

        const tokens = this.issueTokens(user.authUserId, user.email);
        const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, this.BCRYPT_ROUNDS);
        await this.authUserRepository.updateRefreshTokenHash(user.authUserId, refreshTokenHash);

        return tokens;
    }

    async login(email: string, password: string): Promise<ITokenResponse> {
        const user = await this.authUserRepository.findByEmail(email);
        if (!user || !user.isActive) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const passwordMatches = await bcrypt.compare(password, user.passwordHash);
        if (!passwordMatches) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const tokens = this.issueTokens(user.authUserId, user.email);
        const refreshTokenHash = await bcrypt.hash(tokens.refreshToken, this.BCRYPT_ROUNDS);
        await this.authUserRepository.updateRefreshTokenHash(user.authUserId, refreshTokenHash);

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

        const user = await this.authUserRepository.findById(payload.sub);
        if (!user || !user.isActive || !user.refreshTokenHash) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const tokenMatches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
        if (!tokenMatches) {
            throw new UnauthorizedException('Invalid refresh token');
        }

        const accessToken = this.signAccessToken(user.authUserId, user.email);
        return { accessToken };
    }

    private issueTokens(authUserId: number, email: string): ITokenResponse {
        const accessToken = this.signAccessToken(authUserId, email);
        const refreshToken = this.signRefreshToken(authUserId, email);
        return { accessToken, refreshToken };
    }

    private signAccessToken(authUserId: number, email: string): string {
        const payload: IJwtPayload = { sub: authUserId, email };
        const expiresIn = (this.configService.get<string>('JWT_ACCESS_EXPIRES_IN') ?? '15m') as StringValue;
        return this.jwtService.sign(payload, {
            secret: this.configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
            expiresIn,
        });
    }

    private signRefreshToken(authUserId: number, email: string): string {
        const payload: IJwtPayload = { sub: authUserId, email };
        const expiresIn = (this.configService.get<string>('JWT_REFRESH_EXPIRES_IN') ?? '7d') as StringValue;
        return this.jwtService.sign(payload, {
            secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
            expiresIn,
        });
    }
}
