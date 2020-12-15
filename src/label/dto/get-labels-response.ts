import { LabelEntity } from '../label.entity';

export class GetLabelsResponse {
  constructor(labels: LabelEntity[]) {
    return labels.map((label) => {
      return {
        uuid: label.uuid,
        name: label.name,
        color: label.color,
      };
    });
  }
}
