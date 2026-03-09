import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/users/entities/user.entity';
import { UsersService } from 'src/users/users.service';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new NotFoundException();
    }
    const match = await bcrypt.compare(pass, user.password);
    if (!match) {
      throw new UnauthorizedException();
    }
    return user;
  }

  async signUp(registerDto: Record<string, string>) {
    try {
      const hashedPassword = await bcrypt.hash(registerDto.password, 10);
      const user = await this.userService.create({
        ...registerDto,
        password: hashedPassword,
        profilePic: `https://api.dicebear.com/9.x/initials/svg?seed=${registerDto.username}`,
      } as CreateUserDto);
      return user;
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw new ConflictException('Email already exists.');
      }
      throw new InternalServerErrorException();
    }
  }

  async validateUser(
    user: Partial<User>,
  ): Promise<Partial<{ user: User; isNew: boolean }>> {
    let isNew = false;
    let userData = await this.userService.validateUser(user.email!);
    if (!userData) {
      isNew = true;
      userData = await this.userService.create(user as User);
    }

    return {
      user: userData,
      isNew,
    };
  }

  async generateToken(user: User): Promise<string | null> {
    const payload = {
      sub: user.id,
      email: user.email,
      username: user.username,
    };
    const token = await this.jwtService.signAsync(payload);
    return token;
  }
}
