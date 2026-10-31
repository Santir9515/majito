import { ConflictException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

function esErrorDeDuplicado(error: unknown): boolean {
  return (error as { code?: number }).code === 11000;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { password, ...rest } = createUserDto;
    const passwordHash = await bcrypt.hash(password, 10);
    const created = new this.userModel({ ...rest, passwordHash });
    let saved: UserDocument;
    try {
      saved = await created.save();
    } catch (error) {
      if (esErrorDeDuplicado(error)) {
        throw new ConflictException('Ya existe un usuario con ese email');
      }
      throw error;
    }
    const { passwordHash: _omit, ...result } = saved.toObject();
    return result;
  }

  findAll() {
    return this.userModel.find().select('-passwordHash').exec();
  }

  findOne(id: string) {
    return this.userModel.findById(id).select('-passwordHash').exec();
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const { password, ...rest } = updateUserDto;
    const updateData: Partial<User> = { ...rest };
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 10);
    }
    try {
      return await this.userModel
        .findByIdAndUpdate(id, updateData, { new: true })
        .select('-passwordHash')
        .exec();
    } catch (error) {
      if (esErrorDeDuplicado(error)) {
        throw new ConflictException('Ya existe un usuario con ese email');
      }
      throw error;
    }
  }

  remove(id: string) {
    return this.userModel
      .findByIdAndUpdate(id, { activo: false }, { new: true })
      .select('-passwordHash')
      .exec();
  }
}