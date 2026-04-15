import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from './guard/JwtAuthGuard';
import { JwtStrategy } from './strategy/JwtStrategy';

@Module({
    imports: [PassportModule],
    providers: [JwtStrategy, JwtAuthGuard],
    exports: [JwtAuthGuard],
})
export class AuthModule {}
