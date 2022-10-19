export interface ITimeCard
{
  timeslotID?: number;
  timeIn?: string;
  timeOut?: string;
  isEdited?: boolean;
  createdOn?: string;
  userID?: number;
  description?: string;
  groupID?: number;
}
