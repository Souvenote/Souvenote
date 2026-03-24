import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { randomUUID } from 'crypto';
import { Repository } from 'typeorm';
import { CreditTransaction, CreditType, TransactionType } from '../entities/credit-transaction.entity';
import { Order } from '../entities/order.entity';
import { User } from '../entities/user.entity';
import { CreatePurchaseSessionDto } from './dto/create-purchase-session.dto';
import { findPurchasePack } from './purchase-packs';

@Injectable()
export class PurchasesService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(CreditTransaction)
    private readonly creditTransactionRepository: Repository<CreditTransaction>,
  ) {}

  async createSession(userId: string, dto: CreatePurchaseSessionDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const pack = findPurchasePack(dto.packType, dto.packId);

    if (!pack) {
      throw new NotFoundException('Pack not found');
    }

    const order = this.orderRepository.create({
      userId,
      orderNumber: this.buildOrderNumber(),
      stripePaymentIntentId: `mock_${randomUUID()}`,
      totalAmount: pack.priceCad,
      currency: 'CAD',
      paymentStatus: 'paid_mock',
      orderItemsSnapshot: {
        packId: pack.id,
        packType: pack.packType,
        label: pack.label,
        priceCad: pack.priceCad,
        imageCredits: pack.imageCredits,
        songCredits: pack.songCredits,
        mailedCards: pack.mailedCards || 0,
      },
    });

    const savedOrder = await this.orderRepository.save(order);
    const balances = await this.fulfillOrder(savedOrder.id, userId);

    return {
      orderId: savedOrder.id,
      sessionId: savedOrder.stripePaymentIntentId,
      paymentStatus: savedOrder.paymentStatus,
      message:
        'Stripe is not connected yet, so this purchase is fulfilled immediately in mock mode for product testing.',
      grantedCredits: {
        image: pack.imageCredits,
        song: pack.songCredits,
      },
      mailedCards: pack.mailedCards || 0,
      currentBalances: balances,
    };
  }

  async fulfillOrder(orderId: string, userId?: string) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
    });

    if (!order) {
      throw new NotFoundException('Order not found');
    }

    if (userId && order.userId !== userId) {
      throw new NotFoundException('Order not found');
    }

    const user = await this.userRepository.findOne({ where: { id: order.userId } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const snapshot = order.orderItemsSnapshot || {};

    if (snapshot.fulfilledAt) {
      return {
        image: user.imageCreditBalance,
        song: user.songCreditBalance,
        mailedCards: user.mailedCardBalance,
      };
    }

    const imageCredits = Number(snapshot.imageCredits || 0);
    const songCredits = Number(snapshot.songCredits || 0);
    const mailedCards = Number(snapshot.mailedCards || 0);

    if (imageCredits > 0) {
      const imageBefore = user.imageCreditBalance;
      user.imageCreditBalance += imageCredits;

      await this.creditTransactionRepository.save(
        this.creditTransactionRepository.create({
          userId: user.id,
          type: TransactionType.PURCHASE,
          creditType: CreditType.IMAGE,
          amount: imageCredits,
          balanceBefore: imageBefore,
          balanceAfter: user.imageCreditBalance,
          referenceId: order.id,
          description: `Purchase fulfilled: ${snapshot.label}`,
        }),
      );
    }

    if (songCredits > 0) {
      const songBefore = user.songCreditBalance;
      user.songCreditBalance += songCredits;

      await this.creditTransactionRepository.save(
        this.creditTransactionRepository.create({
          userId: user.id,
          type: TransactionType.PURCHASE,
          creditType: CreditType.SONG,
          amount: songCredits,
          balanceBefore: songBefore,
          balanceAfter: user.songCreditBalance,
          referenceId: order.id,
          description: `Purchase fulfilled: ${snapshot.label}`,
        }),
      );
    }

    if (mailedCards > 0) {
      user.mailedCardBalance += mailedCards;
    }

    await this.userRepository.save(user);

    order.orderItemsSnapshot = {
      ...snapshot,
      fulfilledAt: new Date().toISOString(),
    };
    await this.orderRepository.save(order);

    return {
      image: user.imageCreditBalance,
      song: user.songCreditBalance,
      mailedCards: user.mailedCardBalance,
    };
  }

  private buildOrderNumber(): string {
    const timestamp = Date.now().toString().slice(-8);
    const suffix = randomUUID().slice(0, 6).toUpperCase();
    return `SN-${timestamp}-${suffix}`;
  }
}
