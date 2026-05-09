import { Controller, Get, Post, Delete, Body, Param, UseGuards, Redirect } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CognitoAuthGuard } from '../auth/cognito.guard';
import { CurrentUser } from '../auth/user.decorator';
import { TrustCirclesService } from './trust-circles.service';

class CreateCircleDto {
  name!: string;
}

class InviteMemberDto {
  email!: string;
}

class AcceptInviteDto {
  token!: string;
}

@Controller('trust-circles')
export class TrustCirclesController {
  constructor(
    private readonly trustCirclesService: TrustCirclesService,
    private readonly config: ConfigService,
  ) {}

  @Post()
  @UseGuards(CognitoAuthGuard)
  createCircle(@CurrentUser() user: { sub: string }, @Body() dto: CreateCircleDto) {
    return this.trustCirclesService.createCircle(user.sub, dto.name);
  }

  @Get()
  @UseGuards(CognitoAuthGuard)
  getMyCircles(@CurrentUser() user: { sub: string }) {
    return this.trustCirclesService.getMyCircles(user.sub);
  }

  @Get('accept/:token')
  @Redirect()
  acceptRedirect(@Param('token') token: string) {
    const clientUrl = this.config.get<string>('CLIENT_URL') || 'http://localhost:3000';
    return { url: `${clientUrl}/account?invite=${token}` };
  }

  @Post('accept')
  @UseGuards(CognitoAuthGuard)
  acceptInvite(@CurrentUser() user: { sub: string }, @Body() dto: AcceptInviteDto) {
    return this.trustCirclesService.acceptInvite(user.sub, dto.token);
  }

  @Post(':id/invite')
  @UseGuards(CognitoAuthGuard)
  inviteMember(
    @CurrentUser() user: { sub: string },
    @Param('id') id: string,
    @Body() dto: InviteMemberDto,
  ) {
    return this.trustCirclesService.inviteMember(user.sub, id, dto.email);
  }

  @Get(':id/members')
  @UseGuards(CognitoAuthGuard)
  getCircleMembers(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.trustCirclesService.getCircleMembers(user.sub, id);
  }

  @Delete(':id/members/:memberId')
  @UseGuards(CognitoAuthGuard)
  removeMember(
    @CurrentUser() user: { sub: string },
    @Param('id') id: string,
    @Param('memberId') memberId: string,
  ) {
    return this.trustCirclesService.removeMember(user.sub, id, memberId);
  }

  @Delete(':id')
  @UseGuards(CognitoAuthGuard)
  deleteCircle(@CurrentUser() user: { sub: string }, @Param('id') id: string) {
    return this.trustCirclesService.deleteCircle(user.sub, id);
  }
}
