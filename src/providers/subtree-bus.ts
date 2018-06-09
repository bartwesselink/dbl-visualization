import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Subject} from 'rxjs/Subject';
import {Node} from '../models/node';

@Injectable()
export class SubtreeBus {
    /** @author Mathijs Boezer */
    private subtreeSelectedSubject: Subject<Node> = new Subject<Node>();
    public subtreeSelected: Observable<Node> = this.subtreeSelectedSubject.asObservable();

    public openSubtree(node: Node) {
        this.subtreeSelectedSubject.next(node);
    }
    /** @end-author Mathijs Boezer */
}
