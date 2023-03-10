import React, { useReducer, useState } from 'react';
import {Button, Modal, Row, Form, Col, Spinner } from 'react-bootstrap';
import allData from '../../img/allData.svg';
import TablaControl from '../table/table';
import { apis } from '../../api/apis'
import { config } from '../../config/config'
import { usePlantas } from '../../hooks/usePlantas'
import { useProveedores } from '../../hooks/useProveedores'
import swal from 'sweetalert';
import moment from 'moment';

export const ModalMatch = ({accederLogin, reload}) => {
  const [ show, setShow ] = useState(false);
  const { plantas } = usePlantas({accederLogin})
  const { proveedores } = useProveedores({accederLogin})

  // reload matchs trick 
  const [reloadMatchs, setReloadMatchs] = useReducer(x => x + 1 ,0)

  const [proveeFilter, setProveeFilter] = useState([])
  const [mapChecked, setMapChecked] = useState([])
  const [match, setMatch] = useState({
    filtros: {
      fecha: moment().format('YYYY-MM-DD').toString(),
      planta: 'TODAS',
      proveedor: 'TODAS'
    },
    data: [],
    estado: {
      error: false,
      loading: false,
    }
  });

  const handleCheBox = (value) => {
    if(mapChecked.findIndex(e => e.factCompra === value.factCompra) === -1) {
      setMapChecked(prev => [...prev, value])
    } else {
      setMapChecked(prev => prev.filter(e => e.factCompra !== value.factCompra))
    }
  }

 
  React.useEffect(() => {
    const {token} = config.obtenerLocalStorage()
    
    async function fetchData() {
      try {
        const data = await apis.getMatch('-', '-', match.filtros.fecha, match.filtros.fecha, token) 
        setMatch(prev => ({
          ...prev,
          data: data.map(value => {
            return ({
              ...value,
            factVenta: value.id_tipo_doc.substring(1,0) + value.serie.substring(1) + "-" + value.nro_documento,
            factCompra: value.id_tipo_doc_pur.substring(1,0) + value.serie_pur.substring(1) + "-" + value.nro_documento_pur  })
          }),
        }))
      } catch (error) {
        console.log(error)
        if(error.status === 401 || !config.validarCookies()) {
          swal("Mensaje", "Tiempo de sesi??n culminado.", "error")
          config.cerrarSesion()
          accederLogin(false)
          return
        }
        swal("Mensaje", "Ocurri?? un error en la solicitud para la lista de Matchs.", "error")
      }
    }
    return fetchData()
  }, [accederLogin, match.filtros.fecha, reloadMatchs]) 

  React.useEffect(() => {
    const {token} = config.obtenerLocalStorage()

    async function fetchData() {
      const plantaPet = plantas.find(e => e.descripcion === match.filtros.planta) 
      if (!plantaPet) return
      const prov = await apis.proveedor(token, '06',
      match.filtros.fecha,
      match.filtros.fecha,
      '-',
      plantaPet.id_planta || '00',
      "admin")
      if(prov.error){
        if(!config.validarCookies()){
          await swal("Mensaje", "Tiempo de sesi??n culminado.", "error")
          config.cerrarSesion()
          accederLogin(false)
        }
        await swal("Mensaje", prov.error , "error")
        return
      }
      prov.unshift({id_proovedor: '-', descripcion: 'TODAS'})
      setProveeFilter(prov)
    }
    fetchData()
  }, [accederLogin, match.filtros.fecha, match.filtros.planta, plantas])

  const handleDeleteData = () => {
    const { token } = config.obtenerLocalStorage()
    console.log(mapChecked)
    try{
      mapChecked.forEach((value) => {
        let planta_sale = plantas.find(e => e.descripcion === value.planta).id_planta
        let planta_pur = plantas.find(e => e.descripcion === value.planta_pur).id_planta
        let id_proveedor = proveedores.find(e => e.descripcion === value.proveedor_pur).id_proveedor
        apis.deleteMatch(planta_sale,
          value.id_tipo_doc,
          value.serie,
          value.nro_documento,
          planta_pur,
          id_proveedor,
          value.id_tipo_doc_pur,
          value.serie_pur,
          value.nro_documento_pur,
          token
        )
      })
      // reset states
      setMatch(prev => ({
        ...prev,
        data: match.data.filter(e => mapChecked.findIndex(y => e.factVenta === y.factVenta) === -1)
      }))
      setMapChecked([])

      // success delay 
      setTimeout(() => {
        swal("Mensaje", "Match eliminado correctamente", "success")
        reload()
      }, 250)
    }catch(error) {
      console.log(error)
      if(error.status === 401 || !config.validarCookies()) {
        swal("Mensaje", "Tiempo de sesi??n culminado.", "error")
        config.cerrarSesion()
        accederLogin(false)
        return
      }
      swal("Mensaje", "Ocurri?? un error al eliminar el Match seleccionado", "error")
    }
  };

  const handleClose = () => setShow(false);
  const handleShow = () => {
    setShow(true)
    setReloadMatchs()
  }

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        <img src={allData} width='22' alt='enlazados'/>
      </Button>

      <Modal size='xl' show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Articulos Enlazados</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col sm="2">
              <Form.Group className="mb-3">
                <Form.Text className="text-muted">Fecha inicial</Form.Text>
                <Form.Control 
                type="date"
                name='fechaInicioVentas'
                onChange={(e) => setMatch(prev => ({
                  ...prev,
                  filtros: {
                    ...prev.filtros,
                  fecha: e.target.value
                  }})
                )}
                value={match.filtros.fecha}
                style={{fontSize:'0.9rem'}}/>
              </Form.Group>
            </Col>
            <Col sm="2">
              <Form.Text 
              className="text-muted">Planta</Form.Text> 
              <Form.Select 
              value={match.filtros.planta} 
              name='planta' 
              onChange={(e) => {
                setMatch(prev => ({
                ...prev,
                filtros: {
                  ...prev.filtros,
                planta: e.target.value
                }}))
              }}
              style={{fontSize:'0.9rem'}}>
                <option 
                >Seleccionar...</option>
                {
                  plantas.map((value, index) =>
                    <option key={index} value={value.description}>{value.descripcion}</option>
                  )
                }
              </Form.Select>
            </Col>
            <Col sm='4'>
              <Form.Text className="text-muted">Proveedor</Form.Text>
              <Form.Select 
              value={match.filtros.proveedor} 
              name='proveedor' 
              onChange={(e) => {
                setMatch(prev => ({
                  ...prev,
                  filtros: {
                    ...prev.filtros,
                  proveedor: e.target.value}
                })
                )}}
              style={{fontSize:'0.9rem'}}>
              <option value=''>Seleccionar...</option>
                {
                  proveeFilter.map((value, index) =>
                    <option key={index} value={value.descripcion}>{value.descripcion}</option>
                  )
                }
              </Form.Select>
            </Col>
          </Row>
          <hr/>
          <div style={{ overflowY:'scroll', maxHeight:'70vh', flexDirection:'column', display: 'flex', gap:'10px', alignItems: 'center'}}>
            <TablaControl
              cols={["Planta","Proveedor", "Fact", "Fecha", "Scope" , "Planta - Compra", "Proveedor - Compra", "Fact - Compra", "Scope - Compra",  "Match", ""]}
            > 
              {match.data.filter(e => {
                    return (match.filtros.planta === 'TODAS') ? true : e.planta === match.filtros.planta
                }).filter(e => {
                    return (match.filtros.proveedor === 'TODAS') ? true : e.proveedor === match.filtros.proveedor
                }).map((value, index) => {
                  const mapdata = match.data.filter(e => {
                      return (match.filtros.planta === 'TODAS') ? true : e.planta === match.filtros.planta
                  }).filter(e => {
                      return (match.filtros.proveedor === 'TODAS') ? true : e.proveedor === match.filtros.proveedor
                  }) 
                  let isEqual = false
                  if(index >= 1) {
                    console.log(mapdata[index-1], mapdata.length, index)
                    isEqual = mapdata[index-1].factVenta === value.factVenta
                  }
                return(
                    <tr key={index} style={{
                        background: `${value.color_order === '1' && '#d0eae8' }`
                    }}>
                      <td>{ value.planta }</td>
                      <td>{ !isEqual && value.proveedor }</td>
                      <td>{ !isEqual ? value.factVenta : value.factVenta + ' +'}</td>
                      <td>{ !isEqual && new Date(value.fecha).toLocaleDateString()}</td>
                      <td>{ value.nro_scop }</td>
                      <td>{ value.planta_pur}</td>
                      <td>{ !isEqual && value.proveedor_pur}</td>
                      <td>{ value.factCompra}</td>
                      <td>{ value.nro_scop_pur }</td>
                      <td>{ !isEqual && (value.flag_automatic_match === "1" && 'A' )}</td>
                      <td>
                        {
                          !isEqual &&
                          <input 
                            type='checkbox'
                            checked={mapChecked.findIndex(e => e.factCompra === value.factCompra) === -1 ? false : true}
                            onChange={e => handleCheBox(value)}
                            /> 
                        }
                      </td>
                  </tr>
                )})
              }
            </TablaControl>
            {match.estado.loading && 
              <div style={{
                display: 'flex',
                justifyContent: 'center',
              }}>
                <Spinner animation="border" />
              </div>
            }
            {match.data.length === 0 && 
              <div style={{
                display: 'flex',
                justifyContent: 'center',
              }}>
                <h6>No hay articulos Enlazados</h6>
              </div>
             }
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Cerrar
          </Button>
          <Button variant="danger" onClick={handleDeleteData}>
            Guarda Cambios
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
