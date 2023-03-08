import {config} from '../config/config'
var url = config.obtenerUrlWebApk()

export const app = {
    convertirAppDescarga : async (file, name) => {
        const blob = await fetch(file).then(r => r.blob()).catch(err => console.log(err))
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = name+'.apk'
        console.log({hola: a.download})
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
    },
    appClientes:{
        version: '1.0.9',
        apk: `${url}/appClientes.apk`,
        fecha: '15/12/2022'
    },
    appTransacciones:{
        version: '1.0.5',
        apk: `${url}/appTransacciones.apk`,
        fecha: '15/12/2022'
    }
}