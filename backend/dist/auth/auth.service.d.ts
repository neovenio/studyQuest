import { UsersService } from '../users/users.service';
import { PublicUser } from '../users/user.types';
export interface AuthResult {
    token: string;
    user: PublicUser;
}
export declare class AuthService {
    private readonly usersService;
    constructor(usersService: UsersService);
    signUp(body: Record<string, unknown>): Promise<AuthResult>;
    login(body: Record<string, unknown>): Promise<AuthResult>;
    logout(header?: string): Promise<void>;
    private buildStarterIdentity;
    private readRequiredText;
    private readOptionalText;
    private readEmail;
    private readPassword;
    private readOnboarding;
    private hashPassword;
    private verifyPassword;
    private extractToken;
}
