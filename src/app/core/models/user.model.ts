export interface User {
  id?: number;
  username: string;
  password?: string;
  token?: string;
  role: string;
  email?: string;
  name?: string;
  createdAt?: Date;
  updatedAt?: Date;
}