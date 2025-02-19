import { ICategories } from "./../Model/categories";

import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
// it was missing this import statement in app.config.ts file , add this into the config file
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class MasterService {
  constructor(private http: HttpClient) {}

  API_URL = "http://localhost:5177/api/";

  //=====Categories API=====
  GET_ALL_CATEGORIES = "Categories";

  getAllCategories(): Observable<ICategories[]> {
    return this.http
      .get<ICategories[]>(this.API_URL + this.GET_ALL_CATEGORIES)
      .pipe(
        catchError((error) => {
          if (error.status === 0) {
            // Network error or server down
            return throwError(
              "The server is currently unavailable. Please try again later."
            );
          } else {
            // Other errors like 404 or 500
            return throwError(
              "An error occurred while fetching categories. Please try again later."
            );
          }
        })
      );
  }

  //=====Email Varification API=====
  SEND_EMAIL_API = "EmailSending/send-email?receptor=";

  sendRegistrationEmail(email: string) {

    // debugger;
    const url = this.API_URL + this.SEND_EMAIL_API + encodeURIComponent(email);

    return this.http.post(url, {});

  }

  //========Validation on emial registration page
  EMAIL_TOKEN_VALIDATION_API = "EmailSending/validate-email-token";

  validateEmailToken(token: string) {
    const url = this.API_URL + this.EMAIL_TOKEN_VALIDATION_API + "?token=" + token;

    return this.http.get(url, { });
  }
}

/*
create guard then implement or add in route like array, then add conditions
*/