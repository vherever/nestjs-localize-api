import { Controller, Get, Param, Res, Logger } from '@nestjs/common';

@Controller()
export class AppController {
  private logger = new Logger('TranslationItemController');

  @Get('/')
  getAll() {
    return 'api works.';
  }

  @Get('/uploads/:imgpath')
  async getImage(
    @Param('imgpath') imgpath: string,
    @Res() res,
  ) {
    res.sendFile(imgpath, { root: 'uploads' }, (error) => {
      if (error) {
        if (error.statusCode === 404) {
          this.logger.error(`No such file or directory: ${error.path}`);
          res.status(404).json({statusCode: 404, message: 'No such file or directory.'});
        } else {
          this.logger.error(`${error.message}`);
          res.status(error.status).json({statusCode: error.status, message: error.message});
        }
      }
    });
  }
}
