import React, { Component } from 'react'
import { Button } from 'react-bootstrap'
import download from '../../img/download.png'

export default class ComponentDescarga extends Component {

    render() {
        const {versionDescarga, abrirModal, tipoApp, fecha} = this.props
        return (
            <>
                <div style={{marginTop:40}}>
                    <h1 style={{textAlign:'center'}}>Nueva Versión {versionDescarga}</h1>
                    <h4 style={{textAlign:'center'}}>{fecha}</h4>
                </div>
                <div style={{display:'flex', justifyContent:'center', marginTop:20, flexDirection:'column', alignItems:'center'}}>
                    <div>
                        <Button variant="outline-primary" size='lg' onClick={abrirModal}>
                            <img src={download} alt="descargar" width={20}/> 
                            {' '}Descargar App {tipoApp}
                        </Button>
                    </div>
                    <span style={{color:'grey', fontSize:'0.9em'}}>De preferencia descargarlo desde tu celular.</span>
                </div>
            </>
        )
    }
}
