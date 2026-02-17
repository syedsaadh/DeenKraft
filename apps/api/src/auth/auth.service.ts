import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  async login() {
    const payload = { username: 'admin' };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
