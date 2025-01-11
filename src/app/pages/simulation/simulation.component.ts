import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {MatSelectModule} from '@angular/material/select';
import {MatButtonModule} from '@angular/material/button';
import { DialpadComponent } from '../../components/dialpad/dialpad.component';

@Component({
  selector: 'app-simulation',
  standalone:true,
  imports: [FormsModule, DialpadComponent, MatSelectModule, MatButtonModule],
  templateUrl: './simulation.component.html',
  styleUrl: './simulation.component.scss'
})
export class SimulationComponent implements OnInit{
  powerOn:boolean = false;
  selectedPort:any ;
  connectedPorts: any[] = [];
  disconnectedPorts: any[] = [];
  volts: number = 0;
  amps: number = 0;
  temp: number = 0;
  VMaxValue: number = 405;
  AMaxValue: number = 100;
  TMaxValue: number = 100;

  constructor(private cdr: ChangeDetectorRef) { }
  
  ngOnInit() {
    this.listenForPortChanges();
  }

  getValue(property:string, data: number){
    // console.log(data);
    switch (property) {
      case 'volts': 
        this.volts = data;
        break;
      case 'amps':
        this.amps = data;
        break;
      case 'temp':
        this.temp = data;
        break;
      default:
        break;
    }
  }

  listenForPortChanges() {
    (window as any).serialportAPI?.monitorPorts((event: string, ports: any[]) => {
      console.log(event, ports);
      if (event === 'connected') {
        this.connectedPorts.push(...ports);
        this.cdr.detectChanges(); 
      }
      if (event === 'disconnected') {
        this.disconnectedPorts.push(...ports);
        console.log('Ports disconnected:', ports);
      }
    });
  }

  sendDataToPort(path:string, data: any) {
    console.log(this.selectedPort);
    // (window as any).serialportAPI?.writeToPort(data);
    (window as any).serialportAPI?.connectToPort(this.selectedPort, 9600);
    setInterval(() => {
      (window as any).serialportAPI?.sendData(data);
    }, 3000);

    // Optionally listen for a success/failure response
    // (window as any).serialportAPI?.on('write-success', (message: string) => {
    //   console.log('Data written successfully:', message);
    // });

    // (window as any).serialportAPI?.on('write-error', (message: string) => {
    //   console.error('Error writing to port:', message);
    // });
  }
  togglePower() {
    if (this.powerOn) {
      this.volts= 0;
      this.amps = 0;
      this.temp = 0;
      this.VMaxValue = 0;
      this.AMaxValue = 0;
      this.TMaxValue = 0;
    }
    this.powerOn =!this.powerOn;
    this.sendDataToPort('COM4', '{path: Hello Serial Port, baudRate:9600}')
  }
}
