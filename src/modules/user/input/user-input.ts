import { Field, InputType, Int } from "@nestjs/graphql";
import {
  CustomIsNotEmpty,
  CustomIsNumber
} from "src/common/validators/field-validators";

@InputType()
export class GetUserInput {
  @Field(() => Int)
  @CustomIsNotEmpty({ key_message: "PROVIDE_REQUIRED_FIELDS" })
  @CustomIsNumber()
  id: number;
}
