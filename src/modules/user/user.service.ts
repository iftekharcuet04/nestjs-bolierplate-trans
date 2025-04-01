import { Injectable } from "@nestjs/common";
import { GraphQLError } from "graphql";
import { PrismaService } from "nestjs-prisma";
import { UserResponseType } from "./dto/user.dto";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getUserById(id: number): Promise<UserResponseType | null> {
    const user = await this.prisma.user.findUnique({
      where: { id } //1
    });

    if (!user) {
      throw new GraphQLError("", {
        extensions: { property: "USER_FETCH_ERROR" }
      });
    }

    return { ...user, success: true, property: "USER_FETCH_SUCCESS" };
  }
}
