import { ApiProperty } from "@nestjs/swagger";
import { CustomIsNotEmpty } from "src/common/validators/field-validators";

export class UserRestApiDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  email: string;

  @ApiProperty({ required: false })
  name?: string;
}
