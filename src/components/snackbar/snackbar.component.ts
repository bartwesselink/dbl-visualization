import {Component} from '@angular/core';
import {SnackbarOptions} from '../../interfaces/snackbar-options';
import {SnackbarBus} from '../../providers/snackbar-bus';

@Component({
    selector: 'app-snackbar',
    templateUrl: './snackbar.component.html',
})
export class SnackbarComponent {
    private readonly ANIMATION_WAIT_TIME = 500;
    private queue: SnackbarOptions[] = [];
    public current: SnackbarOptions;
    private lastTimer: any;
    public animate: boolean = false;

    constructor(private snackbarBus: SnackbarBus) {
        this.snackbarBus.sent.subscribe(value => {
            this.queue.push(value);

            this.checkQueue();
        })
    }

    private checkQueue(): void {
        if (this.current != null || this.queue.length === 0) {
            return;
        }

        this.current = this.queue[0];
        this.queue.splice(0, 1);

        setTimeout(() => {
            this.animate = true;
        }, 25);

        if (this.current.duration > -1) {
            this.lastTimer = setTimeout(() => {
                this.animate = false;

                setTimeout(() => {
                    console.log('clearing out');
                    this.current = null;
                    this.checkQueue();
                }, this.ANIMATION_WAIT_TIME);
            }, this.current.duration);
        }
    }

    public close(): void {
        if (this.lastTimer) {
            clearInterval(this.lastTimer);
        }

        this.current = null;
    }
}