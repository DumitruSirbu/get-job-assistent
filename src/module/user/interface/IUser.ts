export interface IUser {
    userId: number;
    email: string;
    firstName: string;
    lastName: string;
    passwordHash: string;
    isActive: boolean;
    refreshTokenHash?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
