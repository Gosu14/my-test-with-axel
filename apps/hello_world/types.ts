import { JSON } from '@klave/sdk';

@serializable
export class ErrorMessage {
    success!: boolean;
    message!: string;
}

@serializable
export class FetchInput {
    key!: string;
}

@serializable
export class FetchOutput {
    success!: boolean;
    value!: string;
}

@serializable
export class StoreInput {
    key!: string;
    value!: string;
}

@serializable
export class StoreOutput {
    success!: boolean;
}

@serializable
export class SignInput {
    keyName!: string;
    message!: string;
}

@serializable
export class SignOutput {
    success!: boolean;
    signature!: string;
}

@serializable
export class VerifyInput {
    keyName!: string;
    message!: string;
    signature!: string;
}

@serializable
export class VerifyOutput {
    success!: boolean;
    isVerified!: boolean;
}
