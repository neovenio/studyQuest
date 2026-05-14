import { Injectable } from '@nestjs/common';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { StudyQuestData } from '../users/user.types';

@Injectable()
export class DataStoreService {
  private readonly filePath = join(process.cwd(), 'data', 'studyquest-db.json');

  async readData(): Promise<StudyQuestData> {
    await this.ensureStore();

    const rawFile = await readFile(this.filePath, 'utf8');
    const parsed = JSON.parse(rawFile) as Partial<StudyQuestData>;

    return {
      users: parsed.users ?? [],
      sessions: parsed.sessions ?? [],
    };
  }

  async writeData(data: StudyQuestData): Promise<void> {
    await this.ensureStore();
    await writeFile(this.filePath, JSON.stringify(data, null, 2));
  }

  async mutate<T>(mutator: (data: StudyQuestData) => T | Promise<T>): Promise<T> {
    const data = await this.readData();
    const result = await mutator(data);
    await this.writeData(data);
    return result;
  }

  private async ensureStore(): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });

    try {
      await readFile(this.filePath, 'utf8');
    } catch {
      const emptyState: StudyQuestData = {
        users: [],
        sessions: [],
      };

      await writeFile(this.filePath, JSON.stringify(emptyState, null, 2));
    }
  }
}
