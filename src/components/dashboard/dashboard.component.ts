import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageEvent } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { ConcernService } from 'src/services/concern.service';
import { MarqueeService } from 'src/services/marquee.service';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSelectModule } from '@angular/material/select';
import { ToastrService } from 'ngx-toastr';

export interface Comment {
  id: number;
  text: string;
  userRole: string;
}

interface Concern {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  location: string;
  status: string;
  comments?: Comment[];
  commentsCount?: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent implements OnInit {
  concerns: Concern[] = [];
  allConcerns: Concern[] = [];
  totalConcerns = 0;
  pageSize = 5;
  currentPage = 0;
  showUploadPopup = false;
  uploadForm!: FormGroup;
  roleForm!: FormGroup;
  searchTerm: string = '';
  imageError: string = '';
  selectedImage: File | null = null;
  userRole: string = '';
  marqueeMessage: string = '';
  statusCount: any = {};
  locations: string[] = ['Hyderabad', 'Bangalore', 'Chennai', 'Delhi', 'Mumbai'];
  statuses: string[] = ['PENDING', 'RESOLVED', 'IN_PROGRESS'];
  popupType: 'UPLOAD' | 'ROLE' = 'UPLOAD';
  errorMessage: any;
  newComments: { [key: number]: string } = {};
  showCommentBox: { [key: number]: boolean } = {};
  pendingCount!: number;
  inProgressCount!: number;
  resolvedCount!: number;

  constructor(private router: Router, private http: HttpClient, private fb: FormBuilder, private concernService: ConcernService, private marqueeService: MarqueeService, private toastr: ToastrService,) {}

  ngOnInit() {
    this.uploadForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required, Validators.minLength(5)],
      imageUrl: ['', Validators.required],
      location: ['', Validators.required]
    });
    this.roleForm = this.fb.group({
            email: ['', [Validators.required, Validators.email]],
            role: ['USER', Validators.required]
    });
    this.userRole = localStorage.getItem('role') || 'USER';
    this.marqueeService.getMarqueeMessage(this.userRole).subscribe({
      next: (msg) => this.marqueeMessage = msg,
      error: (err: any) => console.error('Error fetching marquee message', err)
    });
    this.navigateToAll();
    this.concernService.getStatusCounts().subscribe({
    next: (counts) => {
      this.pendingCount = counts['PENDING'];
      this.inProgressCount = counts['IN_PROGRESS'];
      this.resolvedCount = counts['RESOLVED'];
    },
  error: (err) => console.error('Failed to fetch status counts', err)
});
    this.loadConcerns(0, this.pageSize);
  }

  navigateToAll() {
    this.concernService.fetchConcerns().subscribe({
      next: (data: any[]) => {
        this.allConcerns = data;
        this.concerns = data.map(c => ({
          ...c,
          comments: c.comments || [] 
        }));
        this.totalConcerns = this.allConcerns.length;
        const start = 0;
        const end = this.pageSize;
        this.concerns = this.allConcerns.slice(start, end);
        this.loadStatusCount();
        this.currentPage = 0;
      },
      error: (err: any) => {
        this.totalConcerns = 0;
        this.allConcerns = [];   
        this.concerns = []; 
        console.error('Failed to fetch concerns', err);
      }
    });
  }

  loadStatusCount(): void {
    if (!this.allConcerns) return;
    this.statusCount = this.allConcerns.reduce((acc: { [key: string]: number }, concern) => {
      const status = concern.status?.toUpperCase() || 'UNKNOWN';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
  }

  getUserName(): string {
    return localStorage.getItem('username') || '';
  }
  getUserRole(): string {
    return localStorage.getItem('role') || 'User';
  }

  fetchData() {
    const term = this.searchTerm.trim();

    if (term === '') {
      // reload all concerns if search is empty
      this.navigateToAll();
      return;
    }

    this.concernService.searchConcerns(term).subscribe({
      next: (data) => {
        this.concerns = data;
        this.allConcerns = data;
        this.totalConcerns = this.allConcerns.length;
      },
      error: (err) => {
        this.totalConcerns = 0;
        this.allConcerns = [];   
        this.concerns = [];  
        console.error('Search failed', err);}
    });
  }

  showConcernsByLocation(location: string){
    this.concernService.locationBasedConcerns(location).subscribe({
      next: (data) => {
        this.allConcerns = data.map(c => ({
          ...c,
          comments: Array.isArray(c.comments) ? c.comments : []
        })) as Concern[];
        this.concerns = data.map(c => ({
          ...c,
          comments: Array.isArray(c.comments) ? c.comments : []
        })) as Concern[]; 
        this.totalConcerns = this.allConcerns.length;
        this.errorMessage = '';
      },
      error: (err) => {
        if (err.status === 404 && err.error?.message) {
          this.concerns = []; // clear old data
          this.totalConcerns = 0;
          this.allConcerns = [];
          this.errorMessage = err.error.message; 
        } else {
          this.errorMessage = 'Failed to fetch concerns. Please try again later.';
        }
      }
    });
  }

  showConcernsByStatus(status: string){
    this.concernService.statusBasedConcerns(status).subscribe({
      next: (data) => {
        this.concerns = data.map(c => ({
          ...c,
          comments: Array.isArray(c.comments) ? c.comments : []
        })) as Concern[];
        this.allConcerns = data.map(c => ({
          ...c,
          comments: Array.isArray(c.comments) ? c.comments : []
        })) as Concern[];
        this.totalConcerns = this.allConcerns.length;
      },
      error: (err) => {
        this.concerns = []; // clear old data
        this.totalConcerns = 0;
        this.allConcerns = [];
        console.error('Failed to fetch concerns by status', err);
      }
    });
  }

  changeStatus(concern: any) {
    this.concernService.updateStatus(concern.id, concern.status).subscribe({
      next: (updated) => {
        concern.status = updated.status;
        this.toastr.success('Status updated successfully');
        this.loadStatusCount();
      },
      error: (err) => {
        console.error('Failed to update status', err);
      }
    });
  }

  toggleCommentBox(concern: any) {
    this.showCommentBox[concern.id] = !this.showCommentBox[concern.id];
  }

  addComment(concern: any) {
    const commentText = this.newComments[concern.id]?.trim();
    const userRole = this.userRole; 
    const username = localStorage.getItem('username') || 'Anonymous';

    if (!commentText) {
      alert('Please enter a comment.');
      return;
    }

    this.concernService.addComment(concern.id, commentText, userRole).subscribe({
      next: (res: any) => {
        concern.comments = concern.comments || [];
        concern.comments.push({
          id: res.id,       
          text: commentText,
          userRole: userRole
        });
        console.log('Comment added:', res);
        concern.commentsCount = concern.comments.length;
        this.newComments[concern.id] = '';  // Reset input and hide box
        this.showCommentBox[concern.id] = false;
        this.toastr.success('Comment added successfully');
      },
      error: (err) => {
        this.toastr.error('Failed to add comment. Try again.');
      }
    });
  }

  removeComment(concern: any, comment: any) {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    this.concernService.deleteComment(comment.id).subscribe({
      next: () => {
        concern.comments = (concern.comments as any[]).filter((c:any) => c.id !== comment.id);
        concern.commentsCount = concern.comments.length;
        this.toastr.success('Comment deleted successfully');
      },
      error: (err) => {
        console.error('Failed to delete comment', err);
        this.toastr.error('Failed to delete comment. Try again.');
      }
    });
  }

  openRolePopup() {
        this.popupType = 'ROLE';
        this.showUploadPopup = true;
        this.roleForm.reset({
          email: '',
          role: 'USER'
        });
  }

  openUploadPopup() {
    this.popupType = 'UPLOAD';
    this.showUploadPopup = true;
    this.uploadForm.reset({
      title: '',
      description: '',
      location: '',
      email: '',
      access: ''
    });
    this.selectedImage = null;
    this.imageError = '';
  }

  closeUploadPopup() {
    this.showUploadPopup = false;
    this.uploadForm.reset();
    this.roleForm.reset();
    this.roleForm.reset({ role: 'USER' });
    this.selectedImage = null;
  }

  submitConcern() {
    this.uploadForm.markAllAsTouched();
    const body = this.uploadForm.value;
    // if (!body.comments) {
    //   body.comments = ''; 
    // }
    delete body.comments;
    if (this.uploadForm.invalid) return;
    this.concernService.uploadConcern(this.uploadForm.value).subscribe({
      next: (res: any) => {
        this.concerns.unshift(res);
        this.closeUploadPopup();
        this.navigateToAll();
      },
      error: (err: any) => {
        console.error('Upload failed:', err);
      }
    });
  }

  submitRoleChange() {
    this.roleForm.markAllAsTouched();
    if (this.roleForm.valid) {
      const email = this.roleForm.get('email')?.value;
      const role = this.roleForm.get('role')?.value.toUpperCase();

      this.concernService.updateUserRole(email, role).subscribe({
        next: (res: any) => {
          this.toastr.success(res);
          this.closeUploadPopup();
          this.roleForm.reset();  // reset with default selection
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('Failed to update role. ' + (err.error || ''));
        }
      });
    }
  }

  loadConcerns(page: number = 0, size: number = 5) {
    this.concernService.fetchConcernsPaged(page, size).subscribe({
      next: (res: any) => {
        this.concerns = res.content;  // current page data
        this.totalConcerns = res.totalElements;   // total count from backend
        this.currentPage = page;
        this.pageSize = size;
      },
      error: (err) => console.error('Failed to fetch concerns', err)
    });
  }

  onPageChange(event: PageEvent) {
    this.loadConcerns(event.pageIndex, event.pageSize);
  }

  onLogout() {
    localStorage.removeItem('token');  
    localStorage.removeItem('role');   
    localStorage.removeItem('email');
    this.router.navigate(['/login']);
  }

}
