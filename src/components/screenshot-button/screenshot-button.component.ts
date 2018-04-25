import {Component, ElementRef, Input} from '@angular/core';

@Component({
    selector: 'app-screenshot-button',
    templateUrl: './screenshot-button.component.html',
})
export class ScreenshotButtonComponent {
    /** @author Bart Wesselink */
    private static readonly FILE_FORMAT = 'png';

    @Input() private canvas: any;

    public capture(): void {
        const dataUrl: string = this.canvas.toDataURL('image/' + ScreenshotButtonComponent.FILE_FORMAT);

        // create temporary link to download
        const link = document.createElement('a');
        link.setAttribute('download', this.getFileName());
        link.setAttribute('href', dataUrl);

        document.body.appendChild(link);

        // click link to create a 'save' dialog
        link.click();

        // immediately remove link
        link.remove();
    }

    private getFileName(): string {
        return 'screenshot-' + (new Date().toISOString()) + '.' + ScreenshotButtonComponent.FILE_FORMAT;
    }
    /** @end-author Bart Wesselink */
}
