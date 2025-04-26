import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { AddPostComponent } from "../user/add-post/add-post.component";

@Component({
  selector: 'app-posts',
  imports: [CommonModule, AddPostComponent],
  templateUrl: './posts.component.html',
  styleUrls: ['./posts.component.css']
})
export class PostsComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
