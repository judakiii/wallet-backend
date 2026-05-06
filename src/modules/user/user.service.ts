import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { UserRepository } from './repositories';
import { UserUpdateDto } from './dto/user.dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(private readonly userRepository: UserRepository) {}

  async getInfo(id: string) {
    this.logger.log(`Get Data By This ID : ${id}`);
    const result = await this.userRepository.findById(id);

    return {
      message: 'Get Data Was Successfully',
      data: result,
    };
  }

  async update(userId: string, body: UserUpdateDto) {
    this.logger.log(`Update User By This ID : ${userId}`);

    const result = await this.userRepository.update({
      where: {
        id: userId,
      },
      data: body,
    });

    return {
      message: 'Update User Was Successfully',
      data: result,
    };
  }
}
