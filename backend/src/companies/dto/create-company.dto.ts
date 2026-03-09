export class CreateCompanyDto {
  name: string;
  desc: string;
  address: string;
  website: string;
  linkedin: string;
  xLink?: string;
  createdBy: number;
  logo: string;
}
