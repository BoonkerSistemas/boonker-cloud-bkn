import { NgFor, NgIf } from '@angular/common';
import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import {
    FormsModule,
    NgForm,
    ReactiveFormsModule,
    UntypedFormBuilder,
    UntypedFormGroup,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { fuseAnimations } from '@fuse/animations';
import { FuseAlertComponent, FuseAlertType } from '@fuse/components/alert';
import { AuthService } from 'app/core/auth/auth.service';
import { user as userData } from 'app/mock-api/common/user/data';

@Component({
    selector: 'auth-sign-in',
    templateUrl: './sign-in.component.html',
    encapsulation: ViewEncapsulation.None,
    animations: fuseAnimations,
    standalone: true,
    imports: [
        RouterLink,
        FuseAlertComponent,
        NgIf,
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatIconModule,
        MatCheckboxModule,
        MatProgressSpinnerModule,
        NgFor,
    ],
})
export class AuthSignInComponent implements OnInit {
    @ViewChild('signInNgForm') signInNgForm: NgForm;

    alert: { type: FuseAlertType; message: string } = {
        type: 'success',
        message: '',
    };
    signInForm: UntypedFormGroup;
    showAlert: boolean = false;
    arrayImages = [];
    private _user: any = userData;
    private rutaFull = ['/academy'];
    private rutaClient = ['/proyectos/full'];

    /**
     * Constructor
     */
    constructor(
        private _activatedRoute: ActivatedRoute,
        private _authService: AuthService,
        private _formBuilder: UntypedFormBuilder,
        private _router: Router
    ) {
        let numbers: any = [
            '1',
            '2',
            '3',
            '4',
            '5',
            '6',
            '7',
            '8',
            '9',
            '10',
            '11',
            '12',
            '13',
            '14',
            '15',
            '16',
            '17',
        ];
        //un array para guardar los 5 elementos aleatorios
        for (let i = 0; i < 12; i++) {
            //5: necesito 5 números
            let n = ~~(Math.random() * numbers.length);
            // ponlo en el nuevo array
            this.arrayImages.push(numbers[n]);
            // bórralo de numbers
            numbers.splice(numbers[n], 1);
        }
        console.log(this.arrayImages);
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Lifecycle hooks
    // -----------------------------------------------------------------------------------------------------

    /**
     * On init
     */
    ngOnInit(): void {
        // Create the form
        this.signInForm = this._formBuilder.group({
            username: ['1723358907', [Validators.required]],
            password: ['1723358907', Validators.required],
        });
    }

    // -----------------------------------------------------------------------------------------------------
    // @ Public methods
    // -----------------------------------------------------------------------------------------------------
    random_text: string = 'Los mejores proyectos se construyen con Boonker';

    /**
     * Sign in
     */
    signIn(): void {
        // Return if the form is invalid
        if (this.signInForm.invalid) {
            return;
        }

        // Disable the form
        this.signInForm.disable();

        // Hide the alert
        this.showAlert = false;

        // Sign in
        this._authService.signIn(this.signInForm.value).subscribe(
            async (estaAutenticado) => {
                if (estaAutenticado) {
                    if (this._authService.sessionDto) {
                        await this.llenarDatosUser();
                    }
                }
            },

            (response) => {
                // Re-enable the form
                this.signInForm.enable();

                // Reset the form
                this.signInNgForm.resetForm();

                // Set the alert
                this.alert = {
                    type: 'error',
                    message: 'Credenciales incorrectas',
                };

                // Show the alert
                this.showAlert = true;
            }
        );
    }

    llenarDatosUser(): any {
        console.log(this._authService.sessionDto.user);

        this._user.email = this._authService.sessionDto.user.email;
        this._user.nombre = this._authService.sessionDto.user.nombre;
        this._user.nickname = this._authService.sessionDto.user.nickname;
        this._user.cedula = this._authService.sessionDto.user.cedula;
        this._user.avatar = this._authService.sessionDto.user.linkpicture;
        this._user.status = 'online';
        this._user.apellido = this._authService.sessionDto.user.apellido;
        this._user.numeroContacto =
            this._authService.sessionDto.user.numeroContacto;
        this._user.direccion = this._authService.sessionDto.user.direccion;
        this._user.fechaNacimiento =
            this._authService.sessionDto.user.fechaNacimiento;
        this._user.id = this._authService.sessionDto.user.id;
        if (this._authService.sessionDto.user.role === 'Cliente') {
            this._router.navigate(this.rutaClient);
        } else {
            this._router.navigate(this.rutaFull);
        }
    }
}
