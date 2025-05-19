import { Component, inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import {
  IonApp,
  IonRouterOutlet,
  IonRippleEffect,
} from '@ionic/angular/standalone';
import { TranslateService } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrl: 'app.component.scss',
  imports: [IonApp, IonRouterOutlet, IonRippleEffect, RouterModule],
})
export class AppComponent {
  private router = inject(Router);
  private auth = inject(Auth);
  isLoggedIn = toSignal(authState(this.auth), { initialValue: null });

  constructor(private translate: TranslateService) {
    this.translate.addLangs(['ro', 'en']);
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }

  async logout() {
    await this.auth.signOut();

    (document.activeElement as HTMLElement)?.blur();
    this.router.navigate(['/auth/login']);
  }
}
