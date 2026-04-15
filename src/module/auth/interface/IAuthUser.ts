export interface IAuthUser {
    authUserId: number;
    email: string;
    passwordHash: string;
    isActive: boolean;
    refreshTokenHash?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
