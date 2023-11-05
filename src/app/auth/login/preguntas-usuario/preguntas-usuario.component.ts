import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Preguntas_Usuario } from 'src/app/interfaces/seguridad/preguntasUsuario';
import { Usuario } from 'src/app/interfaces/seguridad/usuario';
import { PreguntasUsuarioService } from 'src/app/services/seguridad/preguntas-usuario.service';
import { UsuariosService } from 'src/app/services/seguridad/usuarios.service';

@Component({
  selector: 'app-preguntas-usuario',
  templateUrl: './preguntas-usuario.component.html',
  styleUrls: ['./preguntas-usuario.component.css']
})
export class PreguntasUsuarioComponent implements OnInit {

  securityForm: FormGroup;
  preguntasRespuestas: any[] = []
  id_usuario: any;
  usuario: Usuario | any = {};
  validador: boolean = false;

  constructor(
    private fb: FormBuilder,
    private _preguntasUsuario: PreguntasUsuarioService,
    private router: Router,
    private _usuarioService: UsuariosService
    ){
      this.securityForm = this.fb.group({});
  }

  ngOnInit(): void {
    this.getUsuario();
  }

  getUsuario() {
    if (this._usuarioService.usuario) {
      this.usuario = this._usuarioService.usuario;
      this.getId_Usuario(this.usuario);
    }else{
      this.router.navigate(['/metodo']);
    }
  }

  getId_Usuario(usuario: Usuario){
    this._usuarioService.getUsuario(usuario).subscribe((data) => {
      this.id_usuario = data;
      this.obtenerPreguntas(this.id_usuario);
    });
  }

  obtenerPreguntas(id_usuario: Preguntas_Usuario){
    // Llama al servicio para obtener las preguntas y respuestas desde la API
    console.log(id_usuario.id_usuario);
    this._preguntasUsuario.preguntasRespuestas(id_usuario.id_usuario).subscribe((data) => {
      this.preguntasRespuestas = data;
      this.crearFormulario();
    });
  }

  crearFormulario() {
    const formGroup: { [key: string]: any } = {}; // Declaración explícita del tipo de formGroup
  
    for (const item of this.preguntasRespuestas) {
      formGroup[item.id_pregunta] = [
        '', // Valor inicial del campo de respuesta
        Validators.required, // Validador requerido
      ];
    }
    this.securityForm = this.fb.group(formGroup);
  }

  onSubmit() {

    const respuestasUsuario = this.securityForm.value;

    for (const key of Object.keys(respuestasUsuario)) {
      const respuesta = respuestasUsuario[key];
      console.log(`Pregunta ${key}: ${respuesta}`);
      
    }

    
    if (this.securityForm.valid) {
      // Recopila las respuestas del usuario y compáralas con las de la API

      for (const item of this.preguntasRespuestas) {

        const respuestaUsuario = respuestasUsuario[item.id_pregunta]; 
        //console.log('id_preguntas_usuario => '+ item.id_preguntas_usuario)
        //console.log('Respuesta de usuario => '+ respuestaUsuario)

        const body: Preguntas_Usuario = {
          id_preguntas_usuario: item.id_preguntas_usuario,
          id_pregunta: 0,
          id_usuario: 0,
          respuesta: respuestaUsuario,
          creado_por: '',
          fecha_creacion: new Date(),
          modificado_por: '',
          fecha_modificacion: new Date()
        };

        this._preguntasUsuario.validarRespuesta(body).subscribe((data) => {
          if(data){
            this.validador = true
            console.log(data);
            console.log('Respuesta correcta');
          }
          else{
          console.log(data);
          this.validador = false
          console.log('respuesta incorrecta');
          }
        },
        (error) => {
          console.error('Error al validar respuesta:', error);
        }
        );

      }
      if(this.validador){
        this.navigateRecuperar();
      }
      
    }
  }
  navigateRecuperar(){
    this.router.navigate(['/recuperar'])
  }
}
