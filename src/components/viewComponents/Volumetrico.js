import React from 'react'
import { Form, Spinner, Table, Button } from 'react-bootstrap'

import moment from 'moment'

export const Volumetrico = ({documentos, buscador, estado_carga, origen, cantidadTotalVolumetrico, cantidadVolumProv, abrirEstadoModal, ingresarDatosProv = '', alterarCampos = '', contarCantidadVolumetricoProv = ''} = this.props) => {
    
    let nro = 1
    let repetidor = ''

  return (
    <Table  bordered size="md"  style={{width:'100%', fontSize:'0.8rem'}} >
        <thead style={{position:'sticky', top:'0px', background:'white', boxShadow: '0px 0px 1px black'}}>
            <tr>
                <th style={{background:'#0d6efd', color:'white'}}>#</th>
                {
                    (origen === 'reporte') && <th style={{background:'#0d6efd', color:'white'}}>Proveedor</th>
                }
                <th style={{background:'#0d6efd', color:'white'}}>Planta</th>
                <th style={{background:'#0d6efd', color:'white', minWidth:'70px'}}>Tpo Doc</th>
                <th style={{background:'#0d6efd', color:'white'}}>Serie</th>
                <th style={{background:'#0d6efd', color:'white', minWidth:'80px'}}>Nro Doc</th>
                <th style={{background:'#0d6efd', color:'white'}}>Fecha</th>
                <th style={{background:'#0d6efd', color:'white', minWidth:'80px'}}>Fecha OE</th>
                <th style={{background:'#0d6efd',color:'white'}}>SCOP</th>
                <th style={{background:'#0d6efd', color:'white', minWidth:'100px'}}>Articulo</th>
                <th style={{background:'#0d6efd', color:'white'}}>Unidad</th>
                <th style={{background:'#0d6efd', color:'white'}}>Cantidad</th>
                <th style={{background:'#0d6efd', color:'white', minWidth:'120px'}}>Cond. Pago Prov.</th>
                <th style={{background:'#8946A6', color:'white', maxWidth:'80px'}}>Cantidad Prov.</th>
                <th style={{background:'#8946A6', color:'white', maxWidth:'80px'}}>Serie Prov.</th>
                <th style={{background:'#8946A6', color:'white', maxWidth:'80px'}}>Nro. Doc. Prov.</th>
                <th style={{background:'#8946A6', color:'white', maxWidth:'115px'}}>Scop Prov.</th>
                <th style={{background:'#8946A6', color:'white'}}>Obs. Prov.</th>
            </tr>
        </thead>
        <tbody>
        {
            (estado_carga)
                ?   <tr>
                        <td  colSpan={16} align='center'>
                            <Spinner animation="grow"/>
                        </td>
                    </tr>
                :   documentos.filter(values => values.nro_documento.indexOf(buscador) !== -1).map((value, index)=>
                        <tr key={index}
                            style={{backgroundColor: (value.id_estado_doc === '02')
                                                        ?   '#80808029'
                                                        :   'white' }}
                        >
                            {
                                (repetidor !== value.nro_documento)
                                    ?   <td>{nro}</td>
                                    :   (   
                                            <>
                                                <td hidden>{nro--}</td>
                                                <td>{nro}</td>
                                            </>
                                        )
                            }
                            {
                                (origen === 'reporte') &&   <td>
                                                                {
                                                                    value.proveedor.substring(14,value.proveedor.length)
                                                                }
                                                            </td>
                            }
                            <td>{value.planta}</td>
                            <td>{value.id_tipo_doc}</td>
                            <td>{value.serie}</td>
                            <td>{value.nro_documento}</td>
                            <td>{moment(value.fecha).format("DD/MM/YYYY")}</td>
                            <td>{moment(value.fecha_oe).format("DD/MM/YYYY")}</td>
                            <td>{value.nro_scop}</td>
                            <td>{value.articulo}</td>
                            <td>{value.id_unidad}</td>
                            <td>{value.cantidad_fac}</td>
                            <td>
                                {(origen === 'reporte' || value.id_estado_doc === '02')
                                    ?   value.condicion_pago_prov || ''
                                    :   <Form.Select aria-label="Default select example" value={value.condicion_pago_prov || ''} name="condicion_pago_prov" style={{fontSize:'0.9rem'}}  
                                            onChange={(e)=>{ingresarDatosProv(e.target.value, value, e.target.name)}}>
                                            <option value="">Seleccionar..</option>
                                            <option value="CONTADO">Contado</option>
                                            <option value="CREDITO">Credito</option>
                                        </Form.Select>
                                        
                                }
                            </td>
                            <td>
                                {(origen === 'reporte')
                                    ?   value.volumetric || ''
                                    :   <input type="number" 
                                            name="volumetric"
                                            style={{color: (value.volumetric || '').toString() === value.cantidad_fac.toString() ? 'black' : 'red', maxWidth:'80px'}} 
                                            value={value.volumetric || ''} 
                                            pattern={[0-9]} 
                                            onBlur={(e)=>{contarCantidadVolumetricoProv()}}
                                            onChange={(e)=>{ingresarDatosProv(e.target.value, value, e.target.name)}}/>
                                }
                            </td>
                            <td>
                                {(origen === 'reporte')
                                    ?   value.serie_prov || ''
                                    :   <input type="text" 
                                            name="serie_prov"
                                            style={{maxWidth:'80px'}}
                                            value={value.serie_prov || ''} 
                                            maxLength='4'
                                            onBlur={(e)=>{alterarCampos(e.target.value, value, e.target.name, 4)}}
                                            onChange={(e)=>{ingresarDatosProv(e.target.value, value, e.target.name)}}/>
                                }
                            </td>
                            <td>
                                {(origen === 'reporte')
                                    ?   value.nro_documento_prov || ''
                                    :   <input type="number" 
                                            name="nro_documento_prov"
                                            style={{maxWidth:'80px'}}
                                            value={value.nro_documento_prov || ''} 
                                            maxLength='8'
                                            onBlur={(e)=>{alterarCampos(e.target.value, value, e.target.name, 8)}}
                                            onChange={(e)=>{ingresarDatosProv(e.target.value, value, e.target.name)}}/>
                                }
                            </td>
                            <td>
                                {(origen === 'reporte')
                                    ?   value.nro_scop_prov || ''
                                    :   <input type="number" 
                                            name="nro_scop_prov"
                                            style={{maxWidth:'115px', color: (value.nro_scop_prov || '').toString().length < 11 ? 'red' : 'black'}}
                                            value={value.nro_scop_prov || ''} 
                                            pattern={[0-9]} 
                                            onChange={(e)=>{ingresarDatosProv(e.target.value, value, e.target.name)}}/>
                                }
                            </td>
                            <td style={{textAlign:'center'}}>
                                {(origen === 'reporte')
                                    ?   (value.observacion_prov) && <Button type="button" 
                                                                        style={{
                                                                            background: '#8946a6' , 
                                                                            border: '1px solid rgb(85 29 108)'
                                                                        }} 
                                                                        size="sm" 
                                                                        onClick={()=>abrirEstadoModal(value.observacion_prov)}>
                                                                        Ver
                                                                    </Button>
                                    :   <Button type="button" 
                                            style={{
                                                background: !value.observacion_prov ? '#8946a6' : '#FC4F4F', 
                                                border: !value.observacion_prov ? '1px solid rgb(85 29 108)' : '1px solid #B33030'
                                            }} 
                                            size="sm" 
                                            onClick={()=>abrirEstadoModal(value.pk, value.observacion_prov)}>
                                            Comentario
                                        </Button>
                                }
                            </td>
                            <td hidden>{nro++}</td>
                            <td hidden>{repetidor = value.nro_documento}</td>
                        </tr>
                    )
        }
        </tbody>
        {
            (documentos.length > 0) &&  <tbody  className='rendisajes' style={{position:'sticky', bottom:'0px', background:'white', boxShadow: '0px 0px 1px black'}}>
                                            <tr>
                                                <td colSpan={10}></td>
                                                {(origen === 'reporte')
                                                    ?   
                                                        <>
                                                            <td></td>
                                                            <td style={{color:'rgb(13, 110, 253)', fontWeight:'bold'}}>{cantidadTotalVolumetrico}</td>
                                                        </>
                                                    :   <td style={{color:'rgb(13, 110, 253)', fontWeight:'bold'}}>{cantidadTotalVolumetrico}</td>   
                                                }
                                                <td></td>
                                                <td style={{color:'rgb(137, 70, 166)', fontWeight:'bold'}}>{cantidadVolumProv}</td>
                                                <td colSpan={4}></td>
                                            </tr>
                                        </tbody>
        }
    </Table>
  )
}
