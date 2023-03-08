import React, { Component } from 'react'
import moment from 'moment'
import swal from 'sweetalert'
import { Form, Button, Col, Row, Spinner, Modal } from 'react-bootstrap'
import Header from '../../components/header/header'
import { Volumetrico } from '../../components/viewComponents/Volumetrico'
import {config} from '../../config/config'
import {apis} from '../../api/apis'
import iconSave from '../../img/iconSave.png'
import iconSearch from '../../img/iconSearch.png'

export default class volumetrico extends Component {

    state={
        user: '',
        token: '',
        plantas:[],
        proveedores: [],
        documentos: [],
        cantidad_doc:0,
        nombre_proveedor:'',
        buscador: '',
        cantidadVolumProv: 0,
        cantidadTotalVolumetrico: 0,
        filtro:{
            fecha_i: moment().format('YYYY-MM-DD'),
            planta: '',
            proveedor: '',
            tipo:'-'
        },
        filtroValido:{
            fecha_i: moment().format('YYYY-MM-DD'),
            planta: '',
            proveedor: '',
            tipo:'-'
        },
        estadoFiltro:{
            planta:'',
            proveedor:''
        },
        estadoBotones:{
          grabar: true
        },
        ingreComentario:{
            comentario:'',
            index: ''
        },
        estado_modal:false,
        estado_carga: false,
        estadoBotonGrabar: true
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
            }
            await swal("Mensaje", plantas.error , "error")
            return
        }
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
                    this.state.filtro.fecha_i, 
                    this.state.filtro.tipo, 
                    this.state.filtro.planta,
                    this.state.user
                )
                if(proveedores.error){
                    if(!config.validarCookies()){
                        await swal("Mensaje", "Tiempo de sesión culminado.", "error")
                        config.cerrarSesion()
                        this.props.accederLogin(false)
                    }
                    await swal("Mensaje",proveedores.error , "error")
                    return
                }
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

        const documentos = await apis.documentosVolumetrico(this.state.token, '06', filtro.fecha_i, filtro.fecha_i, filtro.tipo, filtro.planta, filtro.proveedor, this.state.user)
        if(documentos.error){
            this.setState({estado_carga: false})
            if( !config.validarCookies()){
                await swal("Mensaje", "Tiempo de sesión culminado.", "error")
                config.cerrarSesion()
                this.props.accederLogin(false)
                return
            }
            await swal("Mensaje",documentos.error, "error")
            return
        }

        documentos.map((value)=> value.flagCambioProv = 0)
        if(documentos.length > 0){
          this.setState({estadoBotones:{grabar: false}})
        }else{
          this.setState({estadoBotones:{grabar: true}})
        }
        const nombre_proveedor = this.state.proveedores.find(element => element.id_proveedor ===  filtro.proveedor).descripcion
        let arreglo_nroDocumentos = []
        documentos.forEach(value=>{arreglo_nroDocumentos.push(value.nro_documento)})
        let cantidad_doc = [...new Set(arreglo_nroDocumentos)].length
        this.setState({documentos, estado_carga:false, nombre_proveedor, cantidad_doc, filtroValido: filtro})
        this.contarCantidadVolumetricoProv()
        this.contarCantidadVolumetrico()
    }

    /*BUSCAR DOCUMENTO EN LA TABLA*/
    filtrarDatos = text =>{
        let texto = text.target.value
        this.setState({buscador: texto})
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

    ingresarDatosProv = (text, fila, nombreDato) =>{
        let valor = ""
        if(text === ""){
             valor = null
        }else{
            valor = text
            if(
                (nombreDato  === 'nro_scop_prov' && text.length > 11)
                ||  (nombreDato  === 'nro_documento_prov' && text.length > 8)
                ){
                    valor = valor.slice(0, -1);
                }
        }

        this.state.documentos.map((value) =>
            value.pk === fila.pk
                ? ((value[nombreDato] = valor, value.flagCambioProv = 1))
                : null)
        this.setState({documentos: this.state.documentos})

    }

    alterarCampos = (text, fila, nombreDato, cantTotal) =>{
        let valor = ""
        let cantidadValor = "0"
        if(text === "") return
        if(text.length === cantTotal) return
        for (let index = 1; index < (cantTotal-text.length); index++) {
            cantidadValor += "0"
        }
        valor = cantidadValor+text
        if(nombreDato === 'serie_prov'){
            valor = valor.slice(1, 4);
            valor = 'F'+valor
        }
        this.state.documentos.map((value) =>
            value.pk === fila.pk
                ? ((value[nombreDato] = valor, value.flagCambioProv = 1))
                : null)
        this.setState({documentos: this.state.documentos})
    }

     /*MODAL DE COMENTARIO*/
    abrirEstadoModal = (index, comentario) =>{
        this.setState({ ingreComentario: {...this.state.ingreComentario, 'comentario': comentario, 'index': index}, estado_modal:true }) 
    }
    cerrarEstadoModal = () =>{
        this.setState( { estado_modal:false, ingreComentario:{ comentario:'', index: '' } } )
    }
    /*COMENTARIO*/
    ingresarComentario = text =>{
        let valor = ""
        if(text.target.value === ""){
             valor = null
        }else{
             valor =  text.target.value
        }
        this.setState({ ingreComentario: {...this.state.ingreComentario, [text.target.name]: valor} }) 
    }
    guardarComentario = () =>{
        let comentario = this.state.ingreComentario
        this.state.documentos.map((value, index) => value.pk.toString() === comentario.index.toString() 
                                                        ? ((value.observacion_prov = comentario.comentario, value.flagCambioProv = 1))
                                                        : null)
        this.setState({documentos: this.state.documentos})
        this.cerrarEstadoModal()
    }

    grabarVolumetrico = async () =>{
        this.setState({estadoBotonGrabar:false})
        let filtroVolumetrico = this.state.documentos.filter(value => value.flagCambioProv === 1 )
        let arregloVolumetricos = []
        let error = 0

        for (let index = 0; index < filtroVolumetrico.length; index++) {
            if(filtroVolumetrico[index].nro_scop_prov !== null && (filtroVolumetrico[index].nro_scop_prov || '').toString().length < 11){
                error = 1
                this.setState({estadoBotonGrabar:true, estadoBotones:{...this.state.estadoBotones, grabar: false}})
                await swal("Mensaje", 'Para grabar los registros el numero de Scop Prov. debe contener 11 digitos.', "error")
                return
            }    
        }
        if(error === 1) return
        
        filtroVolumetrico.forEach(value =>{
            let volumetrico = {
                pk: value.pk, 
                volumetric: value.volumetric, 
                condicion_pago_prov: value.condicion_pago_prov, 
                serie_prov: value.serie_prov, 
                nro_documento_prov: value.nro_documento_prov,
                nro_scop_prov: value.nro_scop_prov,
                observacion_prov: value.observacion_prov
            }
            arregloVolumetricos.push(volumetrico)
        })
        const peticion = await apis.grabarVolumetrico(this.state.token, arregloVolumetricos)
        if(peticion.error){
            this.setState({estadoBotonGrabar:true, estadoBotones:{...this.state.estadoBotones, grabar: false}})
            if(!config.validarCookies()){
                await swal("Mensaje", "Tiempo de sesión culminado.", "error")
                config.cerrarSesion()
                this.props.accederLogin(false)
                return
            }
            await swal("Mensaje",peticion.error, "error")
            return
        }

        await swal("Mensaje","Volumetrico grabado.", "success")
        this.setState({estado_carga:false, estadoBotonGrabar: true})
    }

    actualizarEstado = () =>{
        this.setState({
            cantidad_doc:0,
            nombre_proveedor:'',
            buscador: '',
            cantidadVolumProv: 0,
            cantidadTotalVolumetrico: 0,
            documentos: [],
            estado_carga: false,
            estadoBotonGrabar: true,
            filtroValido:{
                fecha_i: moment().format('YYYY-MM-DD'),
                planta: '',
                proveedor: '',
                tipo:'1'
            },
            ingreComentario:{
                comentario:'',
                index: ''
            },
            estadoFiltro:{
                planta:'',
                proveedor:''
            },
            estadoBotones:{
                grabar: true
            }
        })
    }

  render() {
    const {accederLogin} = this.props
    return (
      <>
        <Header nombre={this.state.user} accederLogin={accederLogin}/>
        <div style={{position:'relative' ,margin:20, boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.15)'}}>
            <Form onSubmit={this.buscar} method="POST" style={{ display:'flex', flexDirection:'column'}} className="p-3" >
                <h6>REGISTRO DE VOLUMETRICO</h6>
                <Form.Group as={Row}>
                    <Form.Group as={Row}  style={{maxWidth:'450px'}}>
                        <Col sm="6">
                            <Form.Text className="text-muted">Fecha</Form.Text>
                            <Form.Control type="date" name='fecha_i' onChange={this.ingresarDatos} value={this.state.filtro.fecha_i} style={{fontSize:'0.9rem'}}/>
                        </Col>
                        <Col sm="6">
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
                    </Form.Group>

                    <Form.Group as={Row} style={{maxWidth:'550px'}}>
                        <Col sm="6" style={{maxWidth:'215px'}}>
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
                    <Col sm="6" style={{maxWidth:'300px', width:'100%'}}>
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
                <Col sm={6} className='mb-1'>
                    <Button variant="primary" type="button" disabled={this.state.estadoBotones.grabar} onClick={this.grabarVolumetrico}>
                    {
                    this.state.estadoBotonGrabar ?
                    <>
                        <img src={iconSave} width="14" alt="icon"/> Grabar
                    </>

                    :
                    <Spinner animation="border" variant="light" style={{width:'1em', height:'1em'}}/>
                    }
                    </Button>
                </Col>

                <Col sm={6} className='mb-1'>
                    <Row>
                    <Col md="6"></Col>
                    <Col md="6">
                        <div className='d-flex' style={{justifyContent:'space-between'}}>
                            <Form.Control type="text" placeholder="buscar por documento.." onChange={this.filtrarDatos} style={{marginRight:'15px'}}/>
                        </div>
                    </Col>
                    </Row>
                </Col>
            </Row>

            <Row>
                <h6>Proveedor: {this.state.nombre_proveedor}</h6>
            </Row>

            <div style={{overflowX:'scroll', width:'100%', maxHeight:'61vh'}}>
                <Volumetrico 
                    origen = 'proceso'
                    buscador = {this.state.buscador}
                    estado_carga = {this.state.estado_carga}
                    documentos={this.state.documentos} 
                    cantidadVolumProv = {this.state.cantidadVolumProv}
                    cantidadTotalVolumetrico = {this.state.cantidadTotalVolumetrico}
                    ingresarDatosProv = {this.ingresarDatosProv}
                    abrirEstadoModal = {this.abrirEstadoModal}
                    alterarCampos = {this.alterarCampos}
                    contarCantidadVolumetricoProv = {this.contarCantidadVolumetricoProv}
                    />
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
                    placeholder='Escriba un mensaje' 
                    as="textarea" 
                    rows={3} 
                    name='comentario' 
                    value={this.state.ingreComentario.comentario || ''} 
                    onChange={this.ingresarComentario}/>
            </Form.Group>
            <Button 
                style={{background:'#2193b0', border:'1px solid #2193b0'}} 
                type="button" 
                onClick={this.guardarComentario}>Aceptar</Button>
        </Modal.Body>
        </Modal>
      </>
    )
  }
}
