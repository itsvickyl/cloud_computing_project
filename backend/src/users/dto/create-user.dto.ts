export class CreateUserDto {
  username: string;
  email: string;
  type: string;
  profilePic: string;
  password?: string;
}
