import { IsEmail, IsOptional, Length } from "class-validator";

export class CreateCustomerInput {
    @IsEmail()
    email: string;
    
    @Length(7,12)
    phone: string;
    
    @Length(6,12)
    password: string;
}

export interface CustomerPayload {
    _id: string;
    email: string;
    verified: boolean;
}

export class UserLoginInput {
    @IsEmail()
    email: string;
    
    @Length(6,12)
    password: string;
}

export class EditCustomerProfileInput {
   
    @IsOptional()
    @Length(3,16)
    firstName: string;

    @IsOptional()
    @Length(3,16)
    lastName: string;
    
    @IsOptional()
    @Length(6,16)
    address: string;
}
