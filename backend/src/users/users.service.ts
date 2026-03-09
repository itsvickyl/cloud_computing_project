import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserType } from './entities/user.enum';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  private users: User[] = [];
  private idCounter = 1;

  create(createUserDto: any) {
    const user = new User();
    user.id = this.idCounter++;
    user.username = createUserDto.username;
    user.email = createUserDto.email;
    user.profilePic = createUserDto.profilePic;
    user.type = (createUserDto.type as UserType) || UserType.USER;
    user.password = createUserDto.password;
    user.appliedJobs = [];
    user.savedJobs = [];
    user.results = [];

    this.users.push(user);
    return Promise.resolve(user);
  }

  findAll() {
    return Promise.resolve(this.users);
  }

  findWhere(where: Record<string, any>, relations: string[]) {
    const results = this.users.filter((u) => {
      for (const key of Object.keys(where)) {
        if ((u as any)[key] !== where[key]) return false;
      }
      return true;
    });
    return Promise.resolve(results);
  }

  findByEmail(email: string) {
    const user = this.users.find((u) => u.email === email);
    return Promise.resolve(user || null);
  }

  findOne(id: number) {
    const user = this.users.find((u) => u.id === id);
    return Promise.resolve(user || null);
  }

  validateUser(email: string) {
    const user = this.users.find((u) => u.email === email);
    return Promise.resolve(user || null);
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    const user = this.users.find((u) => u.id === id);
    if (user) {
      Object.assign(user, updateUserDto);
    }
    return Promise.resolve(user);
  }

  remove(id: number) {
    const index = this.users.findIndex((u) => u.id === id);
    if (index > -1) {
      this.users.splice(index, 1);
    }
    return Promise.resolve({ affected: index > -1 ? 1 : 0 });
  }
}
