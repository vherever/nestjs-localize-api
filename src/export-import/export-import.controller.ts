import { Controller, Get, Header, Logger, Param, Query, Res, UseGuards, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
// app imports
import { ExportImportService } from './export-import.service';
import { GetUser } from '../auth/get-user.decorator';
import { UserEntity } from '../auth/user.entity';
import { ExportDTO } from './dto/export.dto';

@Controller('projects/:projectUuid/')
@UseGuards(AuthGuard())
export class ExportImportController {
  private logger = new Logger('LabelController');

  constructor(
    private readonly exportImportService: ExportImportService,
  ) {
  }

  @Get('export')
  @Header('Content-type', 'application/json')
  exportTranslations(
    @GetUser() user: UserEntity,
    @Param('projectUuid') projectUuid: string,
    @Query(ValidationPipe) queryDTO: ExportDTO,
    @Res() res,
  ): Promise<Buffer> {
    return this.exportImportService.exportTranslations(user, projectUuid, queryDTO, res);
  }
}
