import { CanActivateFn } from '@angular/router';
import { inject, OnInit } from '@angular/core';
import { MasterService } from './master.service';
import { ActivatedRoute } from '@angular/router';
import { routes } from './../app.routes';

export const authGuard: CanActivateFn = (route, state) => {


  var httpService = inject(MasterService);
  var router = inject(ActivatedRoute);

  const token = router.snapshot.queryParamMap.get('token');


  console.log(token);

  debugger;
  

   
  return true;
};

