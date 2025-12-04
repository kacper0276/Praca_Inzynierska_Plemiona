import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UserService } from '../../../auth/services/user.service';
import { UpdateUser } from '../../../auth/interfaces/update-user.interface';
import { environment } from '../../../../../environments/environment';
import { User } from '@shared/models';
import { ToastrService } from '@shared/services/toastr.service';

@Component({
  selector: 'app-edit-profile',
  templateUrl: './edit-profile.component.html',
  styleUrls: ['./edit-profile.component.scss'],
})
export class EditProfileComponent implements OnInit {
  profileForm!: FormGroup;
  user?: User;
  userInitials: string = '';
  originalEmail: string = '';
  backendUrl: string = environment.serverBaseUrl;

  profileImagePreview: string | ArrayBuffer | null = null;
  backgroundImagePreview: string | ArrayBuffer | null = null;

  public profileImageFile: File | null = null;
  public backgroundImageFile: File | null = null;

  constructor(
    private readonly fb: FormBuilder,
    private readonly userService: UserService,
    private readonly toastrService: ToastrService
  ) {}

  ngOnInit(): void {
    this.userService.getUserFromToken().subscribe({
      next: (res) => {
        (this.user = res.data), (this.originalEmail = res.data.email);

        this.calculateInitials();
        this.initializeForm();
      },
      error: (err) => {
        console.error('Nie udało się pobrać danych użytkownika', err);
      },
    });
  }

  private initializeForm(): void {
    this.profileForm = this.fb.group({
      firstName: [
        this.user?.firstName,
        [Validators.required, Validators.minLength(2)],
      ],
      lastName: [
        this.user?.lastName,
        [Validators.required, Validators.minLength(2)],
      ],
      login: [this.user?.login, Validators.required],
      bio: [this.user?.bio, Validators.maxLength(300)],
    });
  }

  private calculateInitials(): void {
    if (!this.user) return;
    const firstName = this.user.firstName || '';
    const lastName = this.user.lastName || '';
    this.userInitials = `${firstName.charAt(0)}${lastName.charAt(
      0
    )}`.toUpperCase();
  }

  onFileSelected(event: Event, imageType: 'profile' | 'background'): void {
    const input = event.target as HTMLInputElement;
    if (!input.files?.length) {
      return;
    }

    const file = input.files[0];
    const reader = new FileReader();

    reader.onload = () => {
      if (imageType === 'profile') {
        this.profileImagePreview = reader.result;
        this.profileImageFile = file;
      } else {
        this.backgroundImagePreview = reader.result;
        this.backgroundImageFile = file;
      }
    };

    reader.readAsDataURL(file);
  }

  saveChanges(): void {
    if (this.profileForm.invalid || !this.user) {
      this.toastrService.showError(
        'Formularz jest niepoprawny lub użytkownik nie został załadowany.'
      );
      return;
    }

    const updatedUserData: UpdateUser = this.profileForm.value;

    this.userService
      .updateUser(
        this.originalEmail,
        updatedUserData,
        this.profileImageFile,
        this.backgroundImageFile
      )
      .subscribe({
        next: (res) => {
          this.toastrService.showSuccess(
            'Profil został pomyślnie zaktualizowany!'
          );

          this.user = res.data.user;
          this.profileImageFile = null;
          this.backgroundImageFile = null;
        },
        error: (err) => {
          this.toastrService.showError(
            'Wystąpił błąd podczas aktualizacji profilu'
          );
        },
      });
  }
}
