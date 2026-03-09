import { Injectable } from '@nestjs/common';
import { CreateIndustryDto } from './dto/create-industry.dto';
import { UpdateIndustryDto } from './dto/update-industry.dto';
import { Industry } from './entities/industry.entity';

@Injectable()
export class IndustryService {
  private industries: Industry[] = [
    Object.assign(new Industry(), { id: 1, name: 'Technology' }),
    Object.assign(new Industry(), { id: 2, name: 'Healthcare' }),
    Object.assign(new Industry(), { id: 3, name: 'Finance' }),
    Object.assign(new Industry(), { id: 4, name: 'Education' }),
  ];
  private idCounter = 5;

  create(createIndustryDto: CreateIndustryDto) {
    const industry = new Industry();
    industry.id = this.idCounter++;
    industry.name = createIndustryDto.name || 'New Industry';
    this.industries.push(industry);
    return Promise.resolve(industry);
  }

  findAll() {
    return Promise.resolve(this.industries);
  }

  findOne(id: number) {
    const result = this.industries.filter((i) => i.id === id);
    return Promise.resolve(result);
  }

  update(id: number, updateIndustryDto: UpdateIndustryDto) {
    const industry = this.industries.find((i) => i.id === id);
    if (industry) {
      Object.assign(industry, updateIndustryDto);
    }
    return Promise.resolve(industry);
  }

  remove(id: number) {
    const index = this.industries.findIndex((i) => i.id === id);
    if (index > -1) {
      this.industries.splice(index, 1);
    }
    return Promise.resolve({ affected: index > -1 ? 1 : 0 });
  }
}
