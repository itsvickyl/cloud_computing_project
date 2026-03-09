import { PartialType } from '@nestjs/mapped-types';
import { CreateAppliedDto } from './create-applied.dto';

export class UpdateAppliedDto extends PartialType(CreateAppliedDto) {}
