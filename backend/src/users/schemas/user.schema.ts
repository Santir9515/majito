import {Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Role } from '../enums/role.enum';


export type UserDocument = HydratedDocument<User>;
@Schema ({ timestamps: true})
export class User {
    @Prop({ required: true})
    nombre: string;

    @Prop({ required: true, unique: true})
    email: string;

    @Prop({ required: true})
    passwordHash: string;

    @Prop({ required: true, enum: Role})
    rol: Role;

    @Prop({ default: true})
    activo: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);