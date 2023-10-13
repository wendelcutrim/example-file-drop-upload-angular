import {
    Directive,
    EventEmitter,
    HostBinding,
    HostListener,
    Output,
} from '@angular/core';

@Directive({
    selector: '[appDrop]',
})
export class DropDirective {
    @Output() fileDropped = new EventEmitter();

    @HostBinding('class.fileover') fileOver: boolean = false;

    @HostListener('dragover', ['$event']) onDragOver(evt: DragEvent) {
        evt.preventDefault();
        evt.stopPropagation();
        this.fileOver = true;
    }

    @HostListener('dragleave', ['$event']) onDragLeave(evt: DragEvent) {
        evt.preventDefault();
        evt.stopPropagation();
        this.fileOver = false;
    }

    @HostListener('drop', ['$event']) ondrop(evt: DragEvent) {
        evt.preventDefault();
        evt.stopPropagation();
        this.fileOver = false;
        const files = evt.dataTransfer?.files;

        //Todo: Verificar esse if
        if (files && files.length > 0) {
            this.fileDropped.emit(files);
        }

        // this.fileDropped.emit(files);
    }
}
