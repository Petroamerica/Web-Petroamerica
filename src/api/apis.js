import {optionFetch} from './optionFetch'
import {config} from '../config/config'

const {optionGet, optionPost, optionPut} = optionFetch()

var url = config.obtenerUrlWeb()

export const  apis = {
    login : async (data)=> {
        try{
            const headers = new Headers();
            headers.append('Content-Type', 'application/json');
            const solicitud = await fetch(`${url}/login`, {method: 'POST', headers: headers, body:JSON.stringify(data)})
            const res = await solicitud.json()
            return res
        }catch(err){
            return {error: 'Ocurrió un error en el login.'}
        }
    },

    /*MATCH SERVICEs*/
    postMatch: (token, data) => {
      return fetch(`${url}/Docs_sale_purchase`, {
        method: 'POST', 
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
    },

    deleteMatch: (ID_PLANTA, ID_TIPO_DOC, SERIE, NRO_DOCUMENTO, ID_PLANTA_PUR, ID_PROVEEDOR_PUR, ID_TIPO_DOC_PUR, SERIE_DOC_PUR, NRO_DOC_PUR, token) => { return fetch(`${url}/Docs_sale_purchase/${ID_PLANTA}/${ID_TIPO_DOC}/${SERIE}/${NRO_DOCUMENTO}/${ID_PLANTA_PUR}/${ID_PROVEEDOR_PUR}/${ID_TIPO_DOC_PUR}/${SERIE_DOC_PUR}/${NRO_DOC_PUR}`, {
        method: 'DELETE', 
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
      })
    },
 
    getMatch: (idProveedor, idPlanta, fechaInicial, fechaFinal, token) => {
      return fetch(`${url}/Docs_sale_purchase/${fechaInicial}/${fechaFinal}/${idPlanta}/${idProveedor}`, {
        method: 'GET', 
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }).then(res => {
        return res.json()
      })
    },

    getVentas: async (articulo, idProveedor, idPlanta, fechaInicial, fechaFinal,token) => {
      try{
          const solicitud = await fetch(`${url}/Documento/sales/${fechaInicial}/${fechaFinal}/${idPlanta}/${idProveedor}/${articulo}`, optionGet(token))
          const res = await solicitud.json()
          return res
      }catch(err){
        return {error: 'Ocurrió un error en la solicitud para la lista de Ventas.'}
      }
    },

    getCompras: async (articulo, idProveedor, idPlanta, fechaInicial, fechaFinal,token) => {
      try{
          const solicitud = await fetch(`${url}/Docs_Purchase/${fechaInicial}/${fechaFinal}/${idPlanta}/${idProveedor}/${articulo}`, optionGet(token))
          const res = await solicitud.json()
          return res
      }catch(err){
        console.log(err)
          return {error: 'Ocurrió un error en la solicitud para la lista de Compras.'}
      }
    },

    getProveedoresBase: async (token) => {
      try{
          const solicitud = await fetch(`${url}/proveedor`, optionGet(token))
          const res = await solicitud.json()
          return res
      }catch(err){
          return {error: 'Ocurrió un error en la solicitud para la lista de Estaciones Propios.'}
      }
    },
  
    getPlantas: async (token) => {
      try{
          const solicitud = await fetch(`${url}/planta`, optionGet(token))
          const res = await solicitud.json()
          return res
      }catch(err){
          return {error: 'Ocurrió un error en la solicitud para la lista de Estaciones Propios.'}
      }
    },

    /*ESTACIONES PROPIAS*/
    eePropio: async (usuario, token) =>{
        try{
            const solicitud = await fetch(`${url}/cliente/${usuario}`, optionGet(token))
            const res = await solicitud.json()
            return res
        }catch(err){
            return {error: 'Ocurrió un error en la solicitud para la lista de Estaciones Propios.'}
        }
    },
    puntosVenta: async (usuario, id_cliente, token) =>{
        try{
            const solicitud = await fetch(`${url}/PuntoVenta/${usuario}/${id_cliente}`, optionGet(token))
            const res = await solicitud.json()
            return res
        }catch(err){
            return {error: 'Ocurrió un error en la solicitud para la lista de Punto de Venta.'}
        }
    },
    documento: async (fechaI, fechaF, id_cliente, ptoVenta, usuario, token) =>{
        try{
            const solicitud = await fetch(`${url}/documento/${fechaI}/${fechaF}/${id_cliente}/${ptoVenta}/${usuario}`, optionGet(token))
            const res = await solicitud.json()
            return res
        }catch(err){
            return {error: 'Ocurrió un error con la solicitud para la lista de Documentos.'}
        }
    },
    documento_put: async (token, data) =>{
        try{
            const solicitud = await fetch(`${url}/documento`, optionPut(token, data))
            return solicitud
        }catch(err){
            return {error: 'Ocurrió un error con la solicitud para guardar el registro.'}
        }
    },
    docSinValidar: async(usuario,token) =>{
        try{
            const sinValidar = await fetch(`${url}/docs_sin_validar/${usuario}`, optionGet(token))
            const res = await sinValidar.json()
            return res
        }catch(err){
            return {error: 'Ocurrió un error en la solicitud para los documentos sin validar.'}
        }
    },

    /*VOLUMETRICO*/
    planta: async (token, id_cia, id_use = '') =>{
        try{
            const solicitud = await fetch(`${url}/planta/${id_cia}/${id_use}`, optionGet(token))
            const res = await solicitud.json()
            return res
        }catch(err){
            return {error: 'Ocurrió un error en la solicitud para las plantas.'}
        }
    },
    proveedor: async (token, id_cia, fecha1, fecha2, id_tipo, id_planta, id_usuario) =>{
        try{
      console.log(`${url}/proveedor/${id_cia}/${fecha1}/${fecha2}/${id_tipo}/${id_planta}/${id_usuario}`)
            const solicitud = await fetch(`${url}/proveedor/${id_cia}/${fecha1}/${fecha2}/${id_tipo}/${id_planta}/${id_usuario}`, optionGet(token))
            const res = await solicitud.json()
            return res
        }catch(err){
            return {error: 'Ocurrió un error en la solicitud para los proveedores.'}
        }
    },
    documentosVolumetrico: async (token, id_cia, fecha, fecha2, tipo, id_planta, id_proveedor, id_usuario) =>{
        try{
            const solicitud = await fetch(`${url}/volumetrico/${id_cia}/${fecha}/${fecha2}/${tipo}/${id_planta}/${id_proveedor}/${id_usuario}`, optionGet(token))
            const res = await solicitud.json()
            return res
        }catch(err){
            return {error: 'Ocurrió un error en la solicitud de los documentos del Volumetrico.'}
        }
    },

    grabarVolumetrico: async (token, data) =>{
        try{
            const solicitud = await fetch(`${url}/volumetrico`, optionPut(token, data))
            return solicitud
        }catch(err){
            return {error: 'Ocurrió un error con la solicitud para guardar el volumetrico.'}
        }
    },

    grabarDescuento: async (token, data) => {
        try{

            const headers = new Headers()
            headers.append('Content-Type', 'application/json');
            headers.append('Authorization', 'Bearer '+token)

            const solicitud = await fetch(`${url}/Discount`, {
                method: 'POST', 
                headers: headers,
                body: JSON.stringify(data)
            })
            return solicitud
        }catch(err){
            return {error: 'Ocurrió un error con la solicitud para guardar descuentos.'}
        }
    },

    grabarListaPrecios: async (token, data) => {
        try{

            const headers = new Headers()
            headers.append('Content-Type', 'application/json');
            headers.append('Authorization', 'Bearer '+token)
            // TODO : endpoint
            const solicitud = await fetch(`${url}/`, {
                method: 'POST', 
                headers: headers,
                body: JSON.stringify(data)
            })
            return solicitud
        }catch(err){
            return {error: 'Ocurrió un error con la solicitud para guardar la lista de precios.'}
        }
   },

    //APP
    validarUsuario: async(token, data) => {
        try{
            const {status} = await fetch(`${url}/login/Basic`, optionPost(token, data))
            return {res: status}
        }catch(err){
            return {res: 401}
        }
    },

}
