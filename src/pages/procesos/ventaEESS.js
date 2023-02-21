import React, { Component } from 'react';
import { Form, Button, Col, Row, Table, Spinner, Modal, OverlayTrigger, Tooltip } from 'react-bootstrap'
import moment from 'moment'
import swal from 'sweetalert'
import '../styles.css'
import {config} from '../../config/config'
import {exportar} from '../../config/reports'
import {apis} from '../../api/apis'
import iconSave from '../../img/iconSave.png'
import iconSearch from '../../img/iconSearch.png'
import iconExcel from '../../img/excel.png'


import Header from '../../components/header/header'

export default class ventaEESS extends Component {

  state={
    user: '',
    token: '',
    eePropias :[],
    puntoVentas: [],
    res:[],
    filtro:{
      fecha_i: moment().format('YYYY-MM-DD'),
      fecha_f: moment().format('YYYY-MM-DD'),
      razon_s: '',
      grifo:''
    },
    filtroValido:{
      fecha_i: moment().format('YYYY-MM-DD'),
      fecha_f: moment().format('YYYY-MM-DD'),
      razon_s: '',
      grifo:''
    },
    estadoFiltro:{
      razon_s: false,
      grifo:false,
    },
    estadoBotones:{
      enviar: true,
      excel:true
    },
    filtroNombre:{
      rz:'',
      grifo:''
    },
    estado_carga:false,
    estado_modal:false,
    estadoBotonGrabar: true,
    DocSinValidar:{
      estadoModal: false,
      documentos: []
    },
    ingreComentario:{
      comentario:'',
      item: '',
      index: '',
      actividad: [],
      flgEEPP: ''
    },
    buscador:''
  }

  async componentDidMount(){
    const {user, token} = config.obtenerLocalStorage()
    if(user && token){
      this.setState({user, token})
    }else{
      await swal("Mensaje", "No se encontraron las credenciales para acceder a la web 'VALIDAR COMPRAS A HIDROMUNDO' .\nSalir y volver a ingresar." ,"error")
      return
    }

    this.buscarDocSinValidar(user, token, true)

    const eePropias = await apis.eePropio(user, token)
    if(eePropias.error){
      if(!config.validarCookies()){ 
        await swal("Mensaje", "Tiempo de sesión culminado.", "error")
        config.cerrarSesion() 
        this.props.accederLogin(false)
        return
      }
      await swal("Mensaje",(eePropias.error), "error")
      return
    }
    this.setState({eePropias})
  } 

  buscarDocSinValidar = async (user, token, activarModal) =>{
    const documentos = await apis.docSinValidar(user, token)
    if(documentos.error){
      if(!config.validarCookies()){ 
        await swal("Mensaje", "Tiempo de sesión culminado.", "error")
        config.cerrarSesion() 
        this.props.accederLogin(false)
        return
      }
      await swal("Mensaje",(documentos.error), "error")
      return
    }
    if(documentos.length > 0){
      documentos.map(value => value.flagCambio = null)
      if(activarModal){
        this.setState({DocSinValidar:{estadoModal: true, documentos}})
      }else{
        this.setState({DocSinValidar:{estadoModal: false, documentos}})
      }
    }else{
      this.setState({DocSinValidar:{estadoModal: false, documentos:[]}})
    }
  }

  cerrarModalDocSinValidar = () =>{
    this.setState({DocSinValidar:{...this.state.DocSinValidar, estadoModal: false}})
  }

  ingresarDatos = async (text) => { 
    this.setState({ filtro: {...this.state.filtro, [text.target.name]: text.target.value} }) 
    if(text.target.name === 'razon_s' && text.target.value !== ''){
      const puntoVentas = await apis.puntosVenta(
        this.state.user, 
        text.target.value, 
        this.state.token
      )
      if(puntoVentas.error){
        if(!config.validarCookies()){ 
          await swal("Mensaje", "Tiempo de sesión culminado.", "error")
          config.cerrarSesion()
          this.props.accederLogin(false)
          return
        }
        await swal("Mensaje",puntoVentas.error, "error")
        return
      }
      this.setState({puntoVentas, filtro: {...this.state.filtro, grifo: ''}})
    }
  }

  validar_ingresarSegundaFecha = text =>{
    let fecha1 = moment(this.state.filtro.fecha_i);
    let fecha2 = moment(text.target.value);
    let dias = fecha2.diff(fecha1, 'days')
    if(dias < 0){
      this.setState({ filtro: {...this.state.filtro, [text.target.name]:  moment().format('YYYY-MM-DD')} }) 
      return
    }
    this.setState({ filtro: {...this.state.filtro, [text.target.name]: text.target.value} }) 
  }
  
  filtro = async (e) =>{
    e.preventDefault()
    this.actualizarEstado()
    let filtro = this.state.filtro
    if(filtro.razon_s === ''){
      this.setState({estadoFiltro: {...this.state.estadoFiltro, razon_s:true, grifo:false}})
      return
    }
    if(filtro.grifo === ''){
      this.setState({estadoFiltro: {...this.state.estadoFiltro, razon_s:false, grifo:true}})
      return
    }
    this.setState({estadoFiltro: { razon_s: false, grifo:false}, estado_carga: true})
    this.filtrarDocumentos(filtro)
  }

  filtrarDocumentos = async  (filtro) =>{
    if(this.state.DocSinValidar.documentos.length > 0 && moment().format('YYYY-MM-DD') === filtro.fecha_f){
      await swal("Mensaje", "Debe validar los documentos que faltan para validar los actuales.", "info")
      this.setState({estado_carga: false})
      return
    }
    this.buscarDocSinValidar(this.state.user, this.state.token, false)
    const documento = await apis.documento(filtro.fecha_i, filtro.fecha_f, filtro.razon_s, filtro.grifo, this.state.user, this.state.token)
    if(documento.error){
      this.setState({estado_carga: false})
      if( !config.validarCookies()){ 
        await swal("Mensaje", "Tiempo de sesión culminado.", "error")
        config.cerrarSesion() 
        this.props.accederLogin(false)
        return 
      }
      await swal("Mensaje",documento.error, "error")
      return
    }
    documento.forEach(value =>{
      value.observacion_eeppComparativo = null
      value.estadoComparativo = value.flg_eepp
      value.flagComentario = 0
      value.flagActividades = value.observacion_eepp
      value.flagBtnRojo = (value.observacion_eepp || '').indexOf("DESCONFIRMADO")
    })
    this.setState({res:documento, estado_carga:false, filtroValido:filtro})
    if(documento.length > 0){
      this.setState({estadoBotones:{enviar: false, excel:false}})
    }else{
      this.setState({estadoBotones:{enviar: true, excel:true}})
    }
    console.log(documento)
  }

  agregarFlagAactividades = (key, item, text) =>{
    this.state.res.map((value, index) => 
      (value.pk === key && value.item === item)
        ? value.flagActividades = value.flagActividades + '|'+text
        : null
    )
    this.setState({res:this.state.res})
  }

  /*CHECK - APROBACION*/
  cambiarEstadoCheck = (res_index, res_item, res_value) => {
    let res = this.state.res
    let valueCheck =  (res_value || '0')
    let indexOf = res.find(element => element.pk === res_index && element.item === res_item)
    indexOf.flg_eepp = (valueCheck === '0') ? '1' : '0'
    indexOf.flagActividades = (valueCheck === '0') 
      ? `${indexOf.flagActividades} | Articulo confirmado por ${this.state.user}  el ${moment().format('YYYY-MM-DD')}`
      : `${indexOf.flagActividades} | Articulo desconfirmado por ${this.state.user}  el ${moment().format('YYYY-MM-DD')}`
    this.setState({res})

    let indexOfporValidar = this.state.DocSinValidar.documentos.find(value => 
      value.planta === indexOf.planta && value.id_tipo_doc === indexOf.id_tipo_doc &&
      value.serie === indexOf.serie && value.nro_documento === indexOf.nro_documento &&
      value.articulo === indexOf.articulo)
    if(!indexOfporValidar){ return }
    indexOfporValidar.flagCambio = '1'
    this.setState({DocSinValidar: this.state.DocSinValidar})
    /*let nuevoEstado = ''
    this.state.res.map((value, index) => 
      (value.pk === res_index && value.item === res_item)
        ? (
            value.flg_eepp = res_value === null ? '1': res_value === '1'  ? '0' : '1',
            nuevoEstado = res_value === null ? '1': res_value === '1'  ? '0' : '1'
          )
        : null
    )

    this.setState({res: this.state.res})
    if(nuevoEstado === '1'){
      this.agregarFlagAactividades(res_index, res_item, 'Articulo confirmado por ' + this.state.user + ' ' + moment().format('YYYY-MM-DD'))
    }else{
      this.agregarFlagAactividades(res_index, res_item, 'Articulo desconfirmado por ' + this.state.user + ' ' + moment().format('YYYY-MM-DD'))
    }*/
  }

  /*MODAL DE COMENTARIO*/
  abrirEstadoModal = (index, item, comentario, actividad) =>{
    let nuevaActividad = actividad
    let resActividad = []
    if(!nuevaActividad){
      resActividad = []
    }else{
      resActividad = nuevaActividad.split('|')
      resActividad.splice(0,1)
      resActividad.reverse()
    }
    this.setState({ ingreComentario: {
      comentario,
      item, 
      index, 
      'actividad': resActividad}, estado_modal:true }) 
  }
  cerrarEstadoModal = () =>{
    this.setState({estado_modal:false, ingreComentario: {
      'comentario': '',
      'item': '', 
      'index':'', 
      'actividad': []
    }})
  }

  /*INGRESAR COMENTARIO*/
  ingresarComentario = text =>{
    this.setState({ ingreComentario: {...this.state.ingreComentario, [text.target.name]: text.target.value} }) 
  }
  guardarComentario = () =>{
    let res = this.state.res
    let comentario = this.state.ingreComentario
    let indexOf = res.find(element => element.pk === comentario.index && element.item === comentario.item)
    let comentarioAsignado = ''
    if(comentario.comentario === '' || comentario.comentario === null){
      comentarioAsignado = null
    }else{
      comentarioAsignado = comentario.comentario.trim() 
    }
    indexOf.observacion_eeppComparativo = comentarioAsignado
    indexOf.flagComentario = 1
    indexOf.flagActividades = indexOf.flagActividades +'|'+ comentarioAsignado + ' por ' + this.state.user + ' el ' + moment().format('YYYY-MM-DD')
    this.setState({res})
    let indexOfporValidar = this.state.DocSinValidar.documentos.find(value => 
      value.planta === indexOf.planta && value.id_tipo_doc === indexOf.id_tipo_doc &&
      value.serie === indexOf.serie && value.nro_documento === indexOf.nro_documento &&
      value.articulo === indexOf.articulo)
    if(!indexOfporValidar){ return }
    indexOfporValidar.flagCambio = '1'
    this.setState({DocSinValidar: this.state.DocSinValidar})
    this.cerrarEstadoModal()
    /*let comentario = this.state.ingreComentario
    let comentarioAsignado = ''
    if(comentario.comentario === '' || comentario.comentario === null){
      comentarioAsignado = null
    }else{
      comentarioAsignado = comentario.comentario.trim() 
    }

    this.state.res.map(
      (value, index) => 
      (value.pk.toString() === comentario.index.toString() && value.item.toString() === comentario.item.toString())
        ? (value.observacion_eeppComparativo = comentarioAsignado, value.flagComentario = 1)
        : null
    )
    this.setState({res: this.state.res})
    
    this.agregarFlagAactividades(comentario.index, comentario.item, comentarioAsignado + ' por ' + this.state.user + ' ' + moment().format('YYYY-MM-DD'))
    
    this.cerrarEstadoModal()*/
  }

  enviarRegistrosAprobados = async () =>{
    this.setState({estadoBotonGrabar:false})

    let enviarDatosAprobador = []
    let aceptados = this.state.res
    let aceptadosFinalCheck = aceptados.filter(value => value.flg_eepp !== value.estadoComparativo )
    let aceptadosFinalcomentario = aceptados.filter(value => value.flagComentario === 1 )

    aceptadosFinalCheck.forEach(element => {
      let nuevaObservacion = element.flagActividades
      enviarDatosAprobador.push({
        pk: element.pk, 
        item: element.item,
        flg_eepp: element.flg_eepp, 
        observacion_eepp: nuevaObservacion.replaceAll(null, '').trim()
      })
    });

    aceptadosFinalcomentario.forEach(element => {
      let nuevaObservacion = element.flagActividades
      enviarDatosAprobador.push({
        pk: element.pk, 
        item: element.item,
        flg_eepp: element.flg_eepp, 
        observacion_eepp: nuevaObservacion.replaceAll(null, '').trim()
      })
    });
    
    if(enviarDatosAprobador.length < 1){
      this.setState({estadoBotonGrabar:true})
      await swal("Mensaje","No se realizo ningun cambio para guardar los documentos.", "info")
      return
    }

    const peticion = await apis.documento_put(this.state.token, enviarDatosAprobador) 

    if(peticion.error){
      this.setState({estadoBotonGrabar:true, estadoBotones:{...this.state.estadoBotones, enviar: false}})
      if(!config.validarCookies()){ 
        await swal("Mensaje", "Tiempo de sesión culminado.", "error")
        config.cerrarSesion() 
        this.props.accederLogin(false)
        return
      }
      await swal("Mensaje",peticion.error, "error")
      return
    }

    await swal("Mensaje","Registro enviado", "success")
    this.buscarDocSinValidar(this.state.user, this.state.token, false)
    this.filtrarDocumentos(this.state.filtroValido)
    this.setState({estado_carga:false, estadoBotonGrabar: true})
  }

/*BUSCAR DOCUMENTO EN LA TABLA*/
  filtrarDatos = text =>{
    let texto = text.target.value
    this.setState({buscador: texto})
  }

  emitirReporteXlsx = () =>{
    let rs = ''
    let pv = ''
    let eeP = this.state.eePropias
    let puntoV = this.state.puntoVentas
    for (let index = 0; index < eeP.length; index++) {
      if(eeP[index].id_cliente === this.state.filtroValido.razon_s){
        rs = eeP[index].descripcion
        break
      }
    }
    for (let index = 0; index < puntoV.length; index++) {
      if(puntoV[index].id_punto_venta === this.state.filtroValido.grifo){
        pv = puntoV[index].descripcion
        break
      }
    }
    exportar.reporteXlsx_EESS(this.state.res, this.state.filtroValido, rs, pv)
  }

  actualizarEstado = () =>{
    this.setState({
      buscador:'',
      res:[],
      estadoFiltro:{
        razon_s: false,
        grifo:false,
      },
      estadoBotones:{
        enviar: true,
        excel:true
      },
      filtroNombre:{
        rz:'',
        grifo:''
      },
      ingreComentario:{
        comentario:'',
        item: '',
        index: '',
        actividad: [],
        flgEEPP: ''
      },
      filtroValido:{
        fecha_i: moment().format('YYYY-MM-DD'),
        fecha_f: moment().format('YYYY-MM-DD'),
        razon_s: '',
        grifo:''
      },
      estado_carga:false,
      estado_modal:false,
      estadoBotonGrabar: true
    })
  }

  render() {
    let repetidor = ''
    let enumerar = 0
    let estadoColor = true
    const {accederLogin} = this.props 
    return <div>
     
      <Header nombre={this.state.user} accederLogin={accederLogin}/>      
      <div className="p-3" style={{position:'relative' ,margin:20, boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.15)'}}>
        <div style={{flexWrap: 'wrap',display: 'flex'}}>
          <div style={{ flexDirection: 'column', width: '55%', minWidth: 'fit-content', flexGrow: '1'}}>
            <h6>VALIDAR COMPRAS A HIDROMUNDO</h6>
            <Form onSubmit={this.filtro} method="POST" style={{display:'flex',flexDirection:'column'}}>
              <Form.Group as={Row}>
                <Form.Group as={Row}  style={{maxWidth:'340px'}}>
                  <Col sm="6">
                    <Form.Text className="text-muted">Fecha Inicial</Form.Text>
                    <Form.Control type="date" name='fecha_i' onChange={this.ingresarDatos} value={this.state.filtro.fecha_i} style={{fontSize:'0.9rem'}}/>
                  </Col>
                  <Col sm="6">
                  <Form.Text className="text-muted">Fecha Final</Form.Text>
                    <Form.Control type="date" name='fecha_f' onChange={this.validar_ingresarSegundaFecha} value={this.state.filtro.fecha_f} style={{fontSize:'0.9rem'}}/>
                  </Col>
                </Form.Group>

                <Form.Group as={Row}  style={{maxWidth:'430px'}}>
                  <Col sm="6">
                    <Form.Text className="text-muted">Cliente EEPP (Razón Social)</Form.Text>
                    <Form.Select value={this.state.filtro.razon_s} isInvalid={this.state.estadoFiltro.razon_s} name='razon_s'  onChange={this.ingresarDatos} style={{fontSize:'0.9rem'}}>
                      <option value=''>Seleccionar...</option>
                      {
                        this.state.eePropias.map(value => 
                          <option key={value.id_cliente} value={value.id_cliente}>{value.descripcion}</option>
                        )
                      }
                    </Form.Select>
                  </Col>
                  <Col sm="6">
                    <Form.Text className="text-muted">Punto de Venta EEPP (Grifo)</Form.Text>  
                    <Form.Select value={this.state.filtro.grifo} isInvalid={this.state.estadoFiltro.grifo} name='grifo'  onChange={this.ingresarDatos} style={{fontSize:'0.9rem'}}>
                      <option value=''>Seleccionar...</option>
                      {
                        this.state.puntoVentas.map(value => 
                          <option key={value.id_punto_venta} value={value.id_punto_venta}>{value.descripcion}</option>
                        )
                      }
                    </Form.Select>
                  </Col>
                </Form.Group>

                <Form.Group as={Row}  style={{maxWidth:'120px', flexDirection:'column-reverse', marginLeft:'0px', marginTop:'5px'}}>
                  <Button variant="primary" type="submit" style={{maxWidth:'85px', padding:'0.2rem'}} ><img src={iconSearch} width="14" alt="icon"/> Buscar</Button>
                </Form.Group>          
              </Form.Group>
            </Form>
          </div>
          <div style={{ height:'90px', padding:'5px', overflowY:'scroll', boxShadow:'0px 0px 2px 0px rgba(0,0,0,0.15)', marginTop:'10px', width:'30%', flexGrow: '1'}}>
            <span style={{fontWeight: 'bold', color:'#6c757d'}}>Documentos sin validar</span>
            <ul>
              {
                this.state.DocSinValidar.documentos.length > 0 
                  ? this.state.DocSinValidar.documentos.map((value, index) => 
                    <li key={index} style={{color:(value.flagCambio === '1') ?  '#36AE7C'  : '#6c757d', fontSize:'0.9rem'}}>
                      <b>({moment(value.fecha).format('DD/MM/YYYY')})</b> 
                      <b>{' '+value.id_tipo_doc.substring(0,1)}{value.serie}-{value.nro_documento} {' - '}</b>
                      {value.punto_venta}
                    </li>)
                  : <span style={{color:'#6c757d'}}>Ninguno.</span>
              }
            </ul>
          </div>
        </div>
      </div>

      <div style={{marginLeft:20, marginRight:20, marginTop:20, boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.15)', padding:20, display:'flex', flexDirection:'column'}}>
        
        <Row>
          <Col sm={6} className='mb-2'><Button variant="primary" type="button" disabled={this.state.estadoBotones.enviar} onClick={this.enviarRegistrosAprobados}>
            {
              this.state.estadoBotonGrabar 
                ? <>
                    <img src={iconSave} width="14" alt="icon"/> Grabar 
                  </>
                : <Spinner animation="border" variant="light" style={{width:'1em', height:'1em'}}/>
            }
          </Button></Col>
          <Col sm={6} className='mb-2'>
            <Row>
              <Col md="7"></Col>
              <Col md="5">
                <div className='d-flex' style={{justifyContent:'space-between'}}>
                  <Form.Control type="text" placeholder="buscar por documento.." onChange={this.filtrarDatos} style={{marginRight:'15px'}}/>
                  <OverlayTrigger
                    overlay={ <Tooltip id={`tooltip-1`}>Descargar</Tooltip> }
                  >
                    <Button variant="light" type="button" disabled={this.state.estadoBotones.excel} onClick={()=>this.emitirReporteXlsx()}><img src={iconExcel} alt="descargar" width={20}/></Button>
                  </OverlayTrigger>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>

        <div style={{overflowX:'scroll', width:'100%', maxHeight:'65vh'}}>
          <Table  bordered size="md"  style={{width:'100%', fontSize:'0.8rem'}}>
            <thead style={{position:'sticky', top:'0px', background:'white', boxShadow: '0px 0px 1px black'}}>
              <tr>
                <th >#</th>
                {/* <th style={{widows:'278px', minWidth:'287px'}}>Opciones</th> */}
                <th style={{width:'215px', minWidth:'215px'}}>Opciones</th>
                <th>Fecha</th>
                <th>Planta</th>
                {/* <th style={{minWidth:'120px'}}>Cliente EEPP (Razón Social)</th> */}
                <th style={{minWidth:'150px'}}>Punto de Venta EEPP (Grifo)</th>
                <th>Documento</th>
                <th>Nro Scop</th>
                <th style={{minWidth:'100px'}}>Total Doc S./</th>
                <th>Item</th>
                <th>Articulo</th>
                <th>Cantidad</th>
                <th style={{minWidth:'120px'}}>Prec. Unit. c/igv</th>
                <th style={{minWidth:'100px'}}>Total Item</th>
                <th>Percepción</th>
                <th>Chofer</th>
                <th>Placa</th>
              </tr>
            </thead>
            <tbody>
              {
                this.state.estado_carga ?
                  <tr>
                    <td  colSpan={16} align='center'>
                    <Spinner animation="grow"/>
                    </td>
                  </tr>
                : 
                this.state.res.filter(values => values.nro_documento.indexOf(this.state.buscador) !== -1).map((value, index)=>
                (
                
                repetidor !== value.pk?  

                <tr key={index} style={{background:estadoColor ? '#F5F5F5' : 'white'}}>
                  <td>{enumerar+=1}</td>
                  <td>
                    <div style={{display:'flex', justifyContent:'space-around'}}>
                      <div style={{display:'flex'}}>
                        <Form.Check 
                          type="checkbox" 
                          checked={value.flg_eepp === '1' ? true : false}                         
                          size="lg" 
                          onChange={()=>this.cambiarEstadoCheck(value.pk, value.item, value.flg_eepp)} 
                          style={{fontSize:'1rem'}}/> 
                          &nbsp;&nbsp;
                          <label className='form-check-label' 
                            style={{color: value.flg_eepp === '1' ? 'green' : 'red' }} >
                            {value.flg_eepp === '1' ? 'Confirmado' : 'Por confirmar' }
                          </label>&nbsp;&nbsp;
                      </div>
                      <Button type="button" 
                        style={{
                          background: (value.flagBtnRojo !== -1 || value.flg_eepp === '0') ? '#F32424' : (!value.observacion_eepp) ? '#00B4D8' : '#F7D716', 
                          border: (value.flagBtnRojo !== -1 || value.flg_eepp === '0') ? '1px solid #B20600' : (!value.observacion_eepp) ? '1px solid #2193b0' : '1px solid #cfb72a',
                          color: (value.flagBtnRojo !== -1 || value.flg_eepp === '0') ? 'white' : (!value.observacion_eepp) ? 'white' : 'black'
                        }} 
                        size="sm" onClick={()=>this.abrirEstadoModal(value.pk, value.item, value.observacion_eeppComparativo, value.observacion_eepp)}>Comentario</Button>
                    </div>
                  </td>
                  <td>{moment(value.fecha).format("DD/MM/YYYY")}</td>
                  <td>{value.planta}</td>
                  {/* cambios 26/01/2023, se quito la columna cliente y agrego chofer y placa   */}
                  {/* <td>{value.cliente}</td> */}
                  <td>{value.punto_venta}</td>
                  <td>{value.id_tipo_doc.substring(0,1)}{value.serie}-{value.nro_documento}</td>
                  <td>{value.nro_scop}</td>
                  <td>{ new Intl.NumberFormat("en-us", { maximumFractionDigits: 4 }).format(value.total || 0)}</td>
                  <td>{value.item}</td>
                  <td>{value.articulo}</td>
                  <td>{value.cantidad}</td>
                  <td>{ new Intl.NumberFormat("en-us", { maximumFractionDigits: 4 }).format(value.precio_unit_con_igv || 0)}</td>
                  <td>{ new Intl.NumberFormat("en-us", { maximumFractionDigits: 4 }).format(value.total_item || 0)}</td>
                  <td>{ new Intl.NumberFormat("en-us", { maximumFractionDigits: 4 }).format(value.monto_percepcion || 0)}</td>
                  <td hidden={true}>{repetidor = value.pk}</td>
                  <td hidden={true}>{estadoColor = !estadoColor}</td>
                  <td>{value.chofer}</td>
                  <td>{value.placa}</td>
                </tr>

                :
              
                <tr key={index} style={{background:!estadoColor ? '#F5F5F5' : 'white'}}>
                  <td></td>
                  <td>
                    <div style={{display:'flex', justifyContent:'space-around'}}>
                      <div style={{display:'flex'}}>
                        <Form.Check 
                          type="checkbox" 
                          checked={value.flg_eepp === '1' ? true : false}                         
                          size="lg" 
                          onChange={()=>this.cambiarEstadoCheck(value.pk, value.item, value.flg_eepp)} 
                          style={{fontSize:'1rem'}}/> 
                          &nbsp;&nbsp;
                          <label className='form-check-label' 
                            style={{color: value.flg_eepp === '1' ? 'green' : 'red' }} >
                            {value.flg_eepp === '1' ? 'Confirmado' : 'Por confirmar' }
                          </label>&nbsp;&nbsp;
                      </div>
                      <Button type="button" 
                        style={{
                          background: (value.flagBtnRojo !== -1 || value.flg_eepp === '0') ? '#F32424' : (!value.observacion_eepp) ? '#00B4D8' : '#F7D716', 
                          border: (value.flagBtnRojo !== -1 || value.flg_eepp === '0') ? '1px solid #B20600' : (!value.observacion_eepp) ? '1px solid #2193b0' : '1px solid #cfb72a',
                          color: (value.flagBtnRojo !== -1 || value.flg_eepp === '0') ? 'white' : (!value.observacion_eepp) ? 'white' : 'black'
                        }} 
                        size="sm" onClick={()=>this.abrirEstadoModal(value.pk, value.item, value.observacion_eeppComparativo, value.observacion_eepp)}>Comentario</Button>
                    </div>
                  </td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td></td>
                  <td>{value.item}</td>
                  <td>{value.articulo}</td>
                  <td>{value.cantidad}</td>
                  <td>{ new Intl.NumberFormat("en-us", { maximumFractionDigits: 4 }).format(value.precio_unit_con_igv || 0)}</td>
                  <td>{ new Intl.NumberFormat("en-us", { maximumFractionDigits: 4}).format(value.total_item || 0)}</td>
                  <td>{ new Intl.NumberFormat("en-us", { maximumFractionDigits: 4 }).format(value.monto_percepcion || 0)}</td>
                  <td hidden={true}>{repetidor = value.pk}</td>
                  <td>{value.chofer}</td>
                  <td>{value.placa}</td>
                </tr> 
                ))
              }
            </tbody>
          </Table>
        </div>

      </div>

      <Modal
        show={this.state.estado_modal}
        onHide={this.cerrarEstadoModal}
        keyboard={false}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Comentario</Modal.Title>
        </Modal.Header>
        <Modal.Body>  
          <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
            <Form.Control placeholder='Escriba un mensaje' as="textarea" rows={3} name='comentario' value={this.state.ingreComentario.comentario || ''} onChange={this.ingresarComentario} style={{resize: 'none'}}/>
            <br/>
            <Form.Label>Actividades:</Form.Label>
            <Form.Control as="textarea"  rows={3} readOnly  style={{resize: 'none'}} value={this.state.ingreComentario.actividad ?  '- '+ this.state.ingreComentario.actividad.join('\n- '): ''}/> 
          </Form.Group>
          <Button style={{background:'#2193b0', border:'1px solid #2193b0'}} type="button" onClick={this.guardarComentario} >Aceptar</Button>
        </Modal.Body>
      </Modal>

      <Modal
        show={this.state.DocSinValidar.estadoModal}
        onHide={this.cerrarModalDocSinValidar}
        keyboard={false}
        centered
        size="lg"
        scrollable={true}
      >
        <Modal.Header closeButton>
          <Modal.Title>Documentos sin Validar</Modal.Title>
        </Modal.Header>
        <Modal.Body>  
          <Form.Group className="mb-3">
            {this.state.DocSinValidar.documentos.map((value, index) => 
                <Form.Label key={index}>
                  <b>({moment(value.fecha).format('DD/MM/YYYY')})</b> 
                  <b>{' '+value.id_tipo_doc.substring(0,1)}{value.serie}-{value.nro_documento} {' - '}</b>
                  {value.punto_venta}
                </Form.Label>
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button style={{background:'#2193b0', border:'1px solid #2193b0'}} type="button" onClick={this.cerrarModalDocSinValidar} >Aceptar</Button>
        </Modal.Footer>
      </Modal>
      
    </div>;
  }

}
