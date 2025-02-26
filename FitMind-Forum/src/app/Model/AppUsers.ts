/*
Interface -> used as type checking
Class -> used as data manipulation
*/

export interface IAppUser {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  emailConfirmed: boolean;
  isDeleted: boolean;
  joinedDate: Date;
  updatedAt: Date;
  status: number;

  UniqueName: string;
  UserVisibility: number;
  Bio: string;
  Phone: number;
  FacebookLink: string;
  InstagramLink: string;
  ProfilePhoto: string;
}

export class AppUser {
  id: number;
  username: string;
  email: string;
  passwordHash: string;
  emailConfirmed: boolean;
  isDeleted: boolean;
  joinedDate: Date;
  updatedAt: Date;
  status: number;
  //other detail
  UniqueName: string;
  UserVisibility: number;
  Bio: string;
  Phone: number;
  FacebookLink: string;
  InstagramLink: string;
  ProfilePhoto: string;
  constructor() {
    this.id = 0;
    this.username = '';
    this.email = '';
    this.passwordHash = '';
    this.emailConfirmed = false;
    this.isDeleted = false;
    this.joinedDate = new Date();
    this.updatedAt = new Date();
    this.status = 1;
    this.UniqueName = '';
    this.UserVisibility = 1;
    this.Bio = '';
    this.Phone = 0;
    this.FacebookLink = '';
    this.InstagramLink = '';
    this.ProfilePhoto = '';
  }
}

//api response model prop and frontend model prop should be same
export class UserLoginDTO {
  Email: string;
  HashedPassword: string;
  constructor() {
    this.Email = '';
    this.HashedPassword = '';
  }
}
