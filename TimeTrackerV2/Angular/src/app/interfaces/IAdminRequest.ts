export interface IAdminRequest {
  requestID?: number;
  userID?: string;
  username?: string;
  requestType?: string
  status?: string;
  isActive?: boolean;
  reviewerID?: number;
}
