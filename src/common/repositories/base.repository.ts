import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';
import { Prisma } from '@prisma/client';

@Injectable()
export abstract class BaseRepository<
  T,
  WhereInput,
  SelectInput,
  IncludeInput,
  CreateInput,
  UpdateInput,
> {
  protected readonly logger: Logger;

  constructor(
    protected readonly prisma: PrismaService,
    protected readonly model: any,
    protected readonly modelName: string,
  ) {
    this.logger = new Logger(`${modelName}Repository`);
  }

  protected getModel(tx?: Prisma.TransactionClient) {
    return tx ? (tx as any)[this.modelName] : this.model;
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    cursor?: WhereInput;
    where?: WhereInput;
    orderBy?: any;
    select?: SelectInput;
    include?: IncludeInput;
    tx?: Prisma.TransactionClient;
  }): Promise<T[]> {
    const { tx, ...rest } = params;
    
    const take = rest.take ? Math.min(rest.take, 1000) : 100;
    
    const startTime = Date.now();
    const result = await this.getModel(tx).findMany({
      ...rest,
      take,
    });
    const duration = Date.now() - startTime;
    this.logger.debug(`findAll completed in ${duration}ms`);
    return result;
  }

  async findUnique(params: {
    where: WhereInput;
    select?: SelectInput;
    include?: IncludeInput;
    tx?: Prisma.TransactionClient;
  }): Promise<T | null> {
    const { tx, ...rest } = params;
    return this.getModel(tx).findUnique(rest);
  }

  async findFirst(params: {
    where: WhereInput;
    select?: SelectInput;
    include?: IncludeInput;
    tx?: Prisma.TransactionClient;
  }): Promise<T | null> {
    const { tx, ...rest } = params;
    return this.getModel(tx).findFirst(rest);
  }

  async create(params: {
    data: CreateInput;
    select?: SelectInput;
    include?: IncludeInput;
    tx?: Prisma.TransactionClient;
  }): Promise<T> {
    const { tx, ...rest } = params;
    return this.getModel(tx).create(rest);
  }

  async update(params: {
    where: WhereInput;
    data: UpdateInput;
    select?: SelectInput;
    include?: IncludeInput;
    tx?: Prisma.TransactionClient;
  }): Promise<T> {
    const { tx, ...rest } = params;
    return this.getModel(tx).update(rest);
  }

  async delete(params: {
    where: WhereInput;
    tx?: Prisma.TransactionClient;
  }): Promise<T> {
    const { tx, where } = params;
    return this.getModel(tx).delete({ where });
  }

  async count(params: {
    where?: WhereInput;
    tx?: Prisma.TransactionClient;
  }): Promise<number> {
    const { tx, where } = params;
    return this.getModel(tx).count({ where });
  }
}
