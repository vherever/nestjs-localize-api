import { LabelEntity } from '../label.entity';

export class GetLabelResponse {
  constructor(label: LabelEntity) {
    this.uuid = label.uuid;
    this.name = label.name;
    this.color = label.color;
  }

  private uuid: string;
  private name: string;
  private color: string;
}
