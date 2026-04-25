import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { map, Observable } from 'rxjs';
import { TranslationService } from '../translation.service';

@Injectable()
export class ResponseFormatInterceptor implements NestInterceptor {
  constructor(private readonly translationService: TranslationService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();
    const language = request?.headers['accept-language']?.split('-')[0] || 'en';

    return next.handle().pipe(
      map((data) => {
        const status = response.statusCode || 200;
        const messageKey = data?.property || data?.message || 'SUCCESS';
        const translatedMessage = this.translationService.translate(messageKey, language);

        return {
          success: true,
          responseCode: status,
          message: translatedMessage || messageKey,
          data: this.cleanData(data),
          timestamp: new Date().toISOString(),
        };
      }),
    );
  }

  private cleanData(data: any) {
    if (typeof data !== 'object' || data === null) return data;
    
    const { success, message, property, ...rest } = data;
    
    if (Object.keys(rest).length === 0 && (success !== undefined || message !== undefined || property !== undefined)) {
        return null;
    }
    
    return rest;
  }
}
