import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class GraphQLGlobalResponseType {
  @Field(() => Boolean, { nullable: true })
  success?: boolean;

  @Field(() => String, { nullable: true })
  message?: string;

  property?: string;
}
