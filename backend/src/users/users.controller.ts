import { Body, Controller, Get, Headers, Patch, Post } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  getCurrentUser(@Headers('authorization') authorization?: string) {
    return this.usersService.getPublicUserFromToken(authorization);
  }

  @Post('me/onboarding')
  completeOnboarding(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    return this.usersService.completeOnboarding(authorization, body);
  }

  @Patch('me')
  updateCurrentUser(
    @Headers('authorization') authorization: string | undefined,
    @Body() body: Record<string, unknown>,
  ) {
    return this.usersService.updateCurrentUser(authorization, body);
  }
}
