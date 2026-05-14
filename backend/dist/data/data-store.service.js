"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataStoreService = void 0;
const common_1 = require("@nestjs/common");
const promises_1 = require("node:fs/promises");
const node_path_1 = require("node:path");
let DataStoreService = class DataStoreService {
    filePath = (0, node_path_1.join)(process.cwd(), 'data', 'studyquest-db.json');
    async readData() {
        await this.ensureStore();
        const rawFile = await (0, promises_1.readFile)(this.filePath, 'utf8');
        const parsed = JSON.parse(rawFile);
        return {
            users: parsed.users ?? [],
            sessions: parsed.sessions ?? [],
        };
    }
    async writeData(data) {
        await this.ensureStore();
        await (0, promises_1.writeFile)(this.filePath, JSON.stringify(data, null, 2));
    }
    async mutate(mutator) {
        const data = await this.readData();
        const result = await mutator(data);
        await this.writeData(data);
        return result;
    }
    async ensureStore() {
        await (0, promises_1.mkdir)((0, node_path_1.dirname)(this.filePath), { recursive: true });
        try {
            await (0, promises_1.readFile)(this.filePath, 'utf8');
        }
        catch {
            const emptyState = {
                users: [],
                sessions: [],
            };
            await (0, promises_1.writeFile)(this.filePath, JSON.stringify(emptyState, null, 2));
        }
    }
};
exports.DataStoreService = DataStoreService;
exports.DataStoreService = DataStoreService = __decorate([
    (0, common_1.Injectable)()
], DataStoreService);
//# sourceMappingURL=data-store.service.js.map