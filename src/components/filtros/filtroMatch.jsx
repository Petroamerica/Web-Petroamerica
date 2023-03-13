import React from "react"
import {  Col, Form, Row } from "react-bootstrap"
import { config } from '../../config/config'
import { apis } from '../../api/apis'
import swal from 'sweetalert'

const FiltrosMatch = ({plantas, setFiltros, setCompras, setVentas, filtros, accederLogin}) => {
  const [proveedores, setProveedores] = React.useState([])
  const {token} = config.obtenerLocalStorage()

  React.useEffect(() => {
    (async () => {
      const plantasPet = plantas.find(e => {
          return e.descripcion === filtros.filtros.planta
        })
      if(!plantasPet) return
      const prov = await apis.proveedor(token, '06',
        filtros.filtros.fecha,
        filtros.filtros.fecha,
        '-', 
        plantasPet.id_planta,
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
  },[token, filtros.filtros.fecha, filtros.filtros.planta, plantas, accederLogin])

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
          setCompras(prev => ({
          ...prev,
          filtros: {
            ...prev.filtros,
           planta: e.target.value
          }}))
          setVentas(prev => ({
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
        <Col sm='6'>
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
      </Form.Group>
    </Form>
    </>
  )
} 

export default FiltrosMatch
