import { bootstrapApplication } from '@angular/platform-browser';
import { RouteReuseStrategy, provideRouter, withPreloading, PreloadAllModules } from '@angular/router';
import { IonicRouteStrategy, provideIonicAngular } from '@ionic/angular/standalone';

import { routes } from './app/app.routes';
import { AppComponent } from './app/app.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';

bootstrapApplication(AppComponent, {
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideIonicAngular(),
    provideRouter(routes, withPreloading(PreloadAllModules)),
    provideFirebaseApp(() => initializeApp({ projectId: "mining-5b90f", appId: "1:625012243137:web:6bfda240d1fc63ec28b240", storageBucket: "mining-5b90f.firebasestorage.app", apiKey: "AIzaSyB8ZaZ2r9X0JDYTjMzJ_oj7x5iFHqhkxYo", authDomain: "mining-5b90f.firebaseapp.com", messagingSenderId: "625012243137", measurementId: "G-6F3GDDT2NL" })),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
});
