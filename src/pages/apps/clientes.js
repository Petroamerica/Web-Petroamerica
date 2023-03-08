import React, { Component } from 'react'
import { Button, Form, Modal, Spinner } from 'react-bootstrap'
import swal from 'sweetalert'
import Header from '../../components/header/header'
import ComponentDescarga from './ComponentDescarga'

import { config } from '../../config/config'
import { app } from '../../config/app'
import { apis } from "../../api/apis"

export default class clientes extends Component {

    state={
        user:'',
        token: '',
        estadoModal: false,
        pwd: ''
    }

    async componentDidMount(){
        const {user, token} = config.obtenerLocalStorage()
        if(user && token){
            this.setState({user, token})
        }else{
            await swal("Mensaje", "Tiempo de acceso finalizado. Volver a iniciar sesión" ,"error")
            config.cerrarSesion()
            this.props.accederLogin(false)
            return
        }

    }

    cerrarModal = () => this.setState({estadoModal: false})

    abrirModal = () => {
        this.setState({pwd: ''})
        this.setState({estadoModal: true})
    }

    ingresarPwd = (text) => {
        this.setState({pwd: text.target.value})
    }

    descargar = async () => {
        this.setState({estadoDescargar: true})
        if(!this.state.pwd){
            await swal("Mensaje", "Debe ingresar una contraseña" ,"warning")
            this.setState({estadoDescargar: false})
            return
        }
        const {res} = await apis.validarUsuario(this.state.token, {id_usuario: this.state.user, Pass_word:this.state.pwd})
        if(res !== 200){
            await swal("Mensaje", "Credenciales incorrectas" ,"error")
            this.setState({estadoDescargar: false})
            return
        }
        const appC = app.appClientes.apk
        setTimeout(() => {
            app.convertirAppDescarga(appC, 'appClientes')
            this.cerrarModal()
            this.setState({pwd:''})
            swal("Mensaje", "Ahora debe instalar el app en su dispositivo" ,"success")
            this.setState({estadoDescargar: false})
        }, 1000);
    }

    render() {
        const {accederLogin} = this.props
        return (
            <>
                <Header nombre={this.state.user} accederLogin={accederLogin}/>
                <ComponentDescarga 
                    versionDescarga={app.appClientes.version}
                    fecha={app.appClientes.fecha}
                    tipoApp= 'Clientes'
                    abrirModal={this.abrirModal}/> 
-
                <Modal
                    show={this.state.estadoModal}
                    onHide={this.cerrarModal}
                    keyboard={false}
                    centered
                >
                    <Modal.Header closeButton>
                        <Modal.Title>Validar Usuario</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div style={{marginBottom:10}}>
                            <span style={{color:'red'}}>*Autenticarse nuevamente para el registro de descargar.*</span>
                        </div>
                        <Form.Group className="mb-3" controlId="exampleForm.user">
                                <Form.Label htmlFor="exampleForm.user">Usuario</Form.Label>
                                <Form.Control value={this.state.user} style={{resize: 'none'}} disabled/>
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                            <Form.Label htmlFor="exampleForm.ControlTextarea1">Contraseña</Form.Label>
                            <Form.Control placeholder='****' type='password' name='pwd' value={this.state.pwd} onChange={this.ingresarPwd} style={{resize: 'none'}}/>
                        </Form.Group>
                        <Button style={{background:'#2193b0', border:'1px solid #2193b0'}} type="button" onClick={this.descargar} >  
                            {
                                (this.state.estadoDescargar)
                                    ?   <Spinner animation="border" variant="light" style={{width:'1em', height:'1em'}}/>
                                    :   "Descargar"
                            }   
                        </Button> 
                    </Modal.Body>
                </Modal>

            </>
        )
    }
}
