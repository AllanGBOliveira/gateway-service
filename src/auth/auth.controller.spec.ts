import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { ClientProxy } from '@nestjs/microservices';
import { JwtAuthGuard } from './jwt-auth.guard';
import { I18nService } from 'nestjs-i18n';
import { of } from 'rxjs';

describe('AuthController', () => {
  let controller: AuthController;
  let authClient: ClientProxy;

  const mockAuthClient = {
    send: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockI18nService = {
    t: jest.fn((key: string) => key),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: 'AUTH_SERVICE',
          useValue: mockAuthClient,
        },
        {
          provide: JwtAuthGuard,
          useValue: mockJwtAuthGuard,
        },
        {
          provide: I18nService,
          useValue: mockI18nService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authClient = module.get<ClientProxy>('AUTH_SERVICE');
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
      
      mockAuthClient.send.mockReturnValue(of(expectedResponse));
      
      const result = await controller.login(loginDto);
      
      expect(mockAuthClient.send).toHaveBeenCalledWith({ cmd: 'login' }, loginDto);
      expect(result).toEqual(expectedResponse);
    });

    it('should call register', async () => {
      const registerDto = { name: 'Test User', email: 'test@test.com', password: 'password' };
      const expectedResponse = { access_token: 'jwt-token' };
      
      mockAuthClient.send.mockReturnValue(of(expectedResponse));
      
      const result = await controller.register(registerDto);
      
      expect(mockAuthClient.send).toHaveBeenCalledWith({ cmd: 'register' }, registerDto);
      expect(result).toEqual(expectedResponse);
    });

    it('should call validateToken', async () => {
      const payload = { token: 'jwt-token' };
      const expectedResponse = { user: { id: '1', email: 'test@test.com' }, valid: true };
      
      mockAuthClient.send.mockReturnValue(of(expectedResponse));
      
      const result = await controller.validateToken(payload);
      
      expect(mockAuthClient.send).toHaveBeenCalledWith({ cmd: 'validate_token' }, payload);
      expect(result).toEqual(expectedResponse);
    });

    it('should call healthCheck', async () => {
      const expectedResponse = { status: 'ok', timestamp: new Date().toISOString() };
      
      mockAuthClient.send.mockReturnValue(of(expectedResponse));
      
      const result = await controller.healthCheck();
      
      expect(mockAuthClient.send).toHaveBeenCalledWith({ cmd: 'health_check' }, {});
      expect(result).toEqual(expectedResponse);
    });
  });

  describe('Protected Routes', () => {
    const mockRequest = {
      headers: { authorization: 'Bearer jwt-token' },
      user: { id: '1', email: 'test@test.com' }
    };

    it('should call findAllUsers', async () => {
      const expectedResponse = { users: [], count: 0 };
      
      mockAuthClient.send.mockReturnValue(of(expectedResponse));
      
      const result = await controller.findAllUsers(mockRequest);
      
      expect(mockAuthClient.send).toHaveBeenCalledWith(
        { cmd: 'find_all_users' },
        {
          token: mockRequest.headers.authorization,
          user: mockRequest.user
        }
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should call getUserProfile', async () => {
      const expectedResponse = { id: '1', email: 'test@test.com', name: 'Test User' };
      
      mockAuthClient.send.mockReturnValue(of(expectedResponse));
      
      const result = await controller.getUserProfile(mockRequest);
      
      expect(mockAuthClient.send).toHaveBeenCalledWith(
        { cmd: 'get_user_profile' },
        {
          token: mockRequest.headers.authorization,
          user: mockRequest.user
        }
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should call findUserById', async () => {
      const userId = 'user-123';
      const expectedResponse = { id: userId, email: 'test@test.com', name: 'Test User' };
      
      mockAuthClient.send.mockReturnValue(of(expectedResponse));
      
      const result = await controller.findUserById(userId, mockRequest);
      
      expect(mockAuthClient.send).toHaveBeenCalledWith(
        { cmd: 'find_user_by_id' },
        {
          id: userId,
          token: mockRequest.headers.authorization,
          user: mockRequest.user
        }
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should call updateUser', async () => {
      const userId = 'user-123';
      const updateUserDto = { name: 'Updated Name' };
      const expectedResponse = { id: userId, name: 'Updated Name', email: 'test@test.com' };
      
      mockAuthClient.send.mockReturnValue(of(expectedResponse));
      
      const result = await controller.updateUser(userId, updateUserDto, mockRequest);
      
      expect(mockAuthClient.send).toHaveBeenCalledWith(
        { cmd: 'update_user' },
        {
          id: userId,
          updateUserDto,
          token: mockRequest.headers.authorization,
          user: mockRequest.user
        }
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should call deleteUser', async () => {
      const userId = 'user-123';
      const expectedResponse = { message: 'User deleted', deletedUser: { id: userId } };
      
      mockAuthClient.send.mockReturnValue(of(expectedResponse));
      
      const result = await controller.deleteUser(userId, mockRequest);
      
      expect(mockAuthClient.send).toHaveBeenCalledWith(
        { cmd: 'delete_user' },
        {
          id: userId,
          token: mockRequest.headers.authorization,
          user: mockRequest.user
        }
      );
      expect(result).toEqual(expectedResponse);
    });
  });
});
