import React, { Component } from 'react';

import {Container, Form, Button, Spinner} from 'react-bootstrap'
import '../styles.css'
import swal from 'sweetalert'
import {config} from '../../config/config'
import {apis} from '../../api/apis'
import logo_petroamerica from '../../img/LogoPetroamerica.png'

export default class login extends Component {

  state = {
    acceso: {
      user: '',
      pass: ''
    },
    estado_campos:{
      user: false,
      pass:false
    },
    estadoAcceder: true
  }

  acceder = async (e) =>{
    e.preventDefault()
    let login = this.state.acceso
    if(login.user === ""){
      this.setState({estado_campos: {...this.state.estado_campos, user: true, pass: false}})
      return
    }else if(login.pass === ""){  
      this.setState({estado_campos: {...this.state.estado_campos, user: false, pass: true}})
      return
    }
    this.setState({estado_campos: { user: false, pass:false }, estadoAcceder: false})
    const peticion = await apis.login({"id_usuario": login.user, "Pass_word": login.pass})
    if(peticion.error){
      this.setState({estadoAcceder: true})
      await swal("Mensaje",peticion.error, "error")  
      return
    }

    if(peticion.status){
      this.setState({estadoAcceder: true})
      await swal("Mensaje","Las credenciales son incorrectas.", "error") 
      return
    }

    this.setState({estadoAcceder: true})
    config.iniciarSesion(peticion.token, login.user, peticion.usuario_externo)
    await swal("Mensaje","Acceso correcto.", "success")
    this.props.accederLogin(true)
  }

  ingresarDatos = text => { 
      this.setState({ acceso: {...this.state.acceso, [text.target.name]: text.target.value} }) 
  }

  render() {
    return (
      <div className='fondo'>
                      
      <Container className='login_form'>
          <div className='login_logo'>
            <img src={logo_petroamerica} width="200" alt="logo"/>
          </div>
          <Form onSubmit={this.acceder} method="POST" style={{marginBottom:20, padding:20}}>

            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label style={{color:'white'}}>Usuario</Form.Label>
              <Form.Control type="text" 
                autoComplete="off"
                placeholder="ingrese un usuario"
                name='user' 
                onChange={this.ingresarDatos} 
                isInvalid={this.state.estado_campos.user} />
            </Form.Group>

            <Form.Group className="mb-3" controlId="formBasicPassword">
              <Form.Label style={{color:'white'}}>Contraseña</Form.Label>
              <Form.Control type="password" 
                placeholder="**************" 
                name='pass' 
                onChange={this.ingresarDatos} 
                isInvalid={this.state.estado_campos.pass} />
              <Form.Text style={{color:'white'}}> La contraseña es unica para cada responsable. </Form.Text>
            </Form.Group>
            <Button variant="primary" type="submit"> 
            {
              this.state.estadoAcceder ? 
              <>Acceder</>
              :
              <Spinner animation="border" variant="light" style={{width:'1em', height:'1em'}}/>
            }
            </Button>

          </Form>
        </Container>

         </div>
      )
  }

}
