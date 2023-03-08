import Cookies  from 'universal-cookie'
const cookies = new Cookies()

export const config = {
    cerrarSesionSalir : ()=> {
        cookies.remove('status')
        localStorage.clear()
    },
    
    cerrarSesion : ()=> {
        cookies.remove('status')
        localStorage.clear()
    },

    iniciarSesion : (token, user, tipoUsuario) =>{
        var fechaH = new Date();
        fechaH.setHours(fechaH.getHours()+1);
        localStorage.setItem('status', true) 
        localStorage.setItem('token',token)
        localStorage.setItem('user',user)
        let encript = btoa(tipoUsuario)
        localStorage.setItem('type',encript)
        cookies.set('status', true,{expires: new Date(fechaH)})
    },

    validarCookies : () =>{
        if(cookies.get('status')){
            return true
        }
    },

    obtenerLocalStorage : () =>{
        const user  =  localStorage.getItem('user')
        const token = localStorage.getItem('token')
        return {user, token}
    },

    obtenerUrlWeb: () => {
        let dominio = document.domain
        if(dominio === "localhost" || dominio === "192.168.1.12"){
            return  "http://192.168.1.12:8084/api"
        }else{
            return  "http://190.116.6.12:8084/api"
        }
    },

    obtenerUrlWebApk: () => {
        let dominio = document.domain
        if(dominio === "localhost" || dominio === "192.168.1.12"){
            return  "http://192.168.1.12:3001"
        }else{
            return  "http://190.116.6.12:3001"
        }
    }

    
}
