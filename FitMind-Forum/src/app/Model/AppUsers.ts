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

  uniqueName: string;
  userVisibility: number;
  bio: string;
  phone: number;
  facebookLink: string;
  instagramLink: string;
  location: string;
  country: string;

  profilePhoto: string;
  backgroundPhoto: string;
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
  uniqueName: string;
  userVisibility: number;
  bio: string;
  phone: number;
  facebookLink: string;
  instagramLink: string;
  location: string;
  country: string;
  profilePhoto: string;
  backgroundPhoto: string;
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
    this.uniqueName = '';
    this.userVisibility = 1;
    this.bio = '';
    this.phone = 0;
    this.facebookLink = '';
    this.instagramLink = '';
    this.location = '';
    this.country = '';
    this.profilePhoto = '';
    this.backgroundPhoto = '';
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

export class UpdateAppUserDTO {
  id: number;
  username: string;
  uniqueName: string;
  // userVisibility: number;
  bio: string;
  phone: number;
  facebookLink: string;
  instagramLink: string;
  location: string;
  country: string;

  constructor() {
    this.id = 0;
    this.username = '';
    this.uniqueName = '';
    // this.userVisibility = 1;
    this.bio = '';
    this.phone = 0;
    this.facebookLink = '';
    this.instagramLink = '';
    this.location = '';
    this.country = '';
  }
}


export class PublicAppUserDTO{
  id: number;
  username: string;
  email: string;
  emailConfirmed: boolean;
  isDeleted: boolean;
  joinedDate: Date;
  updatedAt?: Date;
  status: number;
  uniqueName?: string;
  userVisibility?: number;
  bio?: string;
  phone?: number;
  facebookLink?: string;
  instagramLink?: string;
  location?: string;
  country?: string;

  constructor() {
    this.id = 0;
    this.username = '';
    this.email = '';
    this.emailConfirmed = false;
    this.isDeleted = false;
    this.joinedDate = new Date();
    this.updatedAt = undefined;
    this.status = 1;
    this.uniqueName = '';
    this.userVisibility = 0;
    this.bio = '';
    this.phone = 0;
    this.facebookLink = '';
    this.instagramLink = '';
    this.location = '';
    this.country = '';
  }
}

export class AppUserPhotos{
  profilePhoto: string;
  backgroundPhoto: string;
  constructor(){
    this.profilePhoto = '';
    this.backgroundPhoto = '';
  }
}

export class RegisterUserDTO{
  Id:number;
  Username:string;
  Email:string;
  PasswordHash:string;
  constructor(){
    this.Id = 0;
    this.Username = '';
    this.Email = '';
    this.PasswordHash = '';
  }
}