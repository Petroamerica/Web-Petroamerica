import moment from "moment"
import React from "react"
import { Button, Col, Form, Spinner } from "react-bootstrap"
import swal from "sweetalert"
import FiltrosMatch from '../../components/filtros/filtroMatch'
import TablaControl from "../../components/table/table"
import Header from "../../components/header/header"
import filter from '../../img/filter.svg'
import { config } from "../../config/config"
import { usePlantas } from "../../hooks/usePlantas"
import { ModalMatch } from '../../components/modal/modalMatch'
import { apis } from '../../api/apis.js'
import { ParseFactCompra, ParseFactVenta } from '../../utils/parseFact'

const Match = ({accederLogin}) => {
  const [selectedCompra,  setSelectedCompra] = React.useState([])
  const [selectedVenta,  setSelectedVenta] = React.useState([])

  const [mode, setMode] = React.useState(false)

  const [userL, setUser] = React.useState({
    token: "",
    username: ""
  })

  const { plantas } = usePlantas({accederLogin})

  const [ventas, setVentas] = React.useState({
    filtros: {
      fecha: moment().format('YYYY-MM-DD').toString(),
      planta: 'TODAS',
      proveedor: 'TODAS',
      articulo: '-',
    },
    data: [],
    estado: {
      error: false,
      loading: false,
      empty: false
    }
  })

  const [compras, setCompras] = React.useState({
    filtros: {
      fecha: moment().format('YYYY-MM-DD').toString(),
      planta: 'TODAS',
      proveedor: 'TODAS',
      articulo: '-',
    },
    data: [],
    estado: {
      error: false,
      loading: false,
      empty: false
    }
  })


  const handleCheckboxCompra = (e, value) => {
    if(selectedCompra.findIndex(e => e.fact === value.fact) === -1) {
      setSelectedCompra(prev => [...prev, value])
    } else {
      setSelectedCompra(prev => prev.filter(e => e.fact !== value.fact))
      setSelectedCompra(lastCompra => {
        if(lastCompra.length === 0) {
          setSelectedVenta([])
        }
        return lastCompra
      })
    }
  }

  const handleCheckboxVenta = (e, value) => {
    if(selectedVenta.findIndex(e => e.fact === value.fact) === -1) {
      setSelectedVenta(prev => [...prev, value])
    } else {
      setSelectedVenta(prev => prev.filter(e => e.fact !== value.fact))
    }
  }

  React.useEffect(() => {
    (async () => {
      setVentas(prev => ({
        ...prev,
        estado: {
          ...prev.estado,
          loading: true,
          empty: false
        }
      }))
      const ventasData  = await apis.getVentas('-', '-', '-', ventas.filtros.fecha, ventas.filtros.fecha, userL.token)
      if(ventasData.error){
        if(!config.validarCookies()){
          await swal("Mensaje", "Tiempo de sesión culminado.", "error")
          config.cerrarSesion()
          accederLogin(false)
        }
        await swal("Mensaje", ventas.error , "error")
        return
      }

      const timeout = setTimeout(() => {
        setVentas(prev => ({
          ...prev,
          data: ventasData.map(e => ({...e, fact: ParseFactVenta(e)})),
          estado: {
            ...prev.estado,
            loading: false,
            empty: ventasData.length === 0
          }
        }))
      },1000)

      return timeout

    })()
  }, [userL.token, ventas.filtros.fecha])

  React.useEffect(() => {
    (async () => {
      setCompras(prev => ({
        ...prev,
        estado: {
          ...prev.estado,
          loading: true,
          empty: false
        }
      }))
      const comprasData  = await apis.getCompras('-', '-', '-', compras.filtros.fecha, compras.filtros.fecha, userL.token)
      if(comprasData.error){
        if(!config.validarCookies()){
          await swal("Mensaje", "Tiempo de sesión culminado.", "error")
          config.cerrarSesion()
          accederLogin(false)
        }
        await swal("Mensaje", ventas.error , "error")
        return
      }
      
      const timeout = setTimeout(() => {
        setCompras(prev => ({
          ...prev,
          data: comprasData.map(e => ({...e, fact: ParseFactCompra(e)})),
          estado: {
            ...prev.estado,
            loading: false,
            empty: comprasData.length === 0
          }
        }))
      }, 1000)
      return timeout
    })()
  }, [userL.token, compras.filtros.fecha])


  React.useEffect(() => {
    (async () => {
      const {user, token} = config.obtenerLocalStorage()
      if(user && token){
        setUser(_prevUser => ({
          token: token,
          username: user
        }))
      }else{
        await swal("Mensaje", "No se encontraron las credenciales para acceder a la web 'REGISTRO DE VOLUMETRICO' .\nSalir y volver a ingresar." ,"error")
        return }
    })()
  },[])

  return (
    <>
    <Header nombre={userL.username} accederLogin={accederLogin}/>
    <div style={{
      margin: 20,
      display: "flex",
      flexDirection: "column",
      gap: "30px",
    }}>
      <div style={{
          display: 'flex',
          padding: 20,
          gap: '20px',
          boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.15)',
        }}>
        <div>
          <Button 
            onClick={() => {
              setVentas(prev  => ({
                ...prev,
                filtros: {
                  ...prev.filtros,
                  planta: 'TODAS',
                  proveedor: 'TODAS',
                  articulo: '-',
                },
              }))
              setCompras(prev  => ({
                ...prev,
                filtros: {
                  ...prev.filtros,
                  planta: 'TODAS',
                  proveedor: 'TODAS',
                  articulo: '-',
                },
              }))
              setMode(!mode)
            }}
          >
            <img src={filter} alt='filter' width='20'/>
          </Button>
        </div>
        <div>
          <ModalMatch/>
        </div>
      </div>
      <div style={{
        display: 'flex', 
        padding: 20,
        gap: '25px',
        minHeight: '500px',
        boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.15)',
      }}>
        <div style={{marginRight: '20px'}}>
          <h6>VENTAS</h6>
          <Col sm="4">
            <Form.Group className="mb-3">
              <Form.Text className="text-muted">Fecha inicial</Form.Text>
              <Form.Control 
              type="date"
              name='fechaInicioVentas'

              onChange={(e) => setVentas(prev => ({
              ...prev,
              filtros: {
                ...prev.filtros,
               fecha: e.target.value
              }}))}
              value={ventas.filtros.fecha}
              style={{fontSize:'0.9rem'}}/>
            </Form.Group>
          </Col>
          {
          mode && <FiltrosMatch 
                accederLogin={accederLogin}
                plantas={plantas}
                setFiltros = {setVentas}
                setVentas = {setVentas}
                setCompras = {setCompras}
                filtros = {ventas}
                />
          }
          <div style={{overflowY:'scroll', maxHeight:'50vh'}}>
            <TablaControl
              cols={["Planta","Factura", "Proveedores", "Fecha", "Scop", "Articulo",  "Cantidad", ""]}
            >
            {!ventas.estado.loading && 
                ventas.data.filter(e => {
                  return (ventas.filtros.planta === 'TODAS') ? true : e.planta === ventas.filtros.planta
                }).filter(e => {
                  return (ventas.filtros.proveedor === 'TODAS') ? true : e.proveedor === ventas.filtros.proveedor
                }).map((value, index) => {

                const mapdata = ventas.data.filter(e => {
                    return (ventas.filtros.planta === 'TODAS') ? true : e.planta === ventas.filtros.planta
                  }).filter(e => {
                    return (ventas.filtros.proveedor === 'TODAS') ? true : e.proveedor === ventas.filtros.proveedor
                  }) 
                let isEqual = false
                if(index >= 1) {
                 isEqual = mapdata[index-1].fact === value.fact
                }
                return ( 
                  <tr key={index} style={{
                      borderTop: `${isEqual && '2px solid #fff'}`,
                    }}>
                    <td>{ !isEqual && value.planta }</td>
                    <td>{ !isEqual ? value.fact : value.fact + ' +'}</td>
                    <td>{ !isEqual && value.proveedor}</td>
                    <td>{ !isEqual && new Date(value.fecha).toLocaleDateString()}</td>
                    <td>{value.nro_scop}</td>
                    <td>{value.articulo}</td>
                    <td>{value.cantidad}</td>
                    <td>
                      {
                      !isEqual &&
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                      }}>
                        <input type='checkbox'
                          name={value.fact}
                          disabled={
                            selectedCompra.length === 0 ? true 
                            : value.cantidad > selectedCompra[0].cantidad ? true
                            : (selectedVenta.length === 0) ? false 
                            : (selectedVenta.reduce((acc, obj) => acc + obj.cantidad, 0) <=
                              selectedCompra[0].cantidad) && (selectedVenta.findIndex(e => e.fact === value.fact) !== -1) ? false 
                            : (selectedVenta.reduce((acc, obj) => acc + obj.cantidad, 0) + value.cantidad) <=
                              selectedCompra[0].cantidad ? false 
                            : true
                          }
                          checked={selectedVenta.findIndex(e => e.fact === value.fact) === -1 ? false : true}
                          onChange={e => handleCheckboxVenta(e, value)}
                          style={{
                          width: '19px',
                          height: '19px'
                        }}/>
                      </div>
                      }
                    </td>
                  </tr>
                )}
              )}
            </TablaControl>
            {ventas.estado.loading && 
              <div style={{
                display: 'flex',
                justifyContent: 'center',
              }}>
                <Spinner animation="border" />
              </div>
            }
            {ventas.estado.empty && 
              <div style={{
                display: 'flex',
                justifyContent: 'center',
              }}>
                <h6>No hay datos de ventas</h6>
              </div>
             }
          </div>
          <div style={{ display: 'flex', maxWidth: '500px', flexDirection: 'column'}}>
          <div>{"selectedVenta :" + JSON.stringify(selectedVenta)}</div>
          <br/>
          <div>{"selectedCompra :" + JSON.stringify(selectedCompra)}</div>
          </div>
        </div>
        <div>
          <h6>COMPRAS</h6>
          <Col sm="4">
            <Form.Group className="mb-3">
              <Form.Text className="text-muted">Fecha inicial</Form.Text>
              <Form.Control 
              type="date"
              name='fechaInicioCompras'

              onChange={(e) => setCompras(prev => ({
              ...prev,
              filtros: {
                ...prev.filtros,
               fecha: e.target.value
              }}))}
              value={compras.filtros.fecha}
              style={{fontSize:'0.9rem'}}/>
            </Form.Group>
          </Col>
          {
          mode && <FiltrosMatch 
                accederLogin={accederLogin}
                setFiltros = {setCompras}
                setCompras = {setCompras}
                setVentas = {setVentas}
                plantas={plantas}
                filtros = {compras}
              />
          }

          <div style={{overflowY:'scroll', maxHeight:'50vh'}}>
            <TablaControl
              cols={["", "Planta", "Factura", "Proveedor", "Fecha",  "Scop", "Articulo", "Cantidad"]}
            >
            {!compras.estado.loading && (
                compras.data.filter(e => {
                  return (ventas.filtros.planta === 'TODAS') ? true : e.planta === ventas.filtros.planta
                }).filter(e => {
                  return (compras.filtros.proveedor === 'TODAS') ? true : e.proveedor === compras.filtros.proveedor
                }).map((value, index) => {
                  const mapdata = compras.data.filter(e => {
                      return (ventas.filtros.planta === 'TODAS') ? true : e.planta === ventas.filtros.planta
                    }).filter(e => {
                      return (compras.filtros.proveedor === 'TODAS') ? true : e.proveedor === compras.filtros.proveedor
                    })
                  let isEqual = false
                  if(index >= 1) {
                   isEqual = mapdata[index-1].fact === value.fact
                  }
                  return (
                    <tr key={index}>
                      <td >
                        {!isEqual && 
                          <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                          }}>
                            <input type='checkbox'
                              name={value.fact}
                              disabled={
                                selectedCompra.length === 0 
                                ? false 
                                : (selectedCompra.findIndex(e => e.fact === value.fact )) === -1 ? true : false
                              }
                              checked={selectedCompra.findIndex(e => e.fact === value.fact) === -1 ? false : true}
                              onChange={e => handleCheckboxCompra(e, value)}
                              style={{
                              width: '19px',
                              height: '19px'
                            }}/>
                          </div>
                        }
                      </td>
                      <td >{ !isEqual && value.planta }</td>
                      <td >{ !isEqual ? value.fact : value.fact + ' +'}</td>
                      <td >{ !isEqual && value.proveedor}</td>
                      <td >{ !isEqual && new Date(value.fecha).toLocaleDateString()}</td>
                      <td >{value.nro_scop_venta}</td>
                      <td >{value.articulo}</td>
                      <td >{value.cantidad}</td>

                    </tr> 
                  )}
                )
              )
            }
            </TablaControl>
            {compras.estado.loading && 
              <div style={{
                display: 'flex',
                justifyContent: 'center',
              }}>
                <Spinner animation="border" />
              </div>
            }
            {compras.estado.empty && 
              <div style={{
                display: 'flex',
                justifyContent: 'center',
              }}>
                <h6>No hay datos de compra</h6>
              </div>
             }
          </div>
        </div>
      </div>
    </div>
    </>
  )
}

export default Match
