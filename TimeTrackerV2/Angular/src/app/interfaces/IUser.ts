export interface IUser {
  id?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  type?: string;
  isActive?: boolean;
  password?: string;
  salt?: string;
}
