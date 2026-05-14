import { AuthService } from './auth.service';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    signUp(body: Record<string, unknown>): Promise<import("./auth.service").AuthResult>;
    login(body: Record<string, unknown>): Promise<import("./auth.service").AuthResult>;
    logout(authorization?: string): Promise<void>;
}
