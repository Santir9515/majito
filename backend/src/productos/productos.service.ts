import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Producto, ProductoDocument } from './schemas/producto.schema';
import { CreateProductoDto } from './dto/create-producto.dto';

@Injectable()
export class ProductosService {
  constructor(
    @InjectModel(Producto.name) private productoModel: Model<ProductoDocument>,
  ) {}

  create(createProductoDto: CreateProductoDto) {
    const producto = new this.productoModel(createProductoDto);
    return producto.save();
  }

  findAll() {
    return this.productoModel.find().exec();
  }

  findOne(id: string) {
    return this.productoModel.findById(id).exec();
  }
}