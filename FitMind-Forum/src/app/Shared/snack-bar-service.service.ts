import { inject, Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastrService } from 'ngx-toastr';
@Injectable({
  providedIn: 'root'
})
export class SnackBarServiceService {
  private snackBar = inject(MatSnackBar);

  showSuccess(message: string) {
    this.snackBar.open(message, '', {
      duration: 3000,
      panelClass: ['success-snackbar'], // Apply success style
    });
  }

  showError(message: string) {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['error-snackbar'], // Apply error style
    });
  }
}
