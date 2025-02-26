import { CanActivateFn, Router } from '@angular/router';
import { inject, OnInit } from '@angular/core';
import { MasterService } from './master.service';
import { ActivatedRoute } from '@angular/router';
import { routes } from '../app.routes';


export const authGuard: CanActivateFn = (route, state) => {
  var httpService = inject(MasterService);
  var router = inject(Router);


  // const token = router.snapshot.queryParamMap.get('token');

  // console.log(token);
  
  if (sessionStorage.getItem('appUser')) {
    
    return true;
  } else {
    router.navigate(['/home']);
    return false;
  }

  // return true;
};
