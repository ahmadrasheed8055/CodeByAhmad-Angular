import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { MasterService } from '../../../Shared/master.service';
import { AuthService } from '../../../Shared/auth.service';
import { CommentDTO, AddCommentDTO } from '../../../Model/Comment';
import { SnackBarServiceService } from '../../../Shared/snack-bar-service.service';

@Component({
  selector: 'app-comments',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.css']
})
export class CommentsComponent implements OnInit {
  @Input() postId!: number;

 

  constructor() {
 
  }

  ngOnInit() {

  }

}
