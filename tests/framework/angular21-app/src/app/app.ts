import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core'
import { Map } from 'bkoi-gl'
import { BARIKOI_API_KEY } from '../env.generated'

@Component({
  selector: 'app-root',
  imports: [],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements AfterViewInit, OnDestroy {
  @ViewChild('mapEl', { static: true }) mapEl!: ElementRef<HTMLDivElement>
  private map?: InstanceType<typeof Map>

  ngAfterViewInit(): void {
    this.map = new Map({
      container: this.mapEl.nativeElement,
      accessToken: BARIKOI_API_KEY,
      center: [90.3938, 23.8216],
      zoom: 12,
    })
    this.map.on('load', () => {
      ;(window as unknown as { __READY: boolean }).__READY = true
    })
    this.map.on('idle', () => {
      ;(window as unknown as { __IDLE: boolean }).__IDLE = true
    })
  }

  ngOnDestroy(): void {
    this.map?.remove()
  }
}
