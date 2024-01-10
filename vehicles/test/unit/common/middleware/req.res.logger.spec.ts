import { Test } from '@nestjs/testing';
import { Request, Response } from 'express';
import { Logger } from '@nestjs/common';
import { HTTPLoggerMiddleware } from '../../../../src/common/middleware/req.res.logger';

describe('HTTPLoggerMiddleware', () => {
  let middleware: HTTPLoggerMiddleware;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [HTTPLoggerMiddleware, Logger],
    }).compile();

    middleware = module.get<HTTPLoggerMiddleware>(HTTPLoggerMiddleware);
  });
  it('should log the correct information', () => {
    const request: Request = {
      method: 'GET',
      originalUrl: '/test',
      get: () => 'Test User Agent',
    } as unknown as Request;

    const response: Response = {
      statusCode: 200,
      get: () => '100',
      on: (event: string, cb: () => void) => {
        if (event === 'finish') {
          cb();
        }
      },
    } as unknown as Response;

    const loggerSpy = jest.spyOn(middleware['logger'], 'log');

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    middleware.use(request, response, () => {});

    expect(loggerSpy).toHaveBeenNthCalledWith(
      1,
      'Request: GET /test \nHeader: {} \nPayload: undefined',
    );
    expect(loggerSpy).toHaveBeenNthCalledWith(
      2,
      'Response: GET /test StatusCode: 200 ContentLength: 100 ResponseTime: 100ms',
    );
  });
});
