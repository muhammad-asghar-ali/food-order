import { IsEmail, IsOptional, Length } from "class-validator";

export class CreateDeliveryUserInput {
    @IsEmail()
    email: string;

    @Length(7,12)
    phone: string;

    @Length(6,12)
    password: string;

    @Length(3,12)
    firstName: string;

    @Length(3,12)
    lastName: string;

    @Length(6,24)
    address: string;

    @Length(4,12)
    pincode: string;
}