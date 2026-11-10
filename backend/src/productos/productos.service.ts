import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Producto, ProductoDocument } from './schemas/producto.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Role } from '../users/enums/role.enum';
import { CreateProductoDto } from './dto/create-producto.dto';
import { UpdateProductoDto } from './dto/update-producto.dto';

@Injectable()
export class ProductosService {
  constructor(
    @InjectModel(Producto.name) private productoModel: Model<ProductoDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  // Solo Administración carga y modifica precios (RF-18).
  private async exigirAdministracion(usuarioId: string) {
    const usuario = await this.userModel.findById(usuarioId);
    if (!usuario || !usuario.activo) {
      throw new ForbiddenException('Usuario inexistente o inactivo');
    }
    if (usuario.rol !== Role.ADMINISTRACION) {
      throw new ForbiddenException(
        `El rol "${usuario.rol}" no puede modificar productos ni precios`,
      );
    }
  }

  // El precio de costo es solo para Administración (RNF-09).
  private async puedeVerCosto(usuarioId?: string): Promise<boolean> {
    if (!usuarioId) return false;
    const usuario = await this.userModel.findById(usuarioId);
    return !!usuario && usuario.activo && usuario.rol === Role.ADMINISTRACION;
  }

  async create(dto: CreateProductoDto) {
    const { usuarioId, ...datos } = dto;
    await this.exigirAdministracion(usuarioId);
    return new this.productoModel(datos).save();
  }

  async findAll(usuarioId?: string) {
    const consulta = this.productoModel.find();
    if (await this.puedeVerCosto(usuarioId)) {
      consulta.select('+precioCosto');
    }
    return consulta.exec();
  }

  async findOne(id: string, usuarioId?: string) {
    const consulta = this.productoModel.findById(id);
    if (await this.puedeVerCosto(usuarioId)) {
      consulta.select('+precioCosto');
    }
    const producto = await consulta.exec();
    if (!producto) {
      throw new NotFoundException('Producto no encontrado');
    }
    return producto;
  }

  async update(id: string, dto: UpdateProductoDto) {
    const { usuarioId, ...cambios } = dto;
    await this.exigirAdministracion(usuarioId);
    const actualizado = await this.productoModel
      .findByIdAndUpdate(id, cambios, { new: true, runValidators: true })
      .select('+precioCosto')
      .exec();
    if (!actualizado) {
      throw new NotFoundException('Producto no encontrado');
    }
    return actualizado;
  }
}