import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert, BeforeUpdate } from 'typeorm';

@Entity({ name: 'auth_user', synchronize: false })
export class AuthUser {
    @PrimaryGeneratedColumn({ name: 'auth_user_id' })
    authUserId: number;

    @Column({ name: 'email', type: 'varchar', unique: true })
    email: string;

    @Column({ name: 'password_hash', type: 'varchar' })
    passwordHash: string;

    @Column({ name: 'is_active', type: 'boolean', default: true })
    isActive: boolean;

    @Column({ name: 'refresh_token_hash', type: 'varchar', nullable: true })
    refreshTokenHash?: string | null;

    @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    updatedAt: Date;

    @BeforeInsert()
    setCreatedAt() {
        this.createdAt = new Date();
    }

    @BeforeUpdate()
    setUpdatedAt() {
        this.updatedAt = new Date();
    }
}
