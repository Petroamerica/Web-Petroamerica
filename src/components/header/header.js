import React, { Component } from 'react'
import {Navbar, Container, Nav, NavDropdown} from 'react-bootstrap'
import {NavLink} from 'react-router-dom'
import '../styles.css'
import {config} from '../../config/config'
import logo_petroamerica from '../../img/LogoPetroamerica.png'
import cerrarSesion from '../../img/cerrarSesion.png'
import iconUser from '../../img/iconUser.png'

export default class header extends Component {

    render() {
      const {nombre} = this.props
      const {accederLogin} = this.props
        return (
            <Navbar className='reporte_navbar' expand="lg">
                <Container fluid>
                <Navbar.Brand href="/" style={{color:'white'}}><img src={logo_petroamerica} width="35" alt="logo" />Petroamerica</Navbar.Brand>
                <Navbar.Toggle aria-controls="navbarScroll" />
                <Navbar.Collapse id="navbarScroll">
                    <Nav className="me-auto my-2 my-lg-0" style={{ maxHeight: '200px'}} navbarScroll >
                        {/* <NavLink to="/reporteEESS" style={{color:'white', textDecoration:'none'}}>Reporte Venta EESS</NavLink>
                        <NavLink to="/reporteTemperatura" style={{color:'white', textDecoration:'none', marginLeft:'1rem'}}>Repote Volumetrico</NavLink> */}
                        <NavDropdown title="Administración" id="basic-nav-dropdown" className='listaDesplegable mx-2'>
                            {/* <NavDropdown.Item href="#action/3.1">Venta EESS</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.2">Volumetrico</NavDropdown.Item> */}
                        </NavDropdown>
                        <NavDropdown title="Mantenimiento" id="basic-nav-dropdown" className='listaDesplegable mx-2'>
                            {/* <NavDropdown.Item href="#action/3.1">Venta EESS</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.2">Volumetrico</NavDropdown.Item> */}
                        </NavDropdown>
                        <NavDropdown title="Transacciones" id="basic-nav-dropdown" className='listaDesplegable mx-2'>
                            {/* <NavDropdown.Item href="#action/3.1">Venta EESS</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.2">Volumetrico</NavDropdown.Item> */}
                        </NavDropdown>
                        <NavDropdown title="Consultas" id="basic-nav-dropdown" className='listaDesplegable mx-2'>
                            <NavLink to="/ConsultaVolumetrico" className="dropdown-item" style={{color:'#212529', textDecoration:'none'}}>Volumetrico</NavLink>
                            {/* <NavDropdown.Item href="#action/3.1">Venta EESS</NavDropdown.Item>
                            <NavDropdown.Item href="#action/3.2">Volumetrico</NavDropdown.Item> */}
                        </NavDropdown>
                        <NavDropdown title="Procesos" id="basic-nav-dropdown" className='listaDesplegable mx-2'>
                            {
                                //DESENCRIPTAR TIPO DE USUARIO 
                                (atob(localStorage.getItem('type')) === '0')
                                    ?   <NavLink to="/ProcesoVentaEESS" className="dropdown-item" style={{color:'#212529', textDecoration:'none'}}>Validar Compras a HidroMundo</NavLink> 
                                    :   null
                            }
                            {/* <NavDropdown.Item href="#"> */}
                            {/* </NavDropdown.Item> */}
                            {/* <NavDropdown.Item href="#action/3.2"> */}
                                <NavLink to="/ProcesoVolumetrico" className="dropdown-item" style={{color:'#212529', textDecoration:'none'}}>Registro Volumetrico</NavLink>
                            {/* </NavDropdown.Item> */}
                                {/*  Carga de Descuentos */}
                                <NavLink to="/cargaDsctoseepp" className="dropdown-item" style={{color:'#212529', textDecoration:'none'}}>Carga Descuentos EEPP</NavLink>

                                <NavLink to="/match" className="dropdown-item" style={{color:'#212529', textDecoration:'none'}}>Match</NavLink>
                                {/*  Lista de Precios */}
                                {/* <NavLink to="/listaPrecios" className="dropdown-item" style={{color:'#212529', textDecoration:'none'}}>Lista de Precios</NavLink> */}
                        </NavDropdown>
                        <NavDropdown title="App's" id="basic-nav-dropdown" className='listaDesplegable mx-2'>
                            <NavLink to="/appTransacciones" className="dropdown-item" style={{color:'#212529', textDecoration:'none'}}>App Transacciones</NavLink>
                            <NavLink to="/appClientes" className="dropdown-item" style={{color:'#212529', textDecoration:'none'}}>App Clientes</NavLink>
                        </NavDropdown>
                    </Nav>
                    <Nav className="justify-content-end" activeKey="/">
                        <Nav.Item>
                            <NavLink to="#" style={{color:'white', textDecoration:'none'}}><img src={iconUser} width="25" alt="icon"/> Usuario: {nombre} </NavLink>
                            <NavLink to="#" onClick={()=>{config.cerrarSesionSalir(); accederLogin(false)}} style={{color:'white', textDecoration:'none', marginLeft:'1rem'}}><img src={cerrarSesion} width="25" alt="icon"/> Salir</NavLink>
                        </Nav.Item>
                    </Nav>
                </Navbar.Collapse>
                </Container>
            </Navbar>
        )
  }
}
