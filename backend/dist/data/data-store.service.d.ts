import { StudyQuestData } from '../users/user.types';
export declare class DataStoreService {
    private readonly filePath;
    readData(): Promise<StudyQuestData>;
    writeData(data: StudyQuestData): Promise<void>;
    mutate<T>(mutator: (data: StudyQuestData) => T | Promise<T>): Promise<T>;
    private ensureStore;
}
