import { UsersService } from './users.service';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    getCurrentUser(authorization?: string): Promise<import("./user.types").PublicUser>;
    completeOnboarding(authorization: string | undefined, body: Record<string, unknown>): Promise<import("./user.types").PublicUser>;
    updateCurrentUser(authorization: string | undefined, body: Record<string, unknown>): Promise<import("./user.types").PublicUser>;
}
