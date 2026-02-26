import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(email: string, password: string) {
    const exists = await this.userRepo.findOne({ where: { email } });
    if (exists) throw new ConflictException('Email already exists');

    const hash = await bcrypt.hash(password, 12);

    const user = this.userRepo.create({
      email,
      password: hash,
    });

    await this.userRepo.save(user);

    return this.generateTokens(user);
  }

  async login(email: string, password: string) {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException();

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new UnauthorizedException();

    return this.generateTokens(user);
  }

  private async generateTokens(user: User) {
    const payload = { sub: user.id, email: user.email };

    const accessToken = await this.jwtService.signAsync(payload, {
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      expiresIn: '7d',
    });

    const refreshHash = await bcrypt.hash(refreshToken, 12);

    await this.userRepo.update(user.id, {
      refreshTokenHash: refreshHash,
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async refresh(userId: string, refreshToken: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user || !user.refreshTokenHash) throw new UnauthorizedException();

    const valid = await bcrypt.compare(refreshToken, user.refreshTokenHash);

    if (!valid) throw new UnauthorizedException();

    return this.generateTokens(user);
  }

  async logout(userId: string) {
    await this.userRepo.update(userId, {
      refreshTokenHash: null,
    });
  }
}
