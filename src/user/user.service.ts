import { ConflictException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
// app imports
import { UserEntity } from '../auth/user.entity';
import { GetUserResponse } from './dto/get-user-response';
import { UpdateUserDTO } from './dto/update-user.dto';

@Injectable()
export class UserService {
  private logger = new Logger('UserService');

  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {
  }

  // private getUserRO(user: UserEntity): GetUserResponse {
  //   return {
  //     id: user.id,
  //     uuid: user.uuid,
  //     name: user.name,
  //     email: user.email,
  //     avatar: user.avatar,
  //   };
  // }

  async getUser(
    userId: number,
    user: UserEntity,
  ): Promise<GetUserResponse> {
    const found = await this.userRepository.findOne({ where: { id: userId }, relations: ['projects', 'projectsSharedWithYou'] });
    // console.log('___ found', found); // todo

    if (!found || (found.email !== user.email && found.password !== user.password)) {
      throw new NotFoundException(`User with id "${userId}" not found.`);
    }
    return new GetUserResponse(found);
  }

  async updateUser(
    userId: number,
    user: UserEntity,
    updateUserDTO: UpdateUserDTO,
  ): Promise<GetUserResponse> {
    let foundUser = await this.userRepository.findOne({ where: { id: userId } });

    if (!foundUser || (foundUser.email !== user.email && foundUser.password !== user.password)) {
      this.logger.error(`User with id ${userId} not found.`);
      throw new NotFoundException(`User with id: "${userId}" not found.`);
    }

    try {
      this.logger.verbose(`The user was updated with data: "${JSON.stringify(updateUserDTO)}"`);
      await this.userRepository.update({ id: userId }, updateUserDTO);
    } catch (error) {

      if (error.code === '23505') {
        this.logger.error(`Email ${updateUserDTO.email} already exists.`);
        throw new ConflictException(`Email already exists.`);
      }

      this.logger.error(`Failed to update user with userId "${userId}". Data: ${JSON.stringify(updateUserDTO)}.`, error.stack);
      throw new InternalServerErrorException();
    }

    foundUser = await this.userRepository.findOne({ where: { id: userId } });
    return new GetUserResponse(foundUser);
  }

  async uploadAvatar(
    userId: number,
    user: UserEntity,
    avatar: any,
  ): Promise<any> {
    const foundUser = await this.userRepository.findOne({ where: { id: userId } });

    if (!foundUser || (foundUser.email !== user.email && foundUser.password !== user.password)) {
      throw new NotFoundException(`User with id "${userId}" not found.`);
    }

    try {
      await this.userRepository.update({ id: userId }, {avatar});
    } catch (error) {
      this.logger.error(`Failed to upload avatar for userId "${userId}".`, error.stack);
      throw new InternalServerErrorException();
    }

    return {fileName: avatar};
  }
}
