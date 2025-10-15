import { ExceptionFilter, Catch, ArgumentsHost } from '@nestjs/common';

@Catch(Error)
export class MongooseValidationFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    if (exception.name === 'ValidationError') {
      // ناخد كل رسائل الأخطاء
      const messages = Object.values(exception.errors).map(
        (err: any) => err.message,
      );

      return response.status(400).json({
        statusCode: 400,
        error: 'Bad Request',
        message: messages,
      });
    }

    // لو مش error من نوع ValidationError نخليه يكمل عادي
    throw exception;
  }
}
