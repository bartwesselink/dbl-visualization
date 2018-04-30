import {Component, ElementRef, Input} from '@angular/core';

@Component({
  selector: 'app-upload-tool',
  templateUrl: './upload-tool.component.html',
})
export class UploadToolComponent {
  /** @author Mathijs Boezer */
  public uploadFile() :void {
    var fileSelector: any = document.getElementById('fileSelector');
    var file: File = fileSelector.files[0];

    var fileReader: FileReader = new FileReader();
    // Create callback for the file reader
    fileReader.onload = function(e){
      var content: string = fileReader.result;
      console.log("Placeholder action for the file content.\n" + content);
      //TODO replace this with something that passes the content to the data processing component
    }

    fileReader.readAsText(file); // Start reading
  }
  /** @end-author Mathijs Boezer */
}
