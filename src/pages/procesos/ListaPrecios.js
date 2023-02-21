import ExcelJS from 'exceljs'
import React from "react"
import { Button, Col, Form, Spinner } from "react-bootstrap"
import swal from "sweetalert"
import { apis } from "../../api/apis"
import { config } from "../../config/config"
import Header from '../../components/header/header'

const ListaPrecios = ({ accederLogin }) => {
  const [userL, setUser] = React.useState({
    token: "",
    username: ""
  })
  const [btn, setBtn] = React.useState({
    state: false,
    value: "cargar"
  })
  const [excel, setExcel] = React.useState({
    file: null,
    rows: 0,
    size: 0,
  })

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

  const handleSubmit = async (e) => {
    e.preventDefault()
    if(excel.file){
      try{

        const datos = await readExcel(excel.file)

        sendData(datos)

      }catch(err) {
        console.log(err)
        throw await swal("Mensaje", "No se puede leer el archivo .xlsx", "error")
      }
    }else{
      await swal("no se obtuvo ni un archivo")
    }

  }

  const readExcel = (file) => {
    return new Promise((resolve, reject) => {
      // cambiar estado del botom
      setBtn( prevBtn => ({
        ...prevBtn,
        state: true
      }))

      const wb = new ExcelJS.Workbook()
      const reader = new FileReader()
      reader.readAsArrayBuffer(file)

      reader.onload = async () => {
        const precios = []
        const buffer = reader.result
        try {
          const workbook = await wb.xlsx.load(buffer)
          workbook.eachSheet((sheet, _id) => {
            let productos = []
            let plantas = []
            sheet.eachRow({ includeEmpty: false }, (row, _rowIndex) => {
              // parse row to object 
              if (_rowIndex === 2) {
                productos =  row.values.slice(3)
              }
              if (_rowIndex >= 3 ){
                plantas.push(row.values[1])
                const objt = parseRowToObject(row.values,plantas, _rowIndex - 3, productos)
                precios.push(...objt)
              }
              setExcel(prev => {
                return {
                ...prev,
                rows: _rowIndex,
                size: precios.length
              }})
            })
          })
          resolve(precios)
        } catch (error) {
          console.log(error) 
          throw swal("Mensaje", "No se puede leer el archivo .xlsx", "error");
        }
      }
    })
  }

  const parseRowToObject = (precios, plantas, rowIndex, productos) => {
    let temp = [] 
    // set object "e" in result   
    precios = precios.slice(3).map( e => {
      if (typeof e == "object") {
        e = e.result
      }
      return e
    });

    productos.forEach((prod, index) => {
      if (!(precios[index] === 0 || !precios[index])) {
        temp.push({
          precio: precios[index],
          precio_base: null ,
          id_planta: plantas[rowIndex],
          id_lista_precio: null,
          id_articulo:  prod,
          id_estado: '01',
        })
      }
    })
    return temp
  } 

  const sendData = (data) => {
    setTimeout(async () => {
      console.log("")
      // const peticion  = await apis.grabarListaPrecios(userL.token, data)
      // console.log(peticion.status)
      // if(!peticion.ok){
      //   if(peticion.status === 401) {
      //     await swal("Mensaje", "Tiempo de sesión culminado.", "error")
      //     config.cerrarSesion()
      //     this.props.accederLogin(false)
      //     return
      //   }
      //   if(!config.validarCookies()){
      //       await swal("Mensaje", "Tiempo de sesión culminado.", "error")
      //       config.cerrarSesion()
      //       this.props.accederLogin(false)
      //       return
      //   }
      //   await swal("Mensaje","Ocurrió un error con la solicitud para guardar la lista de precios", "error")
      // }
      setBtn(prevBtn => ({
        ...prevBtn,
        state: false
      }))
      // ver estado actualizado 
      setExcel((prev) => {
        swal("Mensaje", `se migraron "${prev.rows}" lineas (${prev.size}) `, "success")
        return prev
      })
    }, 250)
  }

  return (
    <>
      <Header nombre={userL.username} accederLogin={accederLogin}/>
      <div style={{
        position: 'relative',
        margin: 20,
        maxWidth: '1000px',
        boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.15)',
      }}>
        <Col className={'p-3'}>
          <h4 className={'mb-3'}>Lista de Precios</h4>
          <Form 
            onSubmit={handleSubmit}
            className={"d-flex"} id="form_XLSX"
            style={{
              alignItems: 'center',
              display: 'flex' ,
              "flexWrap": "no-wrap"
            }}
          >
            <div className="input-group">
              <input 
                type="file" 
                className='form-control'
                onChange={e =>  {
                  setExcel(prev => ({
                    ...prev,
                    file: e.target.files[0]
                  }))
                }} 
                accept=".xlsx, .xls"/>                       
            </div>
            <div 
            style={{display: 'flex', gap: 20}}
            >
              {
                btn.state
                ? 
                <div className="btn bg-primary rounded ms-3">
                  <Spinner animation="border" variant="light" style={{
                    width:'1em', height:'1em',
                  }}/>
                </div> 
              : <Button 
                  type='submit'
                  style={{
                    margin: "0 0 0 20px",
                  }} 
                  disable={btn.state.toString()}
                  >
                    {btn.value}
                </Button>
                }
              <Button 
                type="reset"
              >Limpiar</Button>
            </div>

          </Form>
        </Col>
      </div>
    </>
  )
}

export default ListaPrecios