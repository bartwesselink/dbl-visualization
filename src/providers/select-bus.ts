import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {Node} from '../models/node';

@Injectable()
export class SelectBus {
    /** @author Bart Wesselink */
    private nodeSelectedSubject: Subject<Node> = new Subject<Node>();
    public nodeSelected: Observable<Node> = this.nodeSelectedSubject.asObservable();

    public selectNode(node: Node) {
        this.nodeSelectedSubject.next(node);
    }
    /** @end-author Bart Wesselink */
}