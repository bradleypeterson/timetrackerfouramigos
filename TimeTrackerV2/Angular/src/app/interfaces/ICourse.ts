export interface ICourse {
  courseID?: number;
  courseName?: string;
  isActive?: boolean;
  instructorID?: number;
  description?: string;
  firstName?: string;
  lastName?: string;
  display?: boolean; // depending on whether they're visible or not
  leave?: boolean; // depending on whether the request was accepted
  pending?: boolean; // depending on whether the request is pending
}
