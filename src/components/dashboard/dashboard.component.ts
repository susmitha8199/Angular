import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConcernService } from 'src/services/concern.service';

interface Concern {
  id: number;
  title: string;
  description: string;
  imageUrl?: string;
  location: string;
  status: string;
  comments?: string;
  commentsCount?: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})

export class DashboardComponent {
  concerns: Concern[] = [];
  allConcerns: Concern[] = [];
  showUploadPopup = false;
  uploadForm!: FormGroup;
  searchTerm: string = '';
  imageError: string = '';
  selectedImage: File | null = null;

  constructor(private router: Router, private http: HttpClient, private fb: FormBuilder, private concernService: ConcernService) {}

  ngOnInit() {
    this.uploadForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      imageUrl: ['', Validators.required],
      location: ['', Validators.required],  
    });
    this.navigateToAll();
  }

  navigateToAll() {
    this.concernService.fetchConcerns().subscribe({
      next: (data: any) => {
        this.allConcerns = data;
        this.concerns = [...data];
      },
      error: (err: any) => {
        console.error('Failed to fetch concerns', err);
      }
    });
  }

  getUserName(): string {
    return localStorage.getItem('username') || '';
  }
  getUserRole(): string {
    return localStorage.getItem('role') || 'User';
  }

  fetchData() {
    if (this.searchTerm.trim() === '') {
      this.concerns = [...this.allConcerns];
      return;
    }
    const term = this.searchTerm.toLowerCase();

    this.concerns = this.allConcerns.filter(concern =>
      concern.title.toLowerCase().includes(term) ||
      concern.description.toLowerCase().includes(term) ||
      concern.location.toLowerCase().includes(term) ||
      concern.status.toLowerCase().includes(term)
    );
  }

  showConcernsByLocation(location: string){
    this.concernService.locationBasedConcerns(location).subscribe({
      next: (data) => {
        this.concerns = data; 
      },
      error: (err) => console.error(err)
    });
  }

  showConcernsByStatus(status: string){
    this.concernService.statusBasedConcerns(status).subscribe({
      next: (data) => {
        this.concerns = data; 
      },
      error: (err) => console.error(err)
    });
  }

  navigateToMyConcerns(){
    alert('Navigating to My Concerns');
  }

  openUploadPopup() {
    this.showUploadPopup = true;
    this.uploadForm.reset({
      title: '',
      description: '',
      location: ''  
    });
    this.selectedImage = null;
    this.imageError = '';
  }

  closeUploadPopup() {
    this.showUploadPopup = false;
    this.uploadForm.reset();
    this.selectedImage = null;
  }

  submitConcern() {
    this.uploadForm.markAllAsTouched();

    if (this.uploadForm.invalid) return;
    const concern = {
      title: this.uploadForm.value.title,
      description: this.uploadForm.value.description,
      location: this.uploadForm.value.location,
      imageUrl: this.uploadForm.value.imageUrl 
    };

    this.concernService.uploadConcern(concern).subscribe({
      next: (res: any) => {
        this.closeUploadPopup();
        this.navigateToAll();
      },
      error: (err: any) => {
        console.error('Upload failed:', err);
      }
    });
  }

  onLogout() {
    this.router.navigate(['/login']);
  }

}
