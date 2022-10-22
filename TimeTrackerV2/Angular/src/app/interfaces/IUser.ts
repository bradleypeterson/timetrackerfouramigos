export interface IUser {
  userID?: number;
  username?: string;
  firstName?: string;
  lastName?: string;
  type?: string;
  isActive?: boolean;
  password?: string;
  salt?: string;
}
