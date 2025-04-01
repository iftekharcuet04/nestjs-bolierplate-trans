import {
  ApolloServerPlugin,
  GraphQLRequestContext,
  GraphQLRequestListener
} from "@apollo/server";
import { formatGraphQLErrorMessageValidation } from "src/error/error-format.filter";
import { TranslationService } from "../translation.service";

interface BaseContext {
  req: { headers: any };
}
const translationService = new TranslationService();
export const CustomErrorHandlingPlugin: ApolloServerPlugin<BaseContext> = {
  /**
   * Modify the errors before sending the response.
   * We need to access the request context here, because the headers are not available in the error formatting filter.
   * @param requestContext The request context.
   * @returns The modified response.
   */
  async requestDidStart(
    requestContext: GraphQLRequestContext<BaseContext>
  ): Promise<GraphQLRequestListener<BaseContext>> {
    return {
      async willSendResponse({ request, response }) {
        // Access the request and response objects
        const originalResponse = response?.body?.singleResult;
        // Modify the errors before sending the response
        if (originalResponse?.errors && originalResponse?.errors?.length > 0) {
          originalResponse.errors = originalResponse?.errors.map((error) => {
            if (error.extensions?.code === "BAD_USER_INPUT") {
              const language =
                requestContext.request.http?.headers
                  .get("accept-language")
                  ?.split("-")[0] || "en";

              const message = formatGraphQLErrorMessageValidation(
                error.message,
                translationService,
                language
              );
              if (message) {
                return {
                  message: message,
                  extensions: {
                    ...error.extensions,
                    code: "VALIDATION_FAILED"
                  }
                };
              }
            }
            return error;
          });
        }
      }
    };
  }
};
