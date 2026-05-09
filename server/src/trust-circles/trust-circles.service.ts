import { Injectable, NotFoundException, ForbiddenException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { TrustCircle } from '../entities/trust-circle.entity';
import { TrustCircleMember } from '../entities/trust-circle-member.entity';
import { User } from '../entities/user.entity';
import { SendGridService } from '../sendgrid/sendgrid.service';

@Injectable()
export class TrustCirclesService {
  private readonly logger = new Logger(TrustCirclesService.name);

  constructor(
    @InjectRepository(TrustCircle)
    private readonly circleRepo: Repository<TrustCircle>,
    @InjectRepository(TrustCircleMember)
    private readonly memberRepo: Repository<TrustCircleMember>,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly sendGrid: SendGridService,
    private readonly config: ConfigService,
  ) {}

  async createCircle(ownerUserId: string, name: string): Promise<TrustCircle> {
    const circle = this.circleRepo.create({ ownerUserId, name });
    return this.circleRepo.save(circle);
  }

  async getMyCircles(userId: string): Promise<TrustCircle[]> {
    return this.circleRepo.find({ where: { ownerUserId: userId } });
  }

  async inviteMember(ownerUserId: string, circleId: string, email: string): Promise<TrustCircleMember> {
    const circle = await this.circleRepo.findOne({ where: { id: circleId } });
    if (!circle) throw new NotFoundException('Circle not found');
    if (circle.ownerUserId !== ownerUserId) throw new ForbiddenException('Not the circle owner');

    const owner = await this.userRepo.findOne({ where: { id: ownerUserId } });
    if (!owner) throw new NotFoundException('Owner not found');

    const token = Buffer.from(`${circleId}|${email}`).toString('base64url');
    const clientUrl = this.config.get<string>('CLIENT_URL') || 'http://localhost:3000';
    const acceptLink = `${clientUrl}/account?invite=${token}`;

    const member = this.memberRepo.create({ circleId, invitedEmail: email, status: 'pending' });
    await this.memberRepo.save(member);

    const ownerName = owner.displayName || owner.email.split('@')[0];
    const subject = `${ownerName} has invited you to their ${circle.name} circle on Souvenote`;

    try {
      await this.sendGrid.send(email, subject, this.buildInviteEmail(ownerName, circle.name, acceptLink));
    } catch (err) {
      this.logger.error(`Failed to send circle invite to ${email}: ${err}`);
    }

    return member;
  }

  async acceptInvite(userId: string, token: string): Promise<void> {
    let circleId: string;
    let email: string;
    try {
      const decoded = Buffer.from(token, 'base64url').toString('utf8');
      const parts = decoded.split('|');
      circleId = parts[0];
      email = parts[1];
    } catch {
      throw new NotFoundException('Invalid invite token');
    }

    const member = await this.memberRepo.findOne({ where: { circleId, invitedEmail: email } });
    if (!member) throw new NotFoundException('Invite not found');

    member.userId = userId;
    member.status = 'active';
    await this.memberRepo.save(member);
  }

  async getCircleMembers(userId: string, circleId: string): Promise<TrustCircleMember[]> {
    const circle = await this.circleRepo.findOne({ where: { id: circleId } });
    if (!circle) throw new NotFoundException('Circle not found');

    const isMember = await this.memberRepo.findOne({ where: { circleId, userId } });
    if (circle.ownerUserId !== userId && !isMember) {
      throw new ForbiddenException('Not a member of this circle');
    }

    return this.memberRepo.find({ where: { circleId } });
  }

  async deleteCircle(ownerUserId: string, circleId: string): Promise<void> {
    const circle = await this.circleRepo.findOne({ where: { id: circleId } });
    if (!circle) throw new NotFoundException('Circle not found');
    if (circle.ownerUserId !== ownerUserId) throw new ForbiddenException('Not the circle owner');
    await this.circleRepo.remove(circle);
  }

  async removeMember(ownerUserId: string, circleId: string, memberId: string): Promise<void> {
    const circle = await this.circleRepo.findOne({ where: { id: circleId } });
    if (!circle) throw new NotFoundException('Circle not found');
    if (circle.ownerUserId !== ownerUserId) throw new ForbiddenException('Not the circle owner');

    const member = await this.memberRepo.findOne({ where: { id: memberId, circleId } });
    if (!member) throw new NotFoundException('Member not found');
    await this.memberRepo.remove(member);
  }

  private buildInviteEmail(ownerName: string, circleName: string, acceptLink: string): string {
    return `
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background: #fafafa; margin: 0; padding: 0;">
  <div style="max-width: 560px; margin: 40px auto; background: #fff; border-radius: 16px; padding: 40px; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">
    <h1 style="font-size: 24px; color: #111; margin-bottom: 8px;">Circle Invitation</h1>
    <p style="color: #555; font-size: 16px; line-height: 1.6;">
      <strong>${ownerName}</strong> has invited you to their <strong>${circleName}</strong> circle on <strong>Souvenote</strong>.
    </p>
    <p style="color: #555; font-size: 16px; line-height: 1.6;">
      Join their circle to stay coordinated on special occasions and never miss a chance to send a thoughtful card.
    </p>
    <a href="${acceptLink}"
       style="display: inline-block; margin-top: 24px; padding: 14px 32px; background: #ec4899; color: #fff; text-decoration: none; border-radius: 10px; font-weight: bold; font-size: 16px;">
      Accept Invitation
    </a>
    <p style="margin-top: 32px; font-size: 13px; color: #999;">
      Or copy this link: <a href="${acceptLink}" style="color: #ec4899;">${acceptLink}</a>
    </p>
  </div>
</body>
</html>`;
  }
}
