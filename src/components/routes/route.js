import React, { Component } from 'react';
import { BrowserRouter, Route, Routes, Navigate  } from "react-router-dom";
import Cookies from 'universal-cookie'
import Login from '../../pages/login/login'
import Inicio from '../../pages/inicio'
// Procesos
import VentaEESS from '../../pages/procesos/ventaEESS'
import Volumetrico from '../../pages/procesos/volumetrico';

//Reportes
// import CVolumetrico from '../components/view/consultas/volumetrico';
import CVolumetrico from '../../pages/consultas/volumetrico';

//Apps
import AClientes from '../../pages/apps/clientes';
import ATransacciones from '../../pages/apps/transacciones';
import CargaDsctoEepp from '../../pages/procesos/CargaDsctosEEPP';
import ListaPrecios from '../../pages/procesos/ListaPrecios';
import Match from '../../pages/procesos/Match';

const cookies = new Cookies()

export default class route extends Component {

    state ={
        estadoToken: false
    }

    accederLogin = (estadoToken) =>{
        this.setState({estadoToken})
    }

  render() {
    return (
        <BrowserRouter>
            <Routes>
                {
                    !this.state.estadoToken && !cookies.get('status')
                        ?   <Route path="/" element={<Login accederLogin={this.accederLogin}/>}/>
                        :   
                        <>
                            <Route path="/" element={<Inicio accederLogin={this.accederLogin}/>}/>
                            {
                                (atob(localStorage.getItem('type')) === '0')
                                    ?   <Route path="/ProcesoVentaEESS" element={ <VentaEESS accederLogin={this.accederLogin}/>}/>
                                    :   null
                            }
                            <Route path="/ProcesoVolumetrico" element={ <Volumetrico accederLogin={this.accederLogin}/>}/>
                            <Route path="/ConsultaVolumetrico" element={ <CVolumetrico accederLogin={this.accederLogin}/>}/>

                            <Route path="/appClientes" element={ <AClientes accederLogin={this.accederLogin}/>}/>
                            <Route path="/appTransacciones" element={ <ATransacciones accederLogin={this.accederLogin}/>}/>

                            <Route path="/cargaDsctoseepp" element={ <CargaDsctoEepp accederLogin={this.accederLogin}/>}/>

                            <Route path="/match" element={ <Match accederLogin={this.accederLogin}/>}/>

                            <Route path="/listaPrecios" element={ <ListaPrecios accederLogin={this.accederLogin}/>}/>
                            
                            <Route path="*" element={<Inicio to="/" replace />} />
                        </>
                }
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    )
  }
}
