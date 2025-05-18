import {
  Component,
  inject,
  OnInit,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import {
  IonRippleEffect,
  ToastController,
  LoadingController,
} from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { from } from 'rxjs';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { Auth } from '@angular/fire/auth';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  imports: [FormsModule, TranslatePipe, IonRippleEffect],
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  router = inject(Router);
  auth = inject(Auth);
  toastController = inject(ToastController);
  loadingController = inject(LoadingController);

  email = '';
  password = '';

  ngOnInit() {}

  onRegister(): void {
    (document.activeElement as HTMLElement)?.blur();
    this.router.navigate(['/auth/register']);
  }

  async onLogin(): Promise<void> {
    (document.activeElement as HTMLElement)?.blur();
    const loading = await this.loadingController.create();
    await loading.present();

    from(
      signInWithEmailAndPassword(this.auth, this.email, this.password)
    ).subscribe({
      next: async () => {
        await loading.dismiss();
        this.router.navigate(['/app/home']);
      },
      error: async (error) => {
        await loading.dismiss();
        this.presentToast(error.message);
        console.error('Login error:', error);
      },
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
