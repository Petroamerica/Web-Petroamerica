import React from "react"
import { Button, Col, Form, Row, Table } from "react-bootstrap"
import { usePlantas } from '../../hooks/usePlantas'
import { useProveedores } from '../../hooks/useProveedores'
import iconSearch from '../../img/iconSearch.png'
import moment from "moment"
import { config } from '../../config/config'
import { apis } from '../../api/apis'
import swal from 'sweetalert'

const FiltrosMatch = ({plantas,setFiltros,filtros, accederLogin}) => {
  const [proveedores, setProveedores] = React.useState([])
  const {user, token} = config.obtenerLocalStorage()

  React.useEffect(() => {
    (async () => {
      const prov = await apis.proveedor(token, '06',
        filtros.filtros.fecha,
        filtros.filtros.fecha,
        '-', 
        plantas.find(e => {
          return e.descripcion === filtros.filtros.planta
        }).id_planta,
        'admin')
      if(prov.error){
        if(!config.validarCookies()){
          await swal("Mensaje", "Tiempo de sesión culminado.", "error")
          config.cerrarSesion()
          accederLogin(false)
        }
        await swal("Mensaje", prov.error , "error")
        return
      }
      prov.unshift({id_proovedor: '-', descripcion: 'TODAS'})
      setProveedores(prov)
    })()
  },[token, filtros.filtros.fecha, filtros.filtros.planta ])

  const handleOnSubmit = (e) => {
    e.preventDefault()
  }

  return (
    <>
    <hr/>
    <Form className='mb-4' onSubmit={handleOnSubmit} style={{
      maxWidth: '750px'
      }}>
      <Form.Group as={Row} >
        <Col sm="4">
          <Form.Text 
          className="text-muted">Planta</Form.Text> 
          <Form.Select 
          value={filtros.filtros.planta} 
          name='planta' 
          onChange={(e) => {
          setFiltros(prev => ({
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
          value={filtros.filtros.proveedor} 
          name='proveedor' 
          onChange={(e) => {
            setFiltros(prev => ({
              ...prev,
              filtros: {
                ...prev.filtros,
               proveedor: e.target.value}
            })
            )}}
          style={{fontSize:'0.9rem'}}>
          <option value=''>Seleccionar...</option>
            {
              proveedores.map((value, index) =>
                <option key={index} value={value.descripcion}>{value.descripcion}</option>
              )
            }
          </Form.Select>
        </Col>
        <Col className='mt-4' sm='2'>
          <Button variant="primary"  type="submit" style={{
            display: 'flex',
            padding:'0.3rem',
            gap: '5px',
            alignItems:'center'
            }} ><img src={iconSearch} width="14" alt="icon"/> Buscar</Button>
        </Col>
      </Form.Group>
    </Form>
    </>
  )
} 

export default FiltrosMatch