import { useEffect, useState } from "react"
import swal from "sweetalert"
import { apis } from "../api/apis"
import { config } from "../config/config"

export const usePlantas = ({accederLogin}) => {
  const [plantas, setPlantas] = useState([])
  const {user, token} = config.obtenerLocalStorage()

  useEffect(() => {
    (async () => {
      const plantas = await apis.getPlantas(token)
      if(plantas.error){
        if(!config.validarCookies()){
          await swal("Mensaje", "Tiempo de sesión culminado.", "error")
          config.cerrarSesion()
          accederLogin(false)
        }
        await swal("Mensaje", plantas.error , "error")
        return
      }
      plantas.unshift({id_planta: '-', descripcion: 'TODAS'})
      setPlantas(plantas)
    })()
  },[user,token, accederLogin])
 

  return {
    plantas
  }
}
