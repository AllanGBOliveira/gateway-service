import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './jwt-auth.guard';
import { I18nService } from 'nestjs-i18n';
import type { CanActivateRequest } from '../../types/auth.d';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    login: jest.fn(),
    register: jest.fn(),
    validateToken: jest.fn(),
    healthCheck: jest.fn(),
    findAllUsers: jest.fn(),
    getUserProfile: jest.fn(),
    findUserById: jest.fn(),
    updateUser: jest.fn(),
    deleteUser: jest.fn(),
  };

  const mockAuthClient = {
    send: jest.fn(),
  };

  const mockI18nService = {
    t: jest.fn((key: string) => key),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        AuthService,
        {
          provide: 'AUTH_SERVICE',
          useValue: mockAuthClient,
        },
        {
          provide: I18nService,
          useValue: mockI18nService,
        },
        {
          provide: JwtAuthGuard,
          useValue: mockJwtAuthGuard,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);

    jest.spyOn(authService, 'login').mockImplementation(mockAuthService.login);
    jest
      .spyOn(authService, 'register')
      .mockImplementation(mockAuthService.register);
    jest
      .spyOn(authService, 'validateToken')
      .mockImplementation(mockAuthService.validateToken);
    jest
      .spyOn(authService, 'healthCheck')
      .mockImplementation(mockAuthService.healthCheck);
    jest
      .spyOn(authService, 'findAllUsers')
      .mockImplementation(mockAuthService.findAllUsers);
    jest
      .spyOn(authService, 'getUserProfile')
      .mockImplementation(mockAuthService.getUserProfile);
    jest
      .spyOn(authService, 'findUserById')
      .mockImplementation(mockAuthService.findUserById);
    jest
      .spyOn(authService, 'updateUser')
      .mockImplementation(mockAuthService.updateUser);
    jest
      .spyOn(authService, 'deleteUser')
      .mockImplementation(mockAuthService.deleteUser);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('Public Routes', () => {
    it('should call login', async () => {
      const loginDto = { email: 'test@test.com', password: 'password' };
      const expectedResponse = { access_token: 'jwt-token' };

      mockAuthService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(result).toEqual(expectedResponse);
    });

    it('should call register', async () => {
      const registerDto = {
        name: 'Test User',
        email: 'test@test.com',
        password: 'password',
      };
      const expectedResponse = { access_token: 'jwt-token' };

      mockAuthService.register.mockResolvedValue(expectedResponse);

      const result = await controller.register(registerDto);

      expect(mockAuthService.register).toHaveBeenCalledWith(registerDto);
      expect(result).toEqual(expectedResponse);
    });

    it('should call validateToken', async () => {
      const payload = { token: 'jwt-token' };
      const expectedResponse = {
        user: { id: '1', email: 'test@test.com' },
        valid: true,
      };

      mockAuthService.validateToken.mockResolvedValue(expectedResponse);

      const result = await controller.validateToken(payload);

      expect(mockAuthService.validateToken).toHaveBeenCalledWith(payload);
      expect(result).toEqual(expectedResponse);
    });

    it('should call healthCheck', async () => {
      const expectedResponse = {
        status: 'ok',
        timestamp: new Date().toISOString(),
      };

      mockAuthService.healthCheck.mockResolvedValue(expectedResponse);

      const result = await controller.healthCheck();

      expect(mockAuthService.healthCheck).toHaveBeenCalled();
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('Protected Routes', () => {
    const mockRequest: CanActivateRequest = {
      headers: { authorization: 'Bearer jwt-token' },
      user: { id: '1', email: 'test@test.com' },
    } as CanActivateRequest;

    it('should call findAllUsers', async () => {
      const expectedResponse = { users: [], count: 0 };

      mockAuthService.findAllUsers.mockResolvedValue(expectedResponse);

      const result = await controller.findAllUsers(mockRequest);

      expect(mockAuthService.findAllUsers).toHaveBeenCalledWith(
        'jwt-token',
        mockRequest.user,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should call getUserProfile', async () => {
      const expectedResponse = {
        id: '1',
        email: 'test@test.com',
        name: 'Test User',
      };

      mockAuthService.getUserProfile.mockResolvedValue(expectedResponse);

      const result = await controller.getUserProfile(mockRequest);

      expect(mockAuthService.getUserProfile).toHaveBeenCalledWith(
        'jwt-token',
        mockRequest.user,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should call findUserById', async () => {
      const userId = 'user-123';
      const expectedResponse = {
        id: userId,
        email: 'test@test.com',
        name: 'Test User',
      };

      mockAuthService.findUserById.mockResolvedValue(expectedResponse);

      const result = await controller.findUserById(userId, mockRequest);

      expect(mockAuthService.findUserById).toHaveBeenCalledWith(
        userId,
        'jwt-token',
        mockRequest.user,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should call updateUser', async () => {
      const userId = 'user-123';
      const updateUserDto = { name: 'Updated Name' };
      const expectedResponse = {
        id: userId,
        name: 'Updated Name',
        email: 'test@test.com',
      };

      mockAuthService.updateUser.mockResolvedValue(expectedResponse);

      const result = await controller.updateUser(
        userId,
        updateUserDto,
        mockRequest,
      );

      expect(mockAuthService.updateUser).toHaveBeenCalledWith(
        userId,
        updateUserDto,
        'jwt-token',
        mockRequest.user,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should call deleteUser', async () => {
      const userId = 'user-123';
      const expectedResponse = {
        message: 'User deleted',
        deletedUser: { id: userId },
      };

      mockAuthService.deleteUser.mockResolvedValue(expectedResponse);

      const result = await controller.deleteUser(userId, mockRequest);

      expect(mockAuthService.deleteUser).toHaveBeenCalledWith(
        userId,
        'jwt-token',
        mockRequest.user,
      );
      expect(result).toEqual(expectedResponse);
    });
  });
});
