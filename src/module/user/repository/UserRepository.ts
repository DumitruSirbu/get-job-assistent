import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { BaseRepository } from 'src/common/repository/BaseRepository';
import { User } from '../entity/User';

@Injectable()
export class UserRepository extends BaseRepository<User> {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ) {
        super(userRepository);
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({ where: { email } });
    }

    async findById(userId: number): Promise<User | null> {
        return this.userRepository.findOne({ where: { userId } });
    }

    async updateRefreshTokenHash(userId: number, refreshTokenHash: string | null): Promise<void> {
        await this.userRepository.update({ userId }, { refreshTokenHash });
    }

    async createUser(email: string, firstName: string, lastName: string, passwordHash: string): Promise<User> {
        const entity = this.userRepository.create({ email, firstName, lastName, passwordHash, isActive: true });
        return this.userRepository.save(entity);
    }
}
