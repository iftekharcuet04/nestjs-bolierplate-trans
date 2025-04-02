import { Catch, ExecutionContext } from "@nestjs/common";
import { GqlExceptionFilter } from "@nestjs/graphql";
import { GraphQLError } from "graphql";
import { TranslationService } from "src/common/translation.service";
import { handlePrismaError } from "./prisma-exception.filter";

export function formatGraphQLErrorMessageValidation(
  message: string,
  translationService: TranslationService,
  language: string
): string[] | string | undefined {
  try {
    // Handle missing required fields

    if (message.includes("Field") && message.includes("was not provided")) {
      const fieldMatch = message.match(
        /Field "(.+?)" of required type "(.+?)" was not provided./
      );

      if (fieldMatch) {
        const fieldName = fieldMatch[1];
        const fieldType = fieldMatch[2];
        const modifiedMessage = {
          key: "VALUE_MISSING",
          fieldName: fieldName,
          fieldType: fieldType
        };
        return translationService.translate(
          JSON.stringify(modifiedMessage),
          language
        );
      }
    }

    // Handle invalid values for variables
    if (message.includes("cannot represent a non")) {
      const typeMismatchMatch = message.match(
        /(.*?) cannot represent a non (.+?) value: (.+?)/
      );
      if (typeMismatchMatch) {
        const fieldName = typeMismatchMatch[1];
        const expectedType = typeMismatchMatch[2];
        const providedValue = typeMismatchMatch[3];

        const modifiedMessage = {
          key: "TYPE_MATCHING_ERROR",
          variableName: (fieldName?.split(".")[1] || fieldName)?.replace(
            /[\"\\;$]/g,
            ""
          ),
          providedValue: providedValue,
          expectedType: expectedType
        };
        return translationService.translate(
          JSON.stringify(modifiedMessage),
          language
        );
      }
    }

    if (message.includes("got invalid value")) {
      const variableMatch = message.match(
        /Variable "(.*?)" got invalid value (.+?) at "(.+?)";/
      );
      if (variableMatch) {
        const variableName = variableMatch[1];
        const invalidValue = variableMatch[2];
        const fieldName = variableMatch[3];

        // Check for type mismatch errors
        if (message.includes("String cannot represent a non string value")) {
          const typeMismatchMatch = message.match(
            /String cannot represent a non string value: (.+?)/
          );

          if (typeMismatchMatch) {
            const providedValue = typeMismatchMatch[1];
            const modifiedMessage = {
              key: "TYPE_MATCHING_ERROR",
              variableName:
                fieldName?.split(".")[1] ||
                variableName?.replace(/[\"\\;$]/g, ""),
              providedValue: providedValue,
              expectedType: "string"
            };
            return translationService.translate(
              JSON.stringify(modifiedMessage),
              language
            );
          }
        }

        // Extract specific field issues from the invalid value
        const fieldErrors = [];
        const fieldMatches = invalidValue.match(
          /([a-zA-Z_]+): (\"null\"|null|[^,]+)/g
        );

        if (fieldMatches) {
          fieldMatches.forEach((field) => {
            const fieldParts = field.split(":");
            const fieldName = fieldParts[0].trim();
            const fieldValue = fieldParts[1].trim();

            const modifiedMessage = {
              fieldName: fieldName,
              key: "FIELD_MATCH_INVALID_VALUE",
              fieldValue: fieldValue
            };
            fieldErrors.push(
              translationService.translate(
                JSON.stringify(modifiedMessage),
                language
              )
            );
          });
        }

        const fieldErrorMessages =
          fieldErrors.length > 0 ? fieldErrors.join(" ") : "";
        console.log();
        const modifiedMessage = {
          variableName: fieldName?.split(".")[1] || variableName,
          key: "INVALID_VALUE",
          details:
            fieldErrorMessages ||
            translationService.translate("DEFAULT_INVALID_VALUE", language)
        };
        return translationService.translate(
          JSON.stringify(modifiedMessage),
          language
        );
      }
    }

    // Default fallback if no matching pattern is found
    return message;
  } catch (error) {
    // Return the original message if an error occurs
    console.error("Error formatting GraphQL error message:", error);
    return message;
  }
}

@Catch()
export class GraphqlValidationFilter implements GqlExceptionFilter {
  private language;
  constructor(private readonly translationService: TranslationService) {}
  catch(exception: any, context: ExecutionContext) {
    let errorObject = null;
    let reply = null;
    let request = null;
    if (context.getType() === "http") {
      request = context.switchToHttp().getRequest();
      reply = context.switchToHttp().getResponse();
      this.language =
        request?.headers["accept-language"]?.split("-")[0] || "en";
    } else if (context.getType().toString() === "graphql") {
      const gqlContext = context.getArgs()[2];
      request = gqlContext?.req;
      this.language =
        request?.headers["accept-language"]?.split("-")[0] || "en";
    }

    if (this.checkIfPrismaError(exception?.name)) {
      const prismaFormattedError = handlePrismaError(exception);
      this.throwGraphQLError(prismaFormattedError);
    }

    if (process.env.APP_ENVIRONMENT === "development") {
      console.warn("Error2:", JSON.stringify(exception, null, 2));
    }

    let errorMessage = null;

   
    if (context.getType() === "http") {

      const validationErrors = exception?.response?.message;
      // for rest api validation
      if (validationErrors && Array.isArray(validationErrors)) {
        errorObject = {
          message:
            this.translationService
              .translate(validationErrors, this.language)
              ?.join(",") || "Validation error",
          status_code: 400,
          extensions: {
            code: "Validation error",
            details:
              this.translationService.translate(validationErrors, "en") ||
              "Validation error",
            exception: exception.extensions?.exception || null,
            stacktrace:
              process.env.APP_ENVIRONMENT === "development"
                ? exception.extensions?.stacktrace
                : undefined
          }
        };
      }
      else{
        // if no validation error looking for others
        errorObject = {
          message:
            errorMessage ||
            this.translationService.translate(
              exception?.response?.message || exception?.response,
              this.language
            ) ||
            this.translationService.translate(
              exception?.message,
              this.language
            ) ||
            exception?.message,
          status_code: this.getGraphQlCodeToStatusCode(exception.response?.code),
          extensions: {
            code: exception.error || exception.status || "INTERNAL_SERVER_ERROR",
            exception: exception.response || null,
            details: exception.response?.details || exception?.message,
            stacktrace:
              process.env.APP_ENVIRONMENT === "development"
                ? exception.extensions?.stacktrace
                : undefined
          }
        };
      }
      
    }
     else {
      // Handle other GraphQL errors
      errorObject = {
        message:
          errorMessage || this.formatGraphQLErrorMessage(exception.message),
        status_code: this.getGraphQlCodeToStatusCode(
          exception.extensions?.code
        ),
        extensions: {
          code:
            exception.extensions?.property ||
            exception.extensions?.code ||
            "INTERNAL_SERVER_ERROR",
          exception: exception.extensions?.exception || null,
          details: exception.extensions?.response || exception.message,
          stacktrace:
            process.env.APP_ENVIRONMENT === "development"
              ? exception.extensions?.stacktrace
              : undefined
        }
      };
    }

    if (reply) {
      reply.code(errorObject?.status_code).send({
        responseCode: errorObject?.extensions?.code,
        message: errorObject?.message,
        details: errorObject?.extensions?.details,
        stacktrace: errorObject?.extensions?.stacktrace,
        path: request.url,
        success: false
      });
    }
    this.throwGraphQLError(errorObject);
  }

  private checkIfPrismaError(name: string): boolean {
    const prismaErrors = [
      "PrismaClientKnownRequestError",
      "PrismaClientUnknownRequestError",
      "PrismaClientRustPanicError",
      "PrismaClientInitializationError",
      "PrismaClientValidationError",
      "PrismaClientKnownError"
    ];
    if (prismaErrors.includes(name)) {
      return true;
    }
    return false;
  }
  private getGraphQlCodeToStatusCode = (code: string): number => {
    const codeStatusMap: Record<string, number> = {
      P2002: 409,
      P2003: 404,
      P2025: 404,
      PRISMA_ERROR: 500,
      INTERNAL_SERVER_ERROR: 500,
      UNAUTHORIZED: 401,
      FORBIDDEN: 403,
      NOT_FOUND: 404,
      UNPROCESSABLE_ENTITY: 422,
      TOO_MANY_REQUESTS: 429,
      BAD_REQUEST: 400,
      CONFLICT: 409,
      BAD_USER_INPUT: 400,
      INVALID_CREDENTIALS: 401,
      INVALID_LOGIN_CREDENTIALS: 401,
      LOGIN_FAILED: 401,
      INVALID_PARAMETER: 400,
      MISSING_PARAMETER: 400
    };

    return codeStatusMap[code] || 500;
  };

  private formatGraphQLErrorMessage(
    message: string
  ): string | string[] | undefined {
    try {
      // Handle missing required fields
      if (message.includes("Field") && message.includes("was not provided")) {
        const fieldMatch = message.match(
          /Field "(.+?)" of required type "(.+?)" was not provided./
        );
        if (fieldMatch) {
          const fieldName = fieldMatch[1];
          const fieldType = fieldMatch[2];
          const modifiedMessage = {
            key: "VALUE_MISSING",
            fieldName: fieldName,
            fieldType: fieldType
          };
          return this.translationService.translate(
            JSON.stringify(modifiedMessage),
            this.language
          );
        }
      }

      // Handle invalid values for variables
      if (message.includes("cannot represent a non")) {
        const typeMismatchMatch = message.match(
          /(.*?) cannot represent a non (.+?) value: (.+?)/
        );
        if (typeMismatchMatch) {
          const fieldName = typeMismatchMatch[1];
          const expectedType = typeMismatchMatch[2];
          const providedValue = typeMismatchMatch[3];
          const modifiedMessage = {
            key: "TYPE_MATCHING_ERROR",
            variableName: (fieldName?.split(".")[1] || fieldName)?.replace(
              /[\"\\;$]/g,
              ""
            ),
            providedValue: providedValue,
            expectedType: expectedType
          };
          return this.translationService.translate(
            JSON.stringify(modifiedMessage),
            this.language
          );
        }
      }
      if (message.includes("got invalid value")) {
        const variableMatch = message.match(
          /Variable "(.*?)" got invalid value (.+?) at (.+?);/
        );
        if (variableMatch) {
          const variableName = variableMatch[1];
          const invalidValue = variableMatch[2];
          const fieldName = variableMatch[3];

          // Check for type mismatch errors
          if (message.includes("String cannot represent a non string value")) {
            const typeMismatchMatch = message.match(
              /String cannot represent a non string value: (.+?)/
            );

            if (typeMismatchMatch) {
              const providedValue = typeMismatchMatch[1];
              const modifiedMessage = {
                key: "TYPE_MATCHING_ERROR",
                variableName: (
                  fieldName?.split(".")[1] || variableName
                )?.replace(/[\"\\;$]/g, ""),
                providedValue: providedValue,
                expectedType: "string"
              };
              return this.translationService.translate(
                JSON.stringify(modifiedMessage),
                this.language
              );
              // return `The field "${variableName}" received an invalid value: ${providedValue}. Expected a string, but got a different type.`;
            }
          }

          // Extract specific field issues from the invalid value
          const fieldErrors = [];
          const fieldMatches = invalidValue.match(
            /([a-zA-Z_]+): (\"null\"|null|[^,]+)/g
          );

          if (fieldMatches) {
            fieldMatches.forEach((field) => {
              const fieldParts = field.split(":");
              const fieldName = fieldParts[0].trim();
              const fieldValue = fieldParts[1].trim();
              const modifiedMessage = {
                fieldName: fieldName,
                key: "FIELD_MATCH_INVALID_VALUE",
                fieldValue: fieldValue
              };
              fieldErrors.push(
                this.translationService.translate(
                  JSON.stringify(modifiedMessage),
                  this.language
                )
                // `Field "${fieldName}" has an invalid value (${fieldValue}).`
              );
            });
          }

          const fieldErrorMessages =
            fieldErrors.length > 0 ? fieldErrors.join(" ") : "";

          const modifiedMessage = {
            key: "INVALID_VALUE",
            variable: fieldName?.split(".")[1] || variableName,
            details:
              fieldErrorMessages ||
              this.translationService.translate(
                "DEFAULT_INVALID_VALUE",
                this.language
              )
          };
          return this.translationService.translate(
            JSON.stringify(modifiedMessage),
            this.language
          );

          //return `There was an issue with the variable "${variableName}": ${fieldErrorMessages || "invalid data provided."}`;
        }
      }

      return message;
    } catch (error) {
      return message;
    }
  }

  private throwGraphQLError({ message, extensions }: any): any {
    // console.log("throwGraphQLError", message, extensions);

    throw new GraphQLError(message, {
      path: extensions?.path || null,
      extensions: {
        code:
          extensions?.property || extensions?.code || "INTERNAL_SERVER_ERROR",
        exception: extensions?.exception || null,
        prismaCode: extensions?.prismaCode || null,
        meta: extensions?.meta || null,
        details: extensions?.details || message,
        stacktrace:
          process.env.APP_ENVIRONMENT === "development"
            ? extensions?.stacktrace
            : undefined
      }
    });
  }
}
