import React, { Component } from 'react'
import { Form, Button, Col, Row, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap'
import moment from 'moment'
import swal from 'sweetalert'
import Header from '../../components/header/header'
import {config} from '../../config/config'
import { Volumetrico } from '../../components/viewComponents/Volumetrico'
import {apis} from '../../api/apis'
import iconSearch from '../../img/iconSearch.png'
import iconExcel from '../../img/excel.png'
import { exportar } from '../../config/reports'

export default class volumetrico extends Component {
    state={
        user: '',
        token: '',
        nombre_proveedor:'',
        cantidad_doc:0,
        buscador:'',
        comentarioDoc: '',
        filtro:{
          fecha_i: moment().format('YYYY-MM-DD'),
          fecha_ii: moment().format('YYYY-MM-DD'),
          planta: '',
          proveedor: '',
          tipo:'-'
        },
        filtroValido:{
            fecha_i: moment().format('YYYY-MM-DD'),
            fecha_ii: moment().format('YYYY-MM-DD'),
            planta: '',
            proveedor: '',
            tipo:'-'
        },
        estadoFiltro:{
            planta:'',
            proveedor:''
        },
        estadoBotones:{
          excel:true
        },
        plantas:[],
        proveedores:[],
        documentos:[],
        estado_modal: false,
        estado_carga: false,
        cantidadVolumProv: 0,
        cantidadTotalVolumetrico: 0
    }

    async componentDidMount(){
        const {user, token} = config.obtenerLocalStorage()
        if(user && token){
            this.setState({user, token})
        }else{
            await swal("Mensaje", "No se encontraron las credenciales para acceder a la web 'REGISTRO DE VOLUMETRICO' .\nSalir y volver a ingresar." ,"error")
            return
        }
        const plantas = await apis.planta(token, '06', user)
        if(plantas.error){
            if(!config.validarCookies()){
                await swal("Mensaje", "Tiempo de sesión culminado.", "error")
                config.cerrarSesion()
                this.props.accederLogin(false)
                return
            }
            await swal("Mensaje",plantas.error , "error")
            return
        }
        plantas.unshift({id_planta: 'todos', descripcion: 'TODOS'})
        this.setState({plantas})
    }

    ingresarDatos = async (text) => {
        this.setState({ filtro: {...this.state.filtro, [text.target.name]: text.target.value} })
        setTimeout(async() => {
            if(text.target.name !== 'proveedor' && this.state.filtro.planta !== ''){
                const proveedores = await apis.proveedor(
                    this.state.token, 
                    '06', 
                    this.state.filtro.fecha_i, 
                    this.state.filtro.fecha_ii, 
                    this.state.filtro.tipo,
                    this.state.filtro.planta,
                    this.state.user
                )
                if(proveedores.error){
                    if(!config.validarCookies()){
                        await swal("Mensaje", "Tiempo de sesión culminado.", "error")
                        config.cerrarSesion()
                        this.props.accederLogin(false)
                        return
                    }
                    await swal("Mensaje",proveedores.error , "error")
                    return
                }
                proveedores.unshift({id_proveedor: 'TODOS', descripcion: 'TODOS'})
                this.setState({proveedores})
            }
        }, 250)
    }

    buscar = async (e) =>{
        e.preventDefault()
        this.actualizarEstado()
        let filtro = this.state.filtro
        if(filtro.planta === ''){
            this.setState({estadoFiltro: {...this.state.estadoFiltro, planta:true, proveedor:false}})
            return
        }
        if(filtro.proveedor === ''){
            this.setState({estadoFiltro: {...this.state.estadoFiltro, planta:false, proveedor:true}})
            return
        }
        this.setState({estadoFiltro: { razon_s: false, grifo:false}, estado_carga: true})

        const documentos = await apis.documentosVolumetrico(this.state.token, '06', filtro.fecha_i, filtro.fecha_ii, filtro.tipo, filtro.planta, filtro.proveedor, this.state.user)
        if(documentos.error){
            await swal("Mensaje",documentos.error, "error")
            this.setState({estado_carga: false})
            if( !config.validarCookies()){
                config.cerrarSesion()
                this.props.accederLogin(false)
            }
            return
        }
        if(documentos.length > 0){
          this.setState({estadoBotones:{grabar: false, excel:false}})
        }else{
          this.setState({estadoBotones:{grabar: true, excel:true}})
        }

        const nombre_proveedor = this.state.proveedores.find(element => element.id_proveedor ===  filtro.proveedor).descripcion        
        let arreglo_nroDocumentos = []
        documentos.forEach(value=>{arreglo_nroDocumentos.push(value.nro_documento)})
        let cantidad_doc = [...new Set(arreglo_nroDocumentos)].length
        this.setState({documentos, estado_carga:false, nombre_proveedor, cantidad_doc, filtroValido: filtro})
        this.contarCantidadVolumetricoProv()
        this.contarCantidadVolumetrico()
    }

    
    /*MODAL DE COMENTARIO*/
    abrirEstadoModal = (comentarioDoc) =>{
        this.setState({ comentarioDoc , estado_modal:true }) 
    }
    cerrarEstadoModal = () =>{
        this.setState({estado_modal:false, comentarioDoc: ''})
    }

    /*CONTAR CANTIDAD TOTAL VOLUMETRICO PROV*/
    contarCantidadVolumetricoProv = () =>{
        let cantidadVolumProv = this.state.documentos.reduce((previousValue, currentValue) => parseInt(previousValue || 0) +  parseInt(currentValue.volumetric || 0), 0 );
        this.setState({cantidadVolumProv})
    }
    /*CONTAR CANTIDAD TOTAL VOLUMETRICO*/
    contarCantidadVolumetrico = () =>{
        let cantidadTotalVolumetrico = this.state.documentos.reduce((previousValue, currentValue) => parseInt(previousValue || 0) +  parseInt(currentValue.cantidad_fac || 0), 0 );
        this.setState({cantidadTotalVolumetrico})
    }

    filtrarDatos = text =>{
        let texto = text.target.value
        this.setState({buscador: texto})
    }

    emitirReporteXlsx = () =>{
        exportar.reporteXlsx_Volumetrico(this.state.filtroValido, this.state.documentos, this.state.user, this.state.nombre_proveedor)
    }

    actualizarEstado = () =>{
        this.setState({
            documentos:[],
            nombre_proveedor:'',
            cantidad_doc:0,
            buscador:'',
            comentarioDoc: '',
            estado_modal: false,
            estado_carga: false,
            cantidadVolumProv: 0,
            cantidadTotalVolumetrico: 0,
            filtroValido:{
                fecha_i: moment().format('YYYY-MM-DD'),
                fecha_ii: moment().format('YYYY-MM-DD'),
                planta: '',
                proveedor: '',
                tipo:'-'
            },
            estadoFiltro:{
                planta:'',
                proveedor:''
            },
            estadoBotones:{
              excel:true
            },
        })
    }


    render() {
      const {accederLogin} = this.props
        return (
            <>
                <Header nombre={this.state.user} accederLogin={accederLogin}/>
                <div style={{position:'relative' ,margin:20, boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.15)'}}>
                    <Form onSubmit={this.buscar} method="POST" style={{ display:'flex', flexDirection:'column'}} className="p-3" >
                        <h6>CONSULTA DE VOLUMETRICO</h6>
                        <Form.Group as={Row}>
                            <Form.Group as={Row}  style={{maxWidth:'450px'}}>
                                <Col sm="6">
                                    <Form.Text className="text-muted">Fecha inicial</Form.Text>
                                    <Form.Control type="date" name='fecha_i' onChange={this.ingresarDatos} value={this.state.filtro.fecha_i} style={{fontSize:'0.9rem'}}/>
                                </Col>
                                <Col sm="6">
                                    <Form.Text className="text-muted">Fecha final</Form.Text>
                                    <Form.Control type="date" name='fecha_ii' onChange={this.ingresarDatos} value={this.state.filtro.fecha_ii} style={{fontSize:'0.9rem'}}/>
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row}  style={{maxWidth:'550px'}}>
                                <Col sm="6" style={{maxWidth:'215px'}}>
                                    <Form.Text className="text-muted">Planta</Form.Text>
                                    <Form.Select value={this.state.filtro.planta} name='planta' isInvalid={this.state.estadoFiltro.planta} onChange={this.ingresarDatos} style={{fontSize:'0.9rem'}}>
                                        <option value=''>Seleccionar...</option>
                                        {
                                            this.state.plantas.map(value =>
                                                <option key={value.id_planta} value={value.id_planta}>{value.descripcion}</option>
                                            )
                                        }
                                    </Form.Select>
                                </Col>
                                <Col sm="6" style={{maxWidth:'300px', width:'100%'}}>
                                    <Form.Text className="text-muted">Proveedor</Form.Text>
                                    <Form.Select value={this.state.filtro.proveedor} name='proveedor' isInvalid={this.state.estadoFiltro.proveedor} onChange={this.ingresarDatos} style={{fontSize:'0.9rem'}}>
                                    <option value=''>Seleccionar...</option>
                                        {
                                            this.state.proveedores.map(value =>
                                                <option key={value.id_proveedor} value={value.id_proveedor}>{value.descripcion}</option>
                                            )
                                        }
                                    </Form.Select>
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row}  style={{width:'auto'}}>
                                <Col sm="6" style={{width:'300px'}}>
                                    <Form.Text className="text-muted">Tipo</Form.Text>
                                    <div onChange={this.ingresarDatos} style={{display:'flex', flexDirection:'row', justifyContent:'space-around', border:'1px solid #ced4da', padding: '4.4px', borderRadius:'0.25rem', fontSize:'0.95rem'}}>
                                        <Form.Check
                                            label="Fecha Facturada"
                                            name="tipo"
                                            type="radio"
                                            value="-"
                                            defaultChecked
                                        />
                                        <Form.Check
                                            label="Fecha OE"
                                            name="tipo"
                                            type="radio"
                                            value="oe"
                                        />
                                    </div>
                                </Col>
                            </Form.Group>

                            <Form.Group as={Row}  style={{maxWidth:'120px', flexDirection:'column-reverse', marginLeft:'0px'}}>
                            <Button variant="primary" type="submit" style={{maxWidth:'85px', padding:'0.2rem'}} ><img src={iconSearch} width="14" alt="icon"/> Buscar</Button>
                            </Form.Group>
                        </Form.Group>
                    </Form>
                </div>
                <div style={{marginLeft:20, marginRight:20, marginTop:20, boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.15)', padding:20, display:'flex', flexDirection:'column'}}>
                    <Row>
                        <Col sm={6} className='mb-3' style={{alignSelf:'center'}}>
                          <h6>Proveedor: {this.state.nombre_proveedor}</h6>
                        </Col>
                        <Col sm={6} className='mb-3'>
                            <Row>
                            <Col md="7"></Col>
                            <Col md="5">
                                <div className='d-flex' style={{justifyContent:'space-between'}}>
                                <Form.Control type="text" placeholder="buscar por documento.." onChange={this.filtrarDatos} style={{marginRight:'15px'}}/>
                                <OverlayTrigger
                                    overlay={ <Tooltip id={`tooltip-1`}>Descargar</Tooltip> }
                                >
                                    <Button variant="light" disabled={this.state.estadoBotones.excel} type="button" onClick={()=>this.emitirReporteXlsx()}><img src={iconExcel} alt="descargar" width={20}/></Button>
                                </OverlayTrigger>
                                </div>
                            </Col>
                            </Row>
                        </Col>
                    </Row>
                    <div style={{overflowX:'scroll', width:'100%', maxHeight:'62vh'}}>
                        <Volumetrico 
                            origen = 'reporte'
                            buscador = {this.state.buscador}
                            estado_carga = {this.state.estado_carga}
                            documentos={this.state.documentos} 
                            cantidadVolumProv = {this.state.cantidadVolumProv}
                            cantidadTotalVolumetrico = {this.state.cantidadTotalVolumetrico}
                            abrirEstadoModal = {this.abrirEstadoModal}/>
                    </div>
                    <div className='mt-1' style={{display:'flex', justifyContent:'space-between', flexDirection:'row'}}>
                        <Row>
                            <h6>Total de documentos: {this.state.cantidad_doc}</h6>
                        </Row>
                        <Row>
                            <h6> <label style={{ background: 'rgba(128, 128, 128, 0.16)', width: '20px', height: '20px', borderRadius: '100%' }}></label> Anulados</h6>
                        </Row>
                    </div>
                </div>
                <Modal
                    show={this.state.estado_modal}
                    onHide={this.cerrarEstadoModal}
                    keyboard={false}
                    centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Comentario</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>  
                        <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
                            <Form.Control
                                className='textAreaSinReadOnly'
                                as="textarea" 
                                rows={3} 
                                name='comentario' 
                                readOnly
                                value={this.state.comentarioDoc}/>
                        </Form.Group>
                    </Modal.Body>
                </Modal>
            </>
        )
    }
}
