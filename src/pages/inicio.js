import React, { Component } from 'react'
import Header from '../components/header/header'
import {config} from '../config/config'
import fondo from '../img/fondo.png'

export default class inicio extends Component {
    state={
        user: ''
    }

    componentDidMount(){
        const {user} = config.obtenerLocalStorage()
        if(user){
            this.setState({user})
        }else{
            config.cerrarSesion() 
            this.props.accederLogin(false)
            return
        }
    }

    render() {
        const {accederLogin} = this.props 
        return (
            <>
                <Header nombre={this.state.user} accederLogin={accederLogin}/> 
                <img alt="logo" src={fondo} className="fondoLogo"/>
            </>
        )
    }
}
