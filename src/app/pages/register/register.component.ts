import { Component, inject, OnInit } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  IonRippleEffect,
  ToastController,
  LoadingController,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Auth, createUserWithEmailAndPassword } from '@angular/fire/auth';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss'],
  imports: [FormsModule, TranslatePipe, IonRippleEffect],
})
export class RegisterComponent implements OnInit {
  private router = inject(Router);
  private auth = inject(Auth);
  private toastController = inject(ToastController);
  private translateService = inject(TranslateService);
  private loadingController = inject(LoadingController);

  email = '';
  password = '';
  repeatPassword = '';

  ngOnInit() {}

  onBack(): void {
    (document.activeElement as HTMLElement)?.blur();
    this.router.navigate(['/auth/login']);
  }

  async onRegister(): Promise<void> {
    if (!this.email || !this.password || !this.repeatPassword) {
      this.presentToast(this.translateService.instant('ERROR.COMPLETE_FIELD'));
      return;
    }

    if (this.password !== this.repeatPassword) {
      this.presentToast(
        this.translateService.instant('ERROR.PASSWORD_MISMATCH')
      );
      return;
    }

    const loading = await this.loadingController.create();
    await loading.present();

    createUserWithEmailAndPassword(this.auth, this.email, this.password)
      .then(async () => {
        await loading.dismiss();
        (document.activeElement as HTMLElement)?.blur();
        this.router.navigate(['/app/home']);
      })
      .catch(async (error) => {
        await loading.dismiss();
        this.presentToast(error.message);
        console.error('Registration error:', error);
      });
  }

  async presentToast(message: string) {
    const toast = await this.toastController.create({
      message: message,
      duration: 2000,
      position: 'bottom',
      color: 'danger',
    });

    await toast.present();
  }
}
