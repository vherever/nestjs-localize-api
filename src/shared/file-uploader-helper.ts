import * as path from 'path';
import { InternalServerErrorException } from '@nestjs/common';

const imageMin = require('imagemin');
const imageMinMozJpeg = require('imagemin-mozjpeg');
const imageMinPngQuant = require('imagemin-pngquant');

export const fileExtensionFilter = (req, file, cb) => {
  const fileTypes = /jpeg|jpg|png|gif/;
  const extName = fileTypes.test(path.extname(file.originalname).toLocaleLowerCase());
  const mimeType = fileTypes.test(file.mimetype);
  if (mimeType && extName) {
    return cb(null, true);
  } else {
    req.fileValidationError = 'Invalid file type';
    return cb(new InternalServerErrorException('Invalid file type'), false);
  }
};

export class FileUploaderHelper {
  async compressImage(imageName): Promise<void> {
    // *.{jpg,jpeg,png}
    await imageMin([`./uploads/${imageName}`], {
      destination: './uploads',
      plugins: [
        imageMinMozJpeg(),
        imageMinPngQuant({
          quality: [0.6, 0.8],
        }),
      ],
    });
  }
}
