import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {SnackbarOptions} from '../interfaces/snackbar-options';

@Injectable()
export class SnackbarBus {
    /** @author Bart Wesselink */
    private snackbarSubject: Subject<SnackbarOptions> = new Subject<SnackbarOptions>();
    public sent: Observable<SnackbarOptions> = this.snackbarSubject.asObservable();

    public send(snackbar: SnackbarOptions) {
        this.snackbarSubject.next(snackbar);
    }
    /** @end-author Bart Wesselink */
}
