import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { CognitoAuthGuard } from '../auth/cognito.guard';
import { CurrentUser } from '../auth/user.decorator';
import { ReferralsService } from './referrals.service';

class SendInviteDto {
  inviteeEmail!: string;
}

class SubmitContactDto {
  token!: string;
  contactName!: string;
  birthday?: string;
  mailingAddress?: string;
}

@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @UseGuards(CognitoAuthGuard)
  @Get('link')
  getReferralLink(@CurrentUser() user: { sub: string }) {
    return this.referralsService.getReferralLink(user.sub);
  }

  @UseGuards(CognitoAuthGuard)
  @Post('invite')
  sendInvite(@CurrentUser() user: { sub: string }, @Body() dto: SendInviteDto) {
    return this.referralsService.sendInvite(user.sub, dto.inviteeEmail);
  }

  @Get('validate/:token')
  validateToken(@Param('token') token: string) {
    return this.referralsService.validateToken(token);
  }

  @Post('contact')
  submitContact(@Body() dto: SubmitContactDto) {
    return this.referralsService.submitContactAndTrack(
      dto.token,
      dto.contactName,
      dto.birthday,
      dto.mailingAddress,
    );
  }

  @Post('verify/:token')
  verifyReferral(@Param('token') token: string) {
    return this.referralsService.verifyReferral(token);
  }
}
