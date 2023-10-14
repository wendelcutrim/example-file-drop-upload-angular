import {
    Component,
    ElementRef,
    EventEmitter,
    Input,
    OnChanges,
    Output,
    SimpleChanges,
    ViewChild,
} from '@angular/core';

export interface ArquivosUpload {
    name: string;
    file: File;
    base64?: string;
}

export interface ArquivosMsgError {
    filename: string;
    maxFileSizeMb?: number;
    allowedFormats?: string;
    initialMessage: string;
    lastMessage: string;
    typeError: 'size' | 'format';
}

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnChanges {
    title = 'test-file-reader';
    @ViewChild('inputFile') inputFile!: ElementRef<HTMLInputElement>;
    @Output() fileList = new EventEmitter<ArquivosUpload[]>();
    @Output() fileListError = new EventEmitter<ArquivosMsgError[]>();

    @Input() maxFileSizeMb: number = 10;
    @Input() allowerdFormats: string[] = [
        'image/jpeg',
        'image/png',
        'application/pdf',
    ];
    @Input() allowedFormatsNames: string = 'jpg, png, pdf'.toUpperCase();
    @Input() clearFileErrors: boolean = false;

    files: ArquivosUpload[] = [];
    fileErrors: ArquivosMsgError[] = [];

    ngOnChanges(changes: SimpleChanges) {
        if (changes['clearFileErrors']) {
            this.handleClearFileErrors(changes['clearFileErrors'].currentValue);
        }
    }

    openFileSelector() {
        this.inputFile.nativeElement.click();
    }

    onChangeInputFile(event: Event) {
        const target = event.target as HTMLInputElement;
        const files = target.files;

        files && this.selectedFiles(files);
    }

    selectedFiles(files: FileList) {
        console.log('receveid files: ', files);
        console.log('typeof files: ', typeof files);

        for (let i = 0; i < files.length; i++) {
            let formatOk: boolean = false;
            let sizeOk: boolean = false;
            const verifyFormat = this.verifyFileFormat(files[i]);
            const verifyFileSizeMb = this.verifyFileSizeMb(files[i]);

            if (!verifyFormat) {
                this.fileErrors.push({
                    filename: files[i].name,
                    allowedFormats: this.allowedFormatsNames,
                    initialMessage: 'O arquivo',
                    lastMessage:
                        'não foi enviado porque o formato é diferente de',
                    typeError: 'format',
                });

                formatOk = false;

                this.emitFileListError();
            } else {
                formatOk = true;
            }

            if (!verifyFileSizeMb) {
                this.fileErrors.push({
                    filename: files[i].name,
                    maxFileSizeMb: this.maxFileSizeMb,
                    initialMessage: 'O arquivo',
                    lastMessage: 'não foi enviado porque o tamanho ultrapassou',
                    typeError: 'size',
                });

                sizeOk = false;
                this.emitFileListError();
            } else {
                sizeOk = true;
            }

            if (formatOk && sizeOk) {
                console.log('verifyFormat: ', verifyFormat);
                console.log('verifySize: ', verifyFileSizeMb);

                this.files.push({
                    name: files[i].name,
                    file: files[i],
                });

                this.emitFileList();
            } else {
                console.error('seletectedFiles error', {
                    formatOk,
                    sizeOk,
                });
            }
        }
    }

    verifyFileSizeMb(file: File): boolean {
        return file.size <= this.maxFileSizeMb * 1024 * 1024;
    }

    verifyFileFormat(file: File): boolean {
        return this.allowerdFormats.includes(file.type);
    }

    emitFileList() {
        this.fileList.emit(this.files);
    }

    emitFileListError() {
        this.fileListError.emit(this.fileErrors);
    }

    handleClearFileErrors(clear: boolean) {
        if (clear) {
            this.clearFileErrors = false;
            this.fileErrors = [];
        } else {
            this.clearFileErrors = true;
            this.fileErrors = this.fileErrors;
        }
    }
}
