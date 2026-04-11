import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { SendInviteDto } from './dto/send-invite.dto';
import { CollectInviteeInfoDto } from './dto/collect-invitee-info.dto';
import { CognitoAuthGuard } from '../auth/cognito.guard';
import { CurrentUser } from '../auth/user.decorator';

@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get('link')
  @UseGuards(CognitoAuthGuard)
  getReferralLink(@CurrentUser('sub') userId: string) {
    return this.referralsService.getReferralLink(userId);
  }

  @Post('invite')
  @UseGuards(CognitoAuthGuard)
  sendInvite(
    @CurrentUser('sub') userId: string,
    @Body() dto: SendInviteDto,
  ) {
    return this.referralsService.sendReferralInvite(userId, dto);
  }

  @Get('stats')
  @UseGuards(CognitoAuthGuard)
  getStats(@CurrentUser('sub') userId: string) {
    return this.referralsService.getReferralStats(userId);
  }

  @Post('verify/:token')
  @UseGuards(CognitoAuthGuard)
  verifyAndReward(@Param('token') token: string) {
    return this.referralsService.verifyReferralAndReward(token);
  }

  @Get('verify-token/:token')
  verifyToken(@Param('token') token: string) {
    return this.referralsService.verifyToken(token);
  }

  @Post('collect-invitee-info')
  collectInfo(@Body() dto: CollectInviteeInfoDto) {
    return this.referralsService.collectInviteeInfo(dto);
  }
}
