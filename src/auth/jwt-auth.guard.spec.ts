import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard } from './jwt-auth.guard';
import { of, throwError } from 'rxjs';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let authClient: ClientProxy;

  const mockAuthClient = {
    send: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtAuthGuard,
        {
          provide: 'AUTH_SERVICE',
          useValue: mockAuthClient,
        },
      ],
    }).compile();

    guard = module.get<JwtAuthGuard>(JwtAuthGuard);
    authClient = module.get<ClientProxy>('AUTH_SERVICE');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const createMockExecutionContext = (headers: any = {}): ExecutionContext => {
    const mockRequest = {
      headers,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;
  };

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('canActivate', () => {
    it('should return true for valid token', async () => {
      const mockContext = createMockExecutionContext({
        authorization: 'Bearer valid-jwt-token',
      });

      const mockValidationResponse = {
        valid: true,
        user: { id: '1', email: 'test@test.com' },
      };

      mockAuthClient.send.mockReturnValue(of(mockValidationResponse));

      const result = guard.canActivate(mockContext);

      if (typeof result === 'object' && 'subscribe' in result) {
        const canActivate = await new Promise((resolve) => {
          result.subscribe({
            next: resolve,
          });
        });
        expect(canActivate).toBe(true);
        expect(mockAuthClient.send).toHaveBeenCalledWith(
          { cmd: 'validate_token' },
          { token: 'valid-jwt-token' }
        );
      }
    });

    it('should throw UnauthorizedException when no token provided', () => {
      const mockContext = createMockExecutionContext({});

      expect(() => guard.canActivate(mockContext)).toThrow(
        new UnauthorizedException('Token not found')
      );
    });

    it('should throw UnauthorizedException when token format is invalid', () => {
      const mockContext = createMockExecutionContext({
        authorization: 'InvalidFormat token',
      });

      expect(() => guard.canActivate(mockContext)).toThrow(
        new UnauthorizedException('Token not found')
      );
    });

    it('should throw UnauthorizedException when token validation fails', async () => {
      const mockContext = createMockExecutionContext({
        authorization: 'Bearer invalid-jwt-token',
      });

      const mockValidationResponse = {
        valid: false,
        user: null,
      };

      mockAuthClient.send.mockReturnValue(of(mockValidationResponse));

      const result = guard.canActivate(mockContext);

      try {
        if (typeof result === 'object' && 'subscribe' in result) {
          await new Promise((resolve, reject) => {
            result.subscribe({
              next: resolve,
              error: reject,
            });
          });
          fail('Expected error but got success');
        }
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('Token validation failed');
      }
    });

    it('should throw UnauthorizedException when auth service returns error', async () => {
      const mockContext = createMockExecutionContext({
        authorization: 'Bearer some-token',
      });

      mockAuthClient.send.mockReturnValue(
        throwError(() => new Error('Auth service error'))
      );

      const result = guard.canActivate(mockContext);

      try {
        if (typeof result === 'object' && 'subscribe' in result) {
          await new Promise((resolve, reject) => {
            result.subscribe({
              next: resolve,
              error: reject,
            });
          });
          fail('Expected error but got success');
        }
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toBe('Token validation failed');
      }
    });

    it('should attach user to request when token is valid', async () => {
      const mockRequest: any = { headers: { authorization: 'Bearer valid-token' } };
      const mockContext = {
        switchToHttp: () => ({
          getRequest: () => mockRequest,
        }),
      } as ExecutionContext;

      const mockUser = { id: '1', email: 'test@test.com', name: 'Test User' };
      const mockValidationResponse = {
        valid: true,
        user: mockUser,
      };

      mockAuthClient.send.mockReturnValue(of(mockValidationResponse));

      const result = guard.canActivate(mockContext);

      if (typeof result === 'object' && 'subscribe' in result) {
        const canActivate = await new Promise((resolve) => {
          result.subscribe({
            next: resolve,
          });
        });
        expect(canActivate).toBe(true);
        expect(mockRequest.user).toEqual(mockUser);
      }
    });
  });

  describe('extractTokenFromHeader', () => {
    it('should extract token from Bearer authorization header', () => {
      const mockRequest = {
        headers: { authorization: 'Bearer jwt-token-here' },
      };

      const token = guard['extractTokenFromHeader'](mockRequest);
      expect(token).toBe('jwt-token-here');
    });

    it('should return undefined for invalid authorization header format', () => {
      const mockRequest = {
        headers: { authorization: 'InvalidFormat jwt-token-here' },
      };

      const token = guard['extractTokenFromHeader'](mockRequest);
      expect(token).toBeUndefined();
    });

    it('should return undefined when no authorization header', () => {
      const mockRequest = { headers: {} };

      const token = guard['extractTokenFromHeader'](mockRequest);
      expect(token).toBeUndefined();
    });
  });
});
