import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  async login() {
    const payload = { sub: 1, username: 'admin' };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
