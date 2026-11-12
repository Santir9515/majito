import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from '../users/schemas/user.schema';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async login(dto: LoginDto) {
    const usuario = await this.userModel.findOne({ email: dto.email });
    const coincide =
      !!usuario && (await bcrypt.compare(dto.password, usuario.passwordHash));
    // Mismo mensaje para email inexistente y contraseña incorrecta: no revela qué usuarios existen.
    if (!usuario || !coincide) {
      throw new UnauthorizedException('Email o contraseña incorrectos');
    }
    // RF-04: un usuario inactivo no puede iniciar sesión.
    if (!usuario.activo) {
      throw new ForbiddenException('Usuario inactivo');
    }
    const { passwordHash: _omit, ...resultado } = usuario.toObject();
    return resultado;
  }
}