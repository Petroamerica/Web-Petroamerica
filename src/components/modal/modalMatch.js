import React, { useState } from 'react';
import {Button, Modal, Form, Col, Spinner } from 'react-bootstrap';
import allData from '../../img/allData.svg';
import TablaControl from '../table/table';
import FiltroMatch from '../filtros/filtroMatch'
import { apis } from '../../api/apis'
import { config } from '../../config/config'
import { usePlantas } from '../../hooks/usePlantas'
import { useProveedores } from '../../hooks/useProveedores'
import swal from 'sweetalert';
import moment from 'moment';

export const ModalMatch = ({mode, accederLogin}) => {
  const [ show, setShow ] = useState(false);
  const { plantas } = usePlantas({accederLogin})
  const { proveedores } = useProveedores({accederLogin})
  const [proveedoresFilter, setProveedoresFilter] = useState([])
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
          swal("Mensaje", "Tiempo de sesión culminado.", "error")
          config.cerrarSesion()
          accederLogin(false)
          return
        }
        swal("Mensaje", "Ocurrió un error en la solicitud para la lista de Matchs.", "error")
      }
    }
    return fetchData()
  }, [mode,accederLogin, match.filtros.fecha]) 

  const handleDeleteData = () => {
    const { token } = config.obtenerLocalStorage()
    mapChecked.forEach((value) => {
      let planta_sale = plantas.find(e => e.descripcion === value.planta).id_planta
      let planta_pur = plantas.find(e => e.descripcion === value.planta_pur).id_planta
      let id_proveedor = proveedores.find(e => e.descripcion === value.proveedor_pur).id_proveedor
      try{
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

        // reset states
        setMatch(prev => ({
          ...prev,
          data: match.data.filter(e => e.factVenta !== value.factVenta)
        }))
        setMapChecked([])
        // reset states

      }catch(error) {
        console.log(error)
        if(error.status === 401 || !config.validarCookies()) {
          swal("Mensaje", "Tiempo de sesión culminado.", "error")
          config.cerrarSesion()
          accederLogin(false)
          return
        }
        swal("Mensaje", "Ocurrió un error al eliminar el Match seleccionado", "error")
      }
      console.log(`/Docs_sale_purchase/${planta_sale}/${value.id_tipo_doc}/${value.serie}/${value.nro_documento}/
      ${planta_pur}/${id_proveedor}/${value.id_tipo_doc_pur}/${value.serie_pur}/${value.nro_documento_pur}`)
    })
    setShow(false)
  };

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

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
              }}))}
              value={match.filtros.fecha}
              style={{fontSize:'0.9rem'}}/>
            </Form.Group>
          </Col>
          <hr/>
          <div style={{flexDirection:'column', display: 'flex', gap:'10px', alignItems: 'center'}}>
            <TablaControl
              cols={["Planta","Proveedor", "Fact", "Fecha", "Scope" , "Planta - Compra", "Proveedor - Compra", "Fact - Compra", "Scope - Compra",  "Match", ""]}
              mode={false}
            > 
              {match.data.map((value, index) => {
              const mapdata = match.data.filter(e => {
                  return (match.filtros.planta === 'TODAS') ? true : e.planta === match.filtros.planta
                }).filter(e => {
                  return (match.filtros.proveedor === 'TODAS') ? true : e.proveedor === match.filtros.proveedor
                }) 
              let isEqual = false
              if(index >= 1) {
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
