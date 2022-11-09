export interface IAdminRequest {
  requestID?: number;
  userID?: string;
  requestType?: string
  status?: string;
  isActive?: boolean;
  reviewerID?: number;
  username?: string;
  type?: string,
}
