import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import {
  MovimientoStock,
  MovimientoStockDocument,
} from './schemas/movimiento-stock.schema';
import { TipoMovimiento } from './enums/tipo-movimiento.enum';
import { CrearMovimientoDto } from './dto/crear-movimiento.dto';
import { ROLES_MOVIMIENTO_MANUAL } from './roles-movimientos';
import { User, UserDocument } from '../users/schemas/user.schema';
import {
  Producto,
  ProductoDocument,
} from '../productos/schemas/producto.schema';

@Injectable()
export class MovimientosStockService {
  constructor(
    @InjectModel(MovimientoStock.name)
    private movimientoModel: Model<MovimientoStockDocument>,
    @InjectModel(Producto.name) private productoModel: Model<ProductoDocument>,
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async registrarManual(dto: CrearMovimientoDto) {
    const usuario = await this.userModel.findById(dto.usuarioId);
    if (!usuario || !usuario.activo) {
      throw new ForbiddenException('Usuario inexistente o inactivo');
    }
    if (!ROLES_MOVIMIENTO_MANUAL.includes(usuario.rol)) {
      throw new ForbiddenException(
        `El rol "${usuario.rol}" no puede registrar movimientos de stock`,
      );
    }

    if (dto.cantidad === 0) {
      throw new BadRequestException('La cantidad no puede ser cero');
    }

    const producto = await this.productoModel.findById(dto.productoId);
    if (!producto) {
      throw new NotFoundException(`Producto ${dto.productoId} no encontrado`);
    }

    if (dto.tipo === TipoMovimiento.MIGRACION_INICIAL) {
      if (dto.cantidad < 0) {
        throw new BadRequestException(
          'La migración inicial debe tener cantidad positiva',
        );
      }
      const yaMigrado = await this.movimientoModel.exists({
        productoId: producto._id,
        tipo: TipoMovimiento.MIGRACION_INICIAL,
      });
      if (yaMigrado) {
        throw new BadRequestException(
          'Este producto ya tiene una migración inicial cargada',
        );
      }
    }

    // Una sola operación atómica: si es un egreso, solo se aplica si alcanza el stock
    const filtro =
      dto.cantidad < 0
        ? { _id: producto._id, stockActual: { $gte: -dto.cantidad } }
        : { _id: producto._id };
    const actualizado = await this.productoModel.findOneAndUpdate(
      filtro,
      { $inc: { stockActual: dto.cantidad } },
      { new: true },
    );
    if (!actualizado) {
      throw new BadRequestException(
        `Stock insuficiente: hay ${producto.stockActual} y se intenta descontar ${-dto.cantidad}`,
      );
    }

    try {
      const movimiento = await new this.movimientoModel({
        productoId: producto._id,
        tipo: dto.tipo,
        cantidad: dto.cantidad,
        usuarioId: usuario._id,
        motivo: dto.motivo,
        fecha: new Date(),
      }).save();
      return { movimiento, stockActual: actualizado.stockActual };
    } catch (error) {
      // Si no se pudo registrar el movimiento, se deshace el cambio de stock
      await this.productoModel.updateOne(
        { _id: producto._id },
        { $inc: { stockActual: -dto.cantidad } },
      );
      throw error;
    }
  }

  async listarPorProducto(productoId: string, usuarioId: string) {
    const usuario = await this.userModel.findById(usuarioId);
    if (!usuario || !usuario.activo) {
      throw new ForbiddenException('Usuario inexistente o inactivo');
    }
    if (!ROLES_MOVIMIENTO_MANUAL.includes(usuario.rol)) {
      throw new ForbiddenException(
        `El rol "${usuario.rol}" no puede ver movimientos de stock`,
      );
    }

    const producto = await this.productoModel.findById(productoId);
    if (!producto) {
      throw new NotFoundException(`Producto ${productoId} no encontrado`);
    }

    return this.movimientoModel
      .find({ productoId: producto._id })
      .sort({ fecha: -1 })
      .exec();
  }
}