import { Request } from 'express';

export default interface UserRequest extends Request {
    user: {
        id: number;
        email: string;
        roles: string[];
    };
}
