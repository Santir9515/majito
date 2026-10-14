import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
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

  // Aplica el stock de todos los ítems de un ticket (descuento al facturar o reintegro al anular).
  // Es todo o nada: si un ítem falla, se deshacen los ya aplicados.
  async aplicarPorTicket(
    ticketId: Types.ObjectId,
    items: {
      productoId: Types.ObjectId;
      productoNombre: string;
      cantidad: number;
    }[],
    tipo:
      TipoMovimiento.DESCUENTO_FACTURACION | TipoMovimiento.REINTEGRO_ANULACION,
    usuarioId: Types.ObjectId,
  ) {
    const signo = tipo === TipoMovimiento.DESCUENTO_FACTURACION ? -1 : 1;
    const aplicados: typeof items = [];

    try {
      for (const item of items) {
        const delta = signo * item.cantidad;
        const filtro =
          delta < 0
            ? { _id: item.productoId, stockActual: { $gte: -delta } }
            : { _id: item.productoId };
        const actualizado = await this.productoModel.findOneAndUpdate(filtro, {
          $inc: { stockActual: delta },
        });
        if (!actualizado) {
          throw new BadRequestException(
            `Stock insuficiente para "${item.productoNombre}" (se necesitan ${item.cantidad})`,
          );
        }
        aplicados.push(item);
      }

      await this.movimientoModel.insertMany(
        items.map((item) => ({
          productoId: item.productoId,
          tipo,
          cantidad: signo * item.cantidad,
          usuarioId,
          ticketId,
          fecha: new Date(),
        })),
      );
    } catch (error) {
      // Se deshacen los ítems que ya se habían aplicado
      await Promise.all(
        aplicados.map((item) =>
          this.productoModel.updateOne(
            { _id: item.productoId },
            { $inc: { stockActual: -signo * item.cantidad } },
          ),
        ),
      );
      throw error;
    }
  }

  // Compensación: deshace los movimientos de un ticket si algo falló después de aplicarlos
  async deshacerPorTicket(ticketId: Types.ObjectId, tipo: TipoMovimiento) {
    const movimientos = await this.movimientoModel.find({ ticketId, tipo });
    await Promise.all(
      movimientos.map((m) =>
        this.productoModel.updateOne(
          { _id: m.productoId },
          { $inc: { stockActual: -m.cantidad } },
        ),
      ),
    );
    await this.movimientoModel.deleteMany({ ticketId, tipo });
  }
}
