import { Injectable } from "@nestjs/common";
import { GraphQLError } from "graphql";
import { UserResponseType } from "./dto/user.dto";
import { UserRepository } from "./user.repository";

@Injectable()
export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUserById(id: number): Promise<UserResponseType | null> {
    const user = await this.userRepository.findUnique({ where: { id } });

    if (!user) {
      throw new GraphQLError("", {
        extensions: { property: "USER_FETCH_ERROR" }
      });
    }

    return { ...user, success: true, property: "USER_FETCH_SUCCESS" };
  }
}
