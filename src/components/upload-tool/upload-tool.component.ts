import {Component, EventEmitter, Output} from '@angular/core';

@Component({
  selector: 'app-upload-tool',
  templateUrl: './upload-tool.component.html',
})
export class UploadToolComponent {
  /** @author Mathijs Boezer */
  @Output() newContent: EventEmitter<string> = new EventEmitter();

  public uploadFile() :void {
    var fileSelector: any = document.getElementById('fileSelector');
    var file: File = fileSelector.files[0];

    var fileReader: FileReader = new FileReader();
    var self = this; // Get reference to this
    // Create callback for the file reader
    fileReader.onload = function(e){
      var content: string = fileReader.result;
      self.newContent.emit(content);
    }

    fileReader.readAsText(file); // Start reading
  }
  /** @end-author Mathijs Boezer */
}
