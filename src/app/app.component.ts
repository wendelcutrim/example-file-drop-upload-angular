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
import { BehaviorSubject, Observable } from 'rxjs';

export interface ArquivosUpload {
    name: string;
    file: File;
    base64?: string;
    hexFile?: string;
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

        Object.keys(files).forEach((file, i) => {
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
                console.log('emitedFileErrors: ', this.fileErrors);
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
                console.log('emitedFileErrors: ', this.fileErrors);
            } else {
                sizeOk = true;
            }

            if (formatOk && sizeOk) {
                this.convertToBase64(files[i]).subscribe({
                    next: (base64) => {
                        if (base64 !== null && base64.length) {
                            this.files.push({
                                name: files[i].name,
                                file: files[i],
                                base64: base64,
                                hexFile: this.convertBase64ToHexa(base64),
                            });
                        }

                        this.emitFileList();
                        console.log('emitedFiles: ', this.files);
                    },
                    error: (err) =>
                        console.error('[ERROR]: convertToBase64', err),
                });
            } else {
                console.error('seletectedFiles error', {
                    formatOk,
                    sizeOk,
                });
            }
        });
    }

    convertToBase64(file: File): Observable<string | null> {
        const reader = new FileReader();
        const result = new BehaviorSubject<string | null>(null);
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64Str = reader.result;

            if (base64Str) {
                result.next(base64Str.toString());
                result.complete();
            }
        };

        return result.asObservable();
    }

    convertBase64ToHexa(base64: string): string {
        const base64Str = base64.split(',')[1];
        // console.log(base64Str);

        const raw = atob(base64Str);
        let result = '';

        for (let i = 0; i < raw.length; i++) {
            const hex = raw.charCodeAt(i).toString(16);
            result += hex.length === 2 ? hex : '0' + hex;
        }
        return result.toUpperCase();
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
