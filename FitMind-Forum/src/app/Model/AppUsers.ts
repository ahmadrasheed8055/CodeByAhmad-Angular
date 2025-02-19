/*
Interface -> used as type checking
Class -> used as data manipulation
*/

export interface IAppUser {
    // id: number;
    username: string;
    email: string;
    passwordHash: string;
    emailConfirmed: boolean;
    isDeleted: boolean;
    joinedDate: Date;
    updatedAt: Date;
    status: number;
  }

  export class AppUser {
    username: string;
    email: string;
    passwordHash: string;
    emailConfirmed: boolean;
    isDeleted: boolean;
    joinedDate: Date;
    updatedAt: Date;
    status: number;
  
    constructor() {
      this.username = "";
      this.email = "";
      this.passwordHash = "";
      this.emailConfirmed = false;
      this.isDeleted = false;
      this.joinedDate = new Date();
      this.updatedAt = new Date();
      this.status = 0;
    }
  }
  
  