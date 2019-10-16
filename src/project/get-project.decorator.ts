import { createParamDecorator } from '@nestjs/common';
import { ProjectEntity } from './project.entity';

export const GetProject = createParamDecorator((data, req): ProjectEntity => {
  return req.project;
});
