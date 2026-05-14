export interface OnboardingAnswers {
    mainGoal?: string;
    biggestStruggle?: string;
    whatTheyStudy?: string;
    preferredSessionLength?: string;
}
export interface OnboardingState {
    skipped: boolean;
    answers: OnboardingAnswers;
}
export interface UserRecord extends OnboardingAnswers {
    id: string;
    name: string;
    username: string;
    email: string;
    passwordHash: string;
    bio: string;
    profilePicture: string;
    themePreference: 'light' | 'dark' | 'system';
    onboardingCompleted: boolean;
    onboardingSkipped: boolean;
    createdAt: string;
    updatedAt: string;
}
export interface PublicUser extends OnboardingAnswers {
    id: string;
    name: string;
    username: string;
    email: string;
    bio: string;
    profilePicture: string;
    themePreference: 'light' | 'dark' | 'system';
    onboardingCompleted: boolean;
    onboardingSkipped: boolean;
    recommendedQuest: string;
    recommendedQuestReason: string;
}
export interface SessionRecord {
    token: string;
    userId: string;
    createdAt: string;
}
export interface StudyQuestData {
    users: UserRecord[];
    sessions: SessionRecord[];
}
