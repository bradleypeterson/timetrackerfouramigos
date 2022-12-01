
//Holds information about groups, projects and courses that a user has. Used
//in the admin user info modal

export interface ICourseAndGroupInfo {

  userID?: number;
  groupID?: number;
  groupName?: string;
  projectName?: string;
  courseID?: number;
  courseName?: string;
  instructorID?: number;
  instructorFirstName?: string;
  instructorLastName?: string;

}
