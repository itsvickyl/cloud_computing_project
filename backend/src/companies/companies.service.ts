import { Injectable } from '@nestjs/common';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Company } from './entities/company.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class CompaniesService {
  private companies: Company[] = [];
  private idCounter = 1;

  create(createCompanyDto: CreateCompanyDto) {
    const company = new Company();
    company.id = this.idCounter++;
    Object.assign(company, createCompanyDto);
    company.createdBy = { id: createCompanyDto.createdBy } as User;
    company.jobs = [];

    this.companies.push(company);
    return Promise.resolve({ identifiers: [{ id: company.id }] });
  }

  findOne(id: number) {
    const company = this.companies.find((c) => c.id === id);
    return Promise.resolve(company || null);
  }

  findWhere(createdBy: number) {
    const company = this.companies.find((c) => c.createdBy.id === createdBy);
    return Promise.resolve(company || null);
  }

  update(id: number, updateCompanyDto: UpdateCompanyDto) {
    const company = this.companies.find((c) => c.id === id);
    if (company) {
      Object.assign(company, updateCompanyDto);
    }
    return Promise.resolve(company);
  }

  remove(id: number) {
    const index = this.companies.findIndex((c) => c.id === id);
    if (index > -1) {
      this.companies.splice(index, 1);
    }
    return Promise.resolve({ affected: index > -1 ? 1 : 0 });
  }
}
