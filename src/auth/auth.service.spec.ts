import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { BadGatewayException, NotFoundException, UnauthorizedException } from '@nestjs/common';

// Mock dependensi
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
};

const mockJwtService = {
  sign: jest.fn(),
};

// Mock yang lebih baik untuk ConfigService
const mockConfigService = {
  get: jest.fn((key: string) => {
    if (key === 'SECRET_KEY') {
      return 'test-secret';
    }
    if (key === 'SECRET_KEY_EXPIRE') {
      return '1d';
    }
    return null;
  }),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaClient, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('harus terdefinisi', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('harus berhasil mendaftarkan pengguna baru dan mengembalikan token', async () => {
      const user = { email: 'test@example.com', name: 'Test User', password: 'password123' };
      const hashedPassword = 'hashedPassword';
      const newUser = { ...user, id: '1', role: 'STAFF', password: hashedPassword };
      const token = 'jwt-token';

      mockPrisma.user.findUnique.mockResolvedValue(null);
      jest.spyOn(bcrypt, 'hash').mockResolvedValue(hashedPassword as never);
      mockPrisma.user.create.mockResolvedValue(newUser);
      mockJwtService.sign.mockReturnValue(token);

      const result = await service.register(user);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email: user.email } });
      expect(bcrypt.hash).toHaveBeenCalledWith(user.password, 10);
      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: {
          email: user.email,
          name: user.name,
          password: hashedPassword,
        },
      });
      // Sesuaikan ekspektasi dengan mock ConfigService yang baru
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { id: newUser.id, name: newUser.name, role: newUser.role },
        { secret: 'test-secret', expiresIn: '1d' }
      );
      expect(result).toBe(token);
    });

    it('harus mengeluarkan BadGatewayException jika pengguna sudah ada', async () => {
      const user = { email: 'test@example.com', name: 'Test User', password: 'password123' };
      mockPrisma.user.findUnique.mockResolvedValue({ id: '1', ...user, role: 'STAFF' });

      await expect(service.register(user)).rejects.toThrow(BadGatewayException);
    });
  });

  describe('login', () => {
    const user = { email: 'test@example.com', password: 'password123' };
    const hashedPassword = 'hashedPassword';
    const existedUser = { id: '1', name: 'Test User', email: user.email, password: hashedPassword, role: 'STAFF' };
    const token = 'jwt-token';

    it('harus berhasil login dan mengembalikan token', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(existedUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockJwtService.sign.mockReturnValue(token);

      const result = await service.login(user);

      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({ where: { email: user.email } });
      expect(bcrypt.compare).toHaveBeenCalledWith(user.password, existedUser.password);
      // Sesuaikan ekspektasi dengan mock ConfigService yang baru
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        { id: existedUser.id, name: existedUser.name, role: existedUser.role },
        { secret: 'test-secret', expiresIn: '1d' }
      );
      expect(result).toBe(token);
    });

    it('harus mengeluarkan NotFoundException jika pengguna tidak ditemukan', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(user)).rejects.toThrow(NotFoundException);
    });

    it('harus mengeluarkan UnauthorizedException jika kata sandi salah', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(existedUser);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.login(user)).rejects.toThrow(UnauthorizedException);
    });
  });
});