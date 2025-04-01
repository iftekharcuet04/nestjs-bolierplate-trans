import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import {
  CustomIsNotEmpty,
  CustomIsNumber,
  CustomMin
} from "src/common/validators/field-validators";

export class GetRestApiUserInput {
  @ApiProperty()
  @CustomIsNotEmpty({ key_message: "PROVIDE_REQUIRED_FIELDS" })
  @Type(() => Number)
  @CustomIsNumber({
    message: JSON.stringify({
      key: "TYPE_MISMATCH_ERROR",
      fieldName: "id",
      expectedType: "number",
      invalidType: "string"
    })
  })
  @CustomMin(1)
  id: number;
}
