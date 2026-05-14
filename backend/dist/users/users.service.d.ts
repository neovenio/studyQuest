import { DataStoreService } from '../data/data-store.service';
import { OnboardingState, PublicUser, UserRecord } from './user.types';
interface CreateUserInput {
    name: string;
    username: string;
    email: string;
    passwordHash: string;
    onboarding?: OnboardingState;
}
export declare class UsersService {
    private readonly dataStore;
    constructor(dataStore: DataStoreService);
    createUser(input: CreateUserInput): Promise<UserRecord>;
    createSession(userId: string): Promise<string>;
    deleteSession(token: string): Promise<void>;
    findByEmail(email: string): Promise<UserRecord | undefined>;
    getPublicUserFromToken(header?: string): Promise<PublicUser>;
    updateCurrentUser(header: string | undefined, body: Record<string, unknown>): Promise<PublicUser>;
    completeOnboarding(header: string | undefined, body: Record<string, unknown>): Promise<PublicUser>;
    toPublicUser(user: UserRecord): PublicUser;
    private getUserFromHeader;
    private getCurrentUserFromData;
    private extractToken;
    private normalizeOnboarding;
    private optionalChoice;
    private readRequiredText;
    private readOptionalText;
    private readChoice;
    private makeUniqueUsername;
    private readOnboardingAnswers;
}
export {};
