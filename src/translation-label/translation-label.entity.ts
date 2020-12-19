import { BaseEntity, Column, Entity, ManyToOne, PrimaryColumn } from 'typeorm';
// app imports
import { LabelEntity } from '../label/label.entity';

@Entity('translation-label')
export class TranslationLabelEntity extends BaseEntity {
  @PrimaryColumn({ type: 'uuid' })
  translationUuid: string;

  @Column()
  translationId: number;

  @PrimaryColumn({ type: 'uuid' })
  labelUuid: string;

  @ManyToOne(() => LabelEntity, label => label, { onDelete: 'CASCADE' })
  label: LabelEntity;

  @Column()
  labelId: number;

  @Column()
  projectUuid: string;
}
