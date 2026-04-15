import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/module/job/repository/BaseRepository';
import { AuthUser } from '../entity/AuthUser';

@Injectable()
export class AuthUserRepository extends BaseRepository<AuthUser> {
    constructor(
        @InjectRepository(AuthUser)
        private readonly authUserRepository: Repository<AuthUser>,
    ) {
        super(authUserRepository);
    }

    async findByEmail(email: string): Promise<AuthUser | null> {
        return this.authUserRepository.findOne({ where: { email } });
    }

    async findById(authUserId: number): Promise<AuthUser | null> {
        return this.authUserRepository.findOne({ where: { authUserId } });
    }

    async updateRefreshTokenHash(authUserId: number, refreshTokenHash: string | null): Promise<void> {
        await this.authUserRepository.update({ authUserId }, { refreshTokenHash });
    }

    async createUser(email: string, passwordHash: string): Promise<AuthUser> {
        const entity = this.authUserRepository.create({ email, passwordHash, isActive: true });
        return this.authUserRepository.save(entity);
    }
}
