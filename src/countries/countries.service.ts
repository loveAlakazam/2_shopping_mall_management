import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Countries } from 'src/entities/Countries';
import { UserRank } from 'src/entities/enums/userRank';
import { Users } from 'src/entities/Users';
import { Like, Repository } from 'typeorm';
import { CreateCountriesDto } from './dto/create-countries.dto';

@Injectable()
export class CountriesService {
  constructor(
    @InjectRepository(Countries)
    private readonly countriesRepository: Repository<Countries>,
  ) {}

  /**
   * @url POST '/api/countires'
   * @body createCountriesDto 국적정보 {국적코드, 국적번호, 국적명}
   * @description 새로운 국정정보를 생성합니다
   * @returns 국적정보 생성 결과
   */
  async createCountries(user: Users, createCountriesDto: CreateCountriesDto) {
    // 관리자가 아니라면 403 응답
    if (user.rank !== UserRank.MANAGER) {
      throw new ForbiddenException();
    }

    const { name, countryCode } = createCountriesDto;
    const isMatched = /\+\d+/.test(countryCode);

    // 국적번호 형태(+number)가 잘못된 경우 400 응답
    if (isMatched) {
      throw new BadRequestException('잘못된 국적번호 형식입니다.');
    }

    // 중복된 국적명인 경우 400 응답
    const isDuplicated = await this.countriesRepository.countBy({ name });

    if (isDuplicated) {
      throw new BadRequestException('중복된 국적명입니다.');
    }

    return this.countriesRepository.save(createCountriesDto);
  }

  /**
   * @url GET '/api/countries'
   * @param originalUrl 검색 키워드를 포함한 요청 URL {국적코드, 국적번호, 국적명}
   * @description 국적정보를 검색합니다
   * @returns 국적정보 검색 결과
   */
  async searchCountries(user: Users, originalUrl: string) {
    // 관리자가 아니라면 403 응답
    if (user.rank !== UserRank.MANAGER) {
      throw new ForbiddenException();
    }

    // 들어온 키워드가 국적번호 형식인지 확인
    const isDcode = originalUrl.match(/\+\d+/)?.[0];

    let where;
    if (isDcode) {
      // 국적코드로 검색
      where = { dCode: isDcode };
    } else {
      const queryKeyword = originalUrl.split('=')[1];

      // 국적코드와 국적명으로 검색
      where = [{ name: Like(`%${queryKeyword}$`) }, { countryCode: Like(`%${queryKeyword}%`) }];
    }

    return await this.countriesRepository.find({ where });
  }
}
