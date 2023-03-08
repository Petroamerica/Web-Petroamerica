import { useEffect, useState } from "react"
import swal from "sweetalert"
import { apis } from "../api/apis"
import { config } from "../config/config"

export const useProveedores = ({accederLogin}) => {
  const [proveedores, setProveedores] = useState([])
  const {user, token} = config.obtenerLocalStorage()

  useEffect(() => {
    (async () => {
      const prov = await apis.getProveedoresBase(token)
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
  },[user,token, accederLogin])

  return {
    proveedores, setProveedores
  }
}
