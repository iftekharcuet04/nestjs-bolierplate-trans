import { Args, Query, Resolver } from "@nestjs/graphql";
import { UserDto, UserResponseType } from "./dto/user.dto";
import { GetUserInput } from "./input/user-input";
import { UserService } from "./user.service";

@Resolver(() => UserDto)
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => UserResponseType, { nullable: true })
  async getUser(@Args("input") input: GetUserInput): Promise<UserDto | null> {
    return this.userService.getUserById(input.id);
  }
}
