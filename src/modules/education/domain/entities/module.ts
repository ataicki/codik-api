import { Step } from '@modules/education/domain/entities/step';

interface ModuleProps {
  id: number;
  name: string;
  description: string;
  steps: Step[];
}

export class Module {}
