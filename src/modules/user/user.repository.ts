import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { User, Prisma } from '@prisma/client';
import { BaseRepository } from '../../common/repositories/base.repository';

@Injectable()
export class UserRepository extends BaseRepository<
  User,
  Prisma.UserWhereInput,
  Prisma.UserSelect,
  Prisma.UserInclude,
  Prisma.UserCreateInput,
  Prisma.UserUpdateInput
> {
  constructor(protected readonly prisma: PrismaService) {
    super(prisma, prisma.user, 'user');
  }

  async findByEmail(email: string, tx?: Prisma.TransactionClient): Promise<User | null> {
    return this.getModel(tx).findUnique({
      where: { email },
    });
  }
}
