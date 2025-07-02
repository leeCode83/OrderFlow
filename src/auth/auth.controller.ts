import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('register')
    async register(@Body() user: { email: string; name: string; password: string }){
        return this.authService.register(user);
    }

    @Post('login')
    async login(@Body() user: { email: string; password: string }) {
        return this.authService.login(user);
    }
}
