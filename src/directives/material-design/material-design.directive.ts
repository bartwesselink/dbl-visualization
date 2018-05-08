import {Directive, Input, OnInit} from '@angular/core';
declare var componentHandler: any;

@Directive({
    selector: '[mdl]',
})
export class MdlDirective implements OnInit {
    /** @author Bart Wesselink */
    @Input() private mdl;

    constructor() {
    }

    ngOnInit(): void {
        setTimeout(() => {
            componentHandler.upgradeDom();
        });
    }
    /** @end-author Bart Wesselink */
}