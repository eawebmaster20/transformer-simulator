import { Routes } from '@angular/router';
import { SplashScreenComponent } from './pages/splash-screen/splash-screen.component';
import { SimulationComponent } from './pages/simulation/simulation.component';

export const routes: Routes = [
    {path:'', component: SplashScreenComponent},
    {path:'home', component: SimulationComponent},
];
