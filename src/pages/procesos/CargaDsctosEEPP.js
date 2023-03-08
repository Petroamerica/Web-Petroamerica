import { Component } from "react"
import moment from "moment"
import { Button, Col, Form, Spinner } from "react-bootstrap"
import swal from "sweetalert"
import { config } from '../../config/config'
import Header from '../../components/header/header'
import ExcelJS from 'exceljs'
import { apis } from "../../api/apis"

export default class CargaDsctoEepp extends Component {

  state = {
    filas: 0,
    size: 0,
    user: '',
    token: '',
    file: '',
    btnValue: 'Cargar',
    btnState: false,
    cargaState: false,
    descuentos: []
  }

  async componentDidMount() {
    const {user, token} = config.obtenerLocalStorage()
    if(user && token){
      this.setState({user, token})

    }else{
      await swal("Mensaje", 
      "No se encontraron las credenciales para acceder a la web 'CARGA DESCUENTO EEPP' .\nSalir y volver a ingresar."
      ,"error")
      return
    }
    if(!config.validarCookies()){
        await swal("Mensaje", "Tiempo de sesión culminado.", "error")
        config.cerrarSesion()
        this.props.accederLogin(false)
    }
  }

  onsubmit = async (e) => {
    e.preventDefault()
    if(this.state.file){
      const file = await this.state.file.target.files[0]
      try{
        const data = await this.readExcel(file)
        console.log(data)
        this.setState({btnState: true})
        this.setState({size: data.length})
        this.sendData(data)

      }catch(err) {
        console.log(err)
        throw await swal("Mensaje", "No se puede leer el archivo .xlsx", "error")
      }
    }else{
      await swal("no se obtuvo ni un archivo")
    }
  }

  readExcel = (file) =>{

    return new Promise((resolve, reject) => {
      this.setState({cargaState: true})

      let artGrupo
      const wb = new ExcelJS.Workbook()

      const reader = new FileReader()

      reader.readAsArrayBuffer(file)

      reader.onload = async () => {
        const descuentos = []
        const buffer = reader.result
        try {
          const workbook = await wb.xlsx.load(buffer)
          workbook.eachSheet((sheet, _id) => {
            // solo la hoja 1 del excel | cambiar el number para seleccionar la hoja del excel
            if(sheet.id === 1) {
              sheet.eachRow({ includeEmpty: false }, (row, _rowIndex) => {

                if( row.number === 2 ) {
                  artGrupo = row.values.slice(10)
                }
                if( row.number > 2) {
                  const parseRow = this.parseRow(row.values)
                  const factoresIgv = parseRow.slice(10)

                  factoresIgv.forEach((val, index) => {
                    if (val === 'SP') { return }
                    const descuento = {
                      fecha_ini: moment().format('YYYY-MM-DD'),
                      fecha_fin: moment(new Date()).endOf("year").format('YYYY-MM-DD'),
                      id_moneda: '01',
                      factor_con_igv: String(val),
                      id_condicion_pago: parseRow[4],
                      id_cliente: String(parseRow[2]).slice(0,6),
                      id_punto_venta: String(parseRow[2]),
                      id_planta: String(parseRow[5]),
                      id_almacen: String(parseRow[8]),
                      id_articulo_grupo: artGrupo[index],
                      id_estado: '01', 
                      usuario_sistema: this.state.user.toUpperCase(),
                    }
                    descuentos.push(descuento)
                  })
                }
                this.setState({filas: this.state.filas+1})
              })
            }
          })
          resolve(descuentos)
        } catch (error) {
          console.log(error) 
          throw swal("Mensaje", "No se puede leer el archivo .xlsx", "error");
        }
        // this.sendData(descuentos)
      }
    })
  }

  sendData = async (descuentos) => {
    setTimeout(async () => {
      const peticion  = await apis.grabarDescuento(this.state.token, descuentos)
      console.log(peticion.status)

      if(!peticion.ok){
        if(peticion.status === 401) {
          await swal("Mensaje", "Tiempo de sesión culminado.", "error")
          config.cerrarSesion()
          this.props.accederLogin(false)
          return
        }
        await swal("Mensaje","Ocurrió un error con la solicitud para guardar descuentos", "error")
      }

      this.setState({cargaState: false})
      this.setState({btnState: false})
      swal("mensaje", `se migraron "${this.state.filas}" lineas (${this.state.size}) `, "success")
    }, 250)
  }

  splitArray = (flatArray, numCols) => {
    const newArray = []
    for (let c = 0; c < numCols; c++) {
      newArray.push([])
    }
    for (let i = 0; i < flatArray.length; i++) {
      const mod = i % numCols
      newArray[mod].push(flatArray[i])
    }
    return newArray
  }
  
  parseRow = (row) => {
    return row.map(e => {
      try {
        if (typeof e == "object" ) {
          e = e.result
        }
        if (e === undefined){
          e = '0.00'
        } 
      } catch (err) {
        throw swal("Mensaje", "No se puede parsear el archivo .xlsx, intentelo denuevo", "error");
      }
      return e
    })
  }

  render(){
    const {accederLogin} = this.props
      return ( 
        <>
          <Header nombre={this.state.user} accederLogin={accederLogin}/>
          <div style={{
            position: 'relative',
            margin: 20,
            maxWidth: '1000px',
            boxShadow: '0px 0px 8px 0px rgba(0,0,0,0.15)',
          }}>
            <Col>
              <Form 
                onSubmit={(e)=>this.onsubmit(e)} 
                className={"p-3 d-flex"} id="form_XLSX"
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
                    onChange={e => this.setState({file: e})} 
                    accept=".xlsx, .xls"/>                       
                </div>
                <div 
                style={{display: 'flex', gap: 20}}
                >
                  {
                  this.state.cargaState
                    ? 
                    <div className="btn bg-primary rounded">
                      <Spinner animation="border" variant="light" style={{width:'1em', height:'1em'}}/>
                    </div> 
                  : <Button 
                      type='submit'
                      style={{
                        margin: "0 0 0 20px",
                      }} 
                      disable={this.state.btnState.toString()}
                      >
                        {this.state.btnValue}
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
}