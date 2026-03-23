import { Controller, Get, Post, Body, Param, Patch, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../entities/user.entity';
import { CognitoAuthGuard } from '../auth/cognito.guard';
import { CurrentUser } from '../auth/user.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() userData: Partial<User>) {
    return await this.usersService.create(userData);
  }

  @UseGuards(CognitoAuthGuard)
  @Get('me')
  async getMe(@CurrentUser() user: any) {
    return await this.usersService.ensureUser(user.sub, user.email);
  }

  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return await this.usersService.findOne(id);
  }

  @UseGuards(CognitoAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateData: Partial<User>) {
    return await this.usersService.update(id, updateData);
  }
}

