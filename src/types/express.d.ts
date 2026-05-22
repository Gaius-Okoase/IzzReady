declare namespace Express {
  export interface Request {
    user: {
      id: string;
      role: 'owner' | 'customer';
      identifier: string;
    };
  }
}
