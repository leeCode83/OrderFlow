import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

// Membuat mock untuk AuthService
const mockAuthService = {
  register: jest.fn(),
  login: jest.fn(),
};

describe('AuthController', () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('harus memanggil authService.register dengan data pengguna yang benar', async () => {
      const user = { email: 'test@example.com', name: 'Test User', password: 'password123' };
      const token = 'some-jwt-token';

      // Mengatur mock untuk mengembalikan token ketika register dipanggil
      mockAuthService.register.mockResolvedValue(token);

      const result = await controller.register(user);

      // Memastikan service.register dipanggil dengan data yang benar
      expect(service.register).toHaveBeenCalledWith(user);

      // Memastikan controller mengembalikan hasil dari service
      expect(result).toBe(token);
    });
  });

  describe('login', () => {
    it('harus memanggil authService.login dengan kredensial yang benar', async () => {
      const user = { email: 'test@example.com', password: 'password123' };
      const token = 'some-jwt-token';

      // Mengatur mock untuk mengembalikan token ketika login dipanggil
      mockAuthService.login.mockResolvedValue(token);

      const result = await controller.login(user);

      // Memastikan service.login dipanggil dengan data yang benar
      expect(service.login).toHaveBeenCalledWith(user);

      // Memastikan controller mengembalikan hasil dari service
      expect(result).toBe(token);
    });
  });
});