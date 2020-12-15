import { LabelEntity } from '../label.entity';

export class GetLabelResponse {
  constructor(label: LabelEntity) {
    return {
      uuid: label.uuid,
      name: label.name,
      color: label.color,
    };
  }
}
