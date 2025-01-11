import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-splash-screen',
  standalone:true,
  imports: [],
  templateUrl: './splash-screen.component.html',
  styleUrl: './splash-screen.component.scss'
})
export class SplashScreenComponent {
  constructor(private router: Router){
    console.log('splash-screen');
    setTimeout(() => {
      this.navigateToHome();
    }, (Math.floor(Math.random() * (10 - 3 + 1)) + 3) * 1000);
  }
  navigateToHome(){
    this.router.navigate(['home']);
  }
}
