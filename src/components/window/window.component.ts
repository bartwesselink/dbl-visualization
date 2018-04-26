import {Component, ElementRef, OnInit, ViewChild} from '@angular/core';

@Component({
    selector: 'app-window',
    templateUrl: './window.component.html',
})
export class WindowComponent implements OnInit {
    @ViewChild('canvas') private canvas: ElementRef;
    private context: CanvasRenderingContext2D;
  
    /** @author Roan Hofland */
    private errored: boolean = false;

    ngOnInit() {
        this.init();
      
        this.setHeight();
        this.redraw();

        window.onresize = () => this.setHeight();
    }
  
    //fallback rendering for when some OpenGL error occurs
    private onError(): void {
       this.context = this.canvas.nativeElement.getContext('2d');
       this.context.clearRect(0, 0, this.canvas.nativeElement.width, this.canvas.nativeElement.height);

       this.context.font = "30px Verdana";
       this.context.fillStyle = "red";
       this.context.fillText("An internal OpenGL error occurred!", 10, this.canvas.nativeElement.height / 2);
    }
  
    //draw OpenGL stuff
    private draw(): void {
      //TODO OpenGL drawing
    }
  
    //initialise OpenGL
    private init(): void {
      //TODO initialise OpenGL
    }
  
    //redraw canvas
    private redraw(): void {
       if(this.errored){
         this.onError();
       }else{
         this.draw();
       }
    }
    /** @end-author Roan Hofland */
    /** @author Bart Wesselink */
    private setHeight(): void {
        // fix to set correct canvas size
        setTimeout(() => {
            this.canvas.nativeElement.width = this.canvas.nativeElement.scrollWidth;
            this.canvas.nativeElement.height = this.canvas.nativeElement.scrollHeight;

            this.redraw();
        });
    }
    /** @end-author Bart Wesselink */
}
