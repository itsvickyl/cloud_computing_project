import { Injectable } from '@nestjs/common';
import { CreateResultDto } from './dto/create-result.dto';
import { UpdateResultDto } from './dto/update-result.dto';
import { Result } from './entities/result.entity';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class ResultsService {
  private results: Result[] = [];
  private idCounter = 1;

  create(createResultDto: CreateResultDto): any {
    const result = new Result();
    result.id = this.idCounter++;
    result.jobId = createResultDto.jobId;
    result.userId = createResultDto.userId;
    result.rank = createResultDto.rank;
    result.score = createResultDto.score;
    result.resumeLink = createResultDto.resumeLink;
    return result;
  }

  bulkInsert(values: any[]) {
    const inserted = values.map((v) => {
      const r = new Result();
      Object.assign(r, v);
      r.id = r.id || this.idCounter++;
      return r;
    });
    this.results.push(...inserted);
    return Promise.resolve({ identifiers: inserted.map((r) => ({ id: r.id })) });
  }

  async check(where: Record<string, any>) {
    const results = this.results.filter((r) => {
      for (const key of Object.keys(where)) {
        if ((r as any)[key] !== where[key]) return false;
      }
      return true;
    });
    return results.length > 0;
  }

  async findResultsWhere(where: Record<string, any>) {
    const filteredResults = this.results.filter((r) => {
      for (const key of Object.keys(where)) {
        if ((r as any)[key] !== where[key]) return false;
      }
      return true;
    });

    return {
      jobId: where.jobId as number,
      ranking: filteredResults.map((r) => ({
        user: r.user || null,
        rank: r.rank,
        score: r.score,
        resumeLink: r.resumeLink,
      })),
    };
  }

  update(id: number, updateResultDto: UpdateResultDto) {
    const result = this.results.find((r) => r.id === id);
    if (result) {
      Object.assign(result, updateResultDto);
    }
    return Promise.resolve(result);
  }
}
