import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { UpdatePreferencesDto } from './dto/update-preferences.dto';
import { User, type UserPreferences } from './user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 10);

    const user = this.userRepository.create({
      email: dto.email,
      passwordHash,
      name: dto.name,
    });

    await this.userRepository.save(user);

    const payload = { sub: user.id, email: user.email };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async login(dto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordValid = await bcrypt.compare(dto.password, user.passwordHash);

    if (!passwordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async getProfile(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    };
  }

  async getPreferences(userId: string): Promise<UserPreferences> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    return user.preferences ?? {};
  }

  async updatePreferences(
    userId: string,
    dto: UpdatePreferencesDto,
  ): Promise<UserPreferences> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    // Merge: only override fields that are explicitly provided
    const current = user.preferences ?? {};
    const updated: UserPreferences = { ...current };

    if (dto.preferredTemplateId !== undefined)
      updated.preferredTemplateId = dto.preferredTemplateId || undefined;
    if (dto.preferredTone !== undefined)
      updated.preferredTone = dto.preferredTone || undefined;
    if (dto.preferredSlideCount !== undefined)
      updated.preferredSlideCount = dto.preferredSlideCount;
    if (dto.ctaStyle !== undefined)
      updated.ctaStyle = dto.ctaStyle || undefined;
    if (dto.textDensity !== undefined)
      updated.textDensity = dto.textDensity || undefined;
    if (dto.instagramHandle !== undefined)
      updated.instagramHandle = dto.instagramHandle || undefined;

    user.preferences = updated;
    await this.userRepository.save(user);
    return updated;
  }
}
