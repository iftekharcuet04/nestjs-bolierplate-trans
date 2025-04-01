import { Inject, Injectable } from "@nestjs/common";
import { RedisPrefixEnum } from "./enum/redis-prefix-enum";
import { RedisRepository } from "./redis.repository";

export const oneDayInSeconds = 60 * 60 * 24;
export const tenMinutesInSeconds = 60 * 10;
export const halfHourInSeconds = 60 * 30;
export const minutesInSeconds = 60;
export const fiveminutesInSeconds = 60 * 5;

@Injectable()
export class RedisService {
  constructor(
    @Inject(RedisRepository) private readonly redisRepository: RedisRepository
  ) {}

  /**
   * Common for all
   */

  async get(prefix: string, key: string): Promise<any> {
    const data = await this.redisRepository.get(key, prefix);
    return data ? JSON.parse(data) : null;
  }

  async set(prefix: string, key: string, value: object | any[]): Promise<void> {
    await this.redisRepository.set(prefix, key, JSON.stringify(value));
  }

  async delete(prefix: string, key: string): Promise<void> {
    await this.redisRepository.delete(prefix, key);
  }

  async setWithExpiry(
    prefix: string,
    key: string,
    value: object | any[],
    expiry: number = tenMinutesInSeconds
  ): Promise<void> {
    await this.redisRepository.setWithExpiry(
      prefix,
      key,
      JSON.stringify(value),
      expiry
    );
  }

  /**
   * User request Info
   */
  async saveUserDataByToken(token, userData) {
    await this.redisRepository.setWithExpiry(
      RedisPrefixEnum.REQUEST_USER_DATA,
      token,
      JSON.stringify(userData),
      fiveminutesInSeconds
    );
  }
  /**
   * User request Info
   */
  async deleteUserDataByToken(token): Promise<any> {
    await this.redisRepository.delete(RedisPrefixEnum.REQUEST_USER_DATA, token);
  }
  /**
   * User request Info
   */
  async getUserDataByToken(token): Promise<any> {
    const userData = await this.redisRepository.get(
      RedisPrefixEnum.REQUEST_USER_DATA,
      token
    );
    return userData ? JSON.parse(userData) : null;
  }
  /**
   * Agency Data
   */
  async saveAgencyInfo(url: string, agency) {
    await this.redisRepository.setWithExpiry(
      RedisPrefixEnum.AGENCY,
      url,
      JSON.stringify(agency),
      halfHourInSeconds
    );
  }
  /**
   * Agency Data
   */
  async deleteAgencyInfo(url): Promise<any> {
    await this.redisRepository.delete(RedisPrefixEnum.AGENCY, url);
  }
  /**
   * Agency Data
   */
  async getAgencyInfo(url: string) {
    const agency = await this.redisRepository.get(RedisPrefixEnum.AGENCY, url);
    return agency ? JSON.parse(agency) : null;
  }
  /**
   * loyalty Data
   */
  async saveloyaltyDetails(url: string, agency) {
    await this.redisRepository.setWithExpiry(
      RedisPrefixEnum.LOYALTY_DETAILS,
      url,
      JSON.stringify(agency),
      tenMinutesInSeconds
    );
  }
  /**
   * loyalty Data
   */
  async getloyaltyDetails(url: string) {
    const loyalty = await this.redisRepository.get(
      RedisPrefixEnum.LOYALTY_DETAILS,
      url
    );
    return loyalty ? JSON.parse(loyalty) : null;
  }
  /**
   * loyalty Data
   */
  async deleteloyaltyDetails(url: string) {
    await this.redisRepository.delete(RedisPrefixEnum.LOYALTY_DETAILS, url);
  }
  /**
   * loyalty Votes
   */
  async saveloyaltyVotes(votes_key: string, votes_data: object) {
    await this.redisRepository.setWithExpiry(
      RedisPrefixEnum.LOYALTY_VOTES,
      votes_key,
      JSON.stringify(votes_data),
      tenMinutesInSeconds
    );
  }

  /**
   * loyalty Votes
   */
  async getLoyaltyVotes(votes_key: string) {
    const loyalty = await this.redisRepository.get(
      RedisPrefixEnum.LOYALTY_VOTES,
      votes_key
    );
    return loyalty ? JSON.parse(loyalty) : null;
  }
  /**
   * loyalty Votes
   */
  async deleteLoyaltyVotes(votes_key: string) {
    await this.redisRepository.delete(RedisPrefixEnum.LOYALTY_VOTES, votes_key);
  }

  /**
   * Votable content
   */
  async saveVotableContent(votes_key: string, votes_data: object) {
    await this.redisRepository.setWithExpiry(
      RedisPrefixEnum.VOTABLE_CONTENT,
      votes_key,
      JSON.stringify(votes_data),
      tenMinutesInSeconds
    );
  }

  /**
   *  Votable content
   */
  async getVotableContent(votes_key: string) {
    const loyalty = await this.redisRepository.get(
      RedisPrefixEnum.VOTABLE_CONTENT,
      votes_key
    );
    return loyalty ? JSON.parse(loyalty) : null;
  }

  /**
   *  Votable content
   */
  async deleteVotableContent(votes_key: string) {
    await this.redisRepository.delete(
      RedisPrefixEnum.VOTABLE_CONTENT,
      votes_key
    );
  }
}
