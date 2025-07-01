import { BadGatewayException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaClient} from '@prisma/client'
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt'

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaClient, private jwtService: JwtService, private configService: ConfigService){}

    private async generateToken(payload: {id: string; name: string; role: string}){
        try {
            const secretKey = this.configService.get<string>('SECRET_KEY')
            const expiresIn = this.configService.get<string>('SECRET_KEY_EXPIRE')

            return this.jwtService.sign(payload, {
                secret: secretKey,
                expiresIn: expiresIn
            });
        } catch (error) {
            throw error;
        }
    }

    async register(user: {email: string; name: string; password: string}){
        try {
            const existedUser = await this.prisma.user.findUnique({
                where: { email: user.email }
            });

            if (existedUser) {
                throw new BadGatewayException('User already existed. Please login by email');
            }

            const hashedPassword = await bcrypt.hash(user.password, 10);

            const newUser = await this.prisma.user.create({
                data: {
                    email: user.email,
                    name: user.name,
                    password: hashedPassword
                }
            });

            return this.generateToken({ id: newUser.id, name: newUser.name, role: newUser.role });
        } catch (error) {
            throw error;
        }
    }

    async login(user: { email: string; password: string }){
        try {
            const existedUser = await this.prisma.user.findUnique({
                where: { email: user.email }
            });

            if(!existedUser){
                throw new NotFoundException("User not found. Please register your account first");
            }

            const isPasswordValid = await bcrypt.compare(user.password, existedUser.password);

            if(!isPasswordValid){
                throw new UnauthorizedException("Incorect password, please try again");
            }

            return this.generateToken({ id: existedUser.id, name: existedUser.name, role: existedUser.role });
        } catch (error) {
            throw error;
        }
    }

}
