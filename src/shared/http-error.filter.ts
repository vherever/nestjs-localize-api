import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();
    // const status = exception.getStatus();
    const status = (exception instanceof HttpException) ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse = {
      code: status,
      timeStamp: new Date().toLocaleDateString(),
      path: request.url,
      method: request.method,
      message: exception.getResponse() && exception.getResponse()['message'] || exception.message.error || exception.message || null,
    };

    Logger.error(`${request.method} ${request.url}`, JSON.stringify(errorResponse), 'ExceptionFilter');

    response.status(status).json(errorResponse);
  }
}
