import { Review } from '@modules/education/domain/entities/review';
import { Module } from '@modules/education/domain/entities/module';

interface CourseProps {
  id: string;
  name: string;
  description: string;
  reviews: Review[];
  modules: Module[];
}

export class Course {}
