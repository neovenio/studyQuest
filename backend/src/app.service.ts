import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      service: 'studyquest-api',
      status: 'ok',
    };
  }
}
