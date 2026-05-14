"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const node_crypto_1 = require("node:crypto");
const users_service_1 = require("../users/users.service");
let AuthService = class AuthService {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async signUp(body) {
        const email = this.readEmail(body.email);
        const password = this.readPassword(body.password);
        const onboarding = this.readOnboarding(body.onboarding);
        const providedName = this.readOptionalText(body.name, 2);
        const providedUsername = this.readOptionalText(body.username, 3);
        const generatedIdentity = this.buildStarterIdentity(email, providedName, providedUsername);
        const user = await this.usersService.createUser({
            name: generatedIdentity.name,
            username: generatedIdentity.username,
            email,
            passwordHash: this.hashPassword(password),
            onboarding,
        });
        const token = await this.usersService.createSession(user.id);
        return {
            token,
            user: this.usersService.toPublicUser(user),
        };
    }
    async login(body) {
        const email = this.readEmail(body.email);
        const password = this.readPassword(body.password);
        const user = await this.usersService.findByEmail(email);
        if (!user || !this.verifyPassword(password, user.passwordHash)) {
            throw new common_1.UnauthorizedException('Your email or password did not match.');
        }
        const token = await this.usersService.createSession(user.id);
        return {
            token,
            user: this.usersService.toPublicUser(user),
        };
    }
    async logout(header) {
        const token = this.extractToken(header);
        await this.usersService.deleteSession(token);
    }
    buildStarterIdentity(email, preferredName, preferredUsername) {
        const localPart = email.split('@')[0] ?? 'learner';
        const cleaned = localPart
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
        const usernameBase = cleaned || 'learner';
        const nameBase = localPart
            .replace(/[._-]+/g, ' ')
            .trim()
            .replace(/\b\w/g, (character) => character.toUpperCase());
        return {
            name: preferredName ?? nameBase ?? 'New Learner',
            username: preferredUsername ?? usernameBase,
        };
    }
    readRequiredText(value, label, minLength) {
        if (typeof value !== 'string') {
            throw new common_1.BadRequestException(`${label} is required.`);
        }
        const trimmed = value.trim();
        if (trimmed.length < minLength) {
            throw new common_1.BadRequestException(`${label} must be at least ${minLength} characters long.`);
        }
        return trimmed;
    }
    readOptionalText(value, minLength) {
        if (value === undefined || value === null) {
            return undefined;
        }
        if (typeof value !== 'string') {
            throw new common_1.BadRequestException('Optional sign-up fields must be text.');
        }
        const trimmed = value.trim();
        if (!trimmed) {
            return undefined;
        }
        if (trimmed.length < minLength) {
            throw new common_1.BadRequestException(`Optional sign-up fields must be at least ${minLength} characters long if you fill them in.`);
        }
        return trimmed;
    }
    readEmail(value) {
        if (typeof value !== 'string') {
            throw new common_1.BadRequestException('Email is required.');
        }
        const trimmed = value.trim().toLowerCase();
        if (!trimmed.includes('@') || !trimmed.includes('.')) {
            throw new common_1.BadRequestException('Please enter a valid email address.');
        }
        return trimmed;
    }
    readPassword(value) {
        if (typeof value !== 'string') {
            throw new common_1.BadRequestException('Password is required.');
        }
        if (value.length < 8) {
            throw new common_1.BadRequestException('Password must be at least 8 characters long.');
        }
        return value;
    }
    readOnboarding(value) {
        if (value === undefined || value === null) {
            return undefined;
        }
        if (typeof value !== 'object') {
            throw new common_1.BadRequestException('Onboarding data must be an object.');
        }
        const onboarding = value;
        return {
            skipped: Boolean(onboarding.skipped),
            answers: onboarding.answers && typeof onboarding.answers === 'object'
                ? onboarding.answers
                : {},
        };
    }
    hashPassword(password) {
        const salt = (0, node_crypto_1.randomBytes)(16).toString('hex');
        const derivedKey = (0, node_crypto_1.scryptSync)(password, salt, 64).toString('hex');
        return `${salt}:${derivedKey}`;
    }
    verifyPassword(password, storedHash) {
        const [salt, key] = storedHash.split(':');
        if (!salt || !key) {
            return false;
        }
        const derivedKey = (0, node_crypto_1.scryptSync)(password, salt, 64);
        const storedKeyBuffer = Buffer.from(key, 'hex');
        if (storedKeyBuffer.length !== derivedKey.length) {
            return false;
        }
        return (0, node_crypto_1.timingSafeEqual)(storedKeyBuffer, derivedKey);
    }
    extractToken(header) {
        if (!header?.startsWith('Bearer ')) {
            throw new common_1.UnauthorizedException('Missing authorization token.');
        }
        return header.slice(7).trim();
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], AuthService);
//# sourceMappingURL=auth.service.js.map