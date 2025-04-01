import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from "@nestjs/common";
import { catchError, map, Observable, throwError } from "rxjs";
import { TranslationService } from "../translation.service";

@Injectable()
export class ResponseFormatInterceptor implements NestInterceptor {
  private language;
  constructor(private readonly translationService: TranslationService) {}
  intercept(
    context: ExecutionContext,
    next: CallHandler<any>
  ): Observable<any> {
    // Proceed to the next handler (where the response is already created)
    if (context.getType() === "http") {
      const request = context.switchToHttp().getRequest();
      this.language =
        request?.headers["accept-language"]?.split("-")[0] || "en";
    } else if (context.getType().toString() === "graphql") {
      const gqlContext = context.getArgs()[2];
      const request = gqlContext?.req;
      this.language =
        request?.headers["accept-language"]?.split("-")[0] || "en";
    }
    return next.handle().pipe(
      map((data) => {
        // console.log("ResponseFormatInterceptor", data);
        if (typeof data !== "object" || Array.isArray(data)) {
          return data;
        }
        return {
          ...data,
          success: data?.success || false,
          message:
            this.translationService.translate(
              data?.property || data?.message,
              this.language
            ) ||
            data?.property ||
            data?.message
        };
      }),
      catchError((error) => {
        // console.log("ResponseFormatInterceptor", error);
        // Handle errors (this rethrows the error but allows for logging/formatting)
        return throwError(() => error);
      })
    );
  }
}
