import { Body, Controller, Get, Param, ParseBoolPipe, ParseIntPipe, Post, Query, UseGuards } from '@nestjs/common';
import { User } from 'src/auth/auth.decorator';
import { Users } from 'src/entities/Users';
import { OperateGuard } from '../auth/auth.guard';
import { CouponsService } from './coupons.service';
import { CreateCouponDto } from './dto/create-coupon.dto';

@Controller('coupons')
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  /**
   * @url [POST] /api/coupons/
   * @description: 운영자가 새로운 쿠폰을 생성합니다.
   * @Request:
   * @Response:
   * @successCode: 201
   * @errorCode: 400, 401, 500
   */
  @UseGuards(OperateGuard)
  @Post('')
  async createCoupons(@User() user: Users, @Body() createCouponDto: CreateCouponDto) {
    return await this.couponsService.createCoupon(user, createCouponDto);
  }

  /**
   * @url [GET] /api/coupons
   * @query: couponType 쿠폰타입
   * description: 운영자는 생성한 모든 쿠폰들을 조회할 수 있습니다.
   * @Request: (Query) couponType
   * @Response: Coupons[]
   * @successCode: 200
   * @errorCode: 400, 401, 500
   */
  @UseGuards(OperateGuard)
  @Get()
  async getAllCoupons(@User() user: Users, @Query('couponType') couponType?: string) {
    return this.couponsService.getAllCoupons(user, couponType);
  }

  /**
   * @url [GET] /api/coupons/users/:userId/owned-coupons
   * @description 운영자는 유저아이디에 해당하는 회원이 보유한 모든 쿠폰들을 조회할 수 있습니다.
   * @Request
   * * @param required: userId
   * * @query selection: couponType, isUsed
   * @Response OwnedCoupons[]
   * @success 200
   * @errorCode 400, 401, 404
   */
  @UseGuards(OperateGuard)
  @Get('/users/:userId/owned-coupons')
  async getOwnedCoupons(
    @Param('userId', ParseIntPipe) userId: number,
    @User() user: Users,
    @Query('couponType') couponType?: any,
    @Query('isUsed') isUsed?: any,
  ) {
    return this.couponsService.getOwnedCoupons(user, userId, couponType, isUsed);
  }

  /**
   * @url [POST] /api/coupons/owned-coupons
   * @description 사용자 쿠폰 등록 : 등록하면 사용자의 보유쿠폰 목록에 추가됩니다.
   * @Request
   *  @param
   * @Response
   * @success 201
   */

  /**
   * @url [GET] /api/coupons/owned-coupons
   * @description 사용자 보유쿠폰 조회
   */
}
