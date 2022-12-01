export interface IAdminRequest {
  requestID?: number;
  userID?: number;
  requestType?: string
  status?: string;
  isActive?: boolean;
  reviewerID?: number;
  username?: string;
  type?: string,
}
