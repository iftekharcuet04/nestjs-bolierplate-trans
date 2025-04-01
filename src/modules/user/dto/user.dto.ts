import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class UserDto {
  @Field(() => Int)
  id: number;

  @Field()
  email: string;

  @Field({ nullable: true })
  name?: string;
}

@ObjectType()
export class UserResponseType extends UserDto {
  @Field(() => Boolean, { nullable: true })
  success?: boolean;

  @Field(() => String, { nullable: true })
  message?: string;

  property?: string;
}
