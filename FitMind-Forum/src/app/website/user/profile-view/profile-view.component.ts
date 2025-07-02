import { Component, Inject } from '@angular/core';
import { PublicAppUserDTO, AppUserPhotos } from '../../../Model/AppUsers';
import { AuthService } from '../../../Shared/auth.service';
import { Subscription } from 'rxjs';
import { DatePipe } from '@angular/common';
import { MasterService } from '../../../Shared/master.service';

@Component({
  selector: 'app-profile-view',
  imports: [DatePipe],
  templateUrl: './profile-view.component.html',
  styleUrl: './profile-view.component.css',
})
export class ProfileViewComponent {
  user!: PublicAppUserDTO;
  userPhotos!: AppUserPhotos;
  masterService = Inject(MasterService);

  private subscriptions: Subscription = new Subscription();

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.authService.appUserData$.subscribe((user: any) => {
        this.user = user;
      })
    );

    this.subscriptions.add(
      this.authService.appUserPhotos$.subscribe((photos: any) => {
        this.userPhotos = photos;
      })
    );

    //getting all posts
    

  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
