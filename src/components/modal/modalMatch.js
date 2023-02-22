import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import allData from '../../img/allData.svg';
import TablaControl from '../table/table';
import FiltroMatch from '../filtros/filtroMatch'
import { apis } from '../../api/apis'
import { config } from '../../config/config'
import {usePlantas} from '../../hooks/usePlantas'
import swal from 'sweetalert';

export const ModalMatch = ({accederLogin}) => {
  const [show, setShow] = useState(false);
  const { plantas } = usePlantas({accederLogin})
  const [match, setMatch] = useState({
    filtros: {
      fecha: '',
      planta: 'TODAS',
      proveedor: 'TODAS'
    },
    data: []
  });

  React.useEffect(() => {
    const {user, token} = config.obtenerLocalStorage()
    
    async function fetchData() {
      try {
        const data = await apis.getMatch('-', '-', '2023-02-10', '2023-02-10', token) 
        setMatch(prev => ({
          ...prev,
          data: data
        }))
      } catch (error) {
        if(error.status === 401) {
          swal("Mensaje", "Tiempo de sesión culminado.", "error")
          config.cerrarSesion()
          this.props.accederLogin(false)
          return
        }
        swal("Mensaje", "Ocurrió un error en la solicitud para la lista de Matchs.", "error")
      }
    }
    fetchData()
  }, [show]) 

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button variant="primary" onClick={handleShow}>
        <img src={allData} width='22' alt='enlazados'/>
      </Button>

      <Modal size='xl' show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Articulos Enlazados</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div style={{display: 'flex', gap:'30px', justifyContent: 'center'}}>
            <TablaControl
              cols={["Planta","Proveedor", "Fact", "Planta - Compra", "Proveedor - Compra", "Fact - Compra", "Match", ""]}
              mode={false}
            > 
              {match.data.map((value, index) => {
              const fact = value.id_tipo_doc.substring(1,0) + value.serie.substring(1) + "-" + value.nro_documento
              const factCompra = value.id_tipo_doc_pur.substring(1,0) + value.serie_pur.substring(1) + "-" + value.nro_documento_pur
              return(
                <tr key={index}>
                  <td>{value.planta}</td>
                  <td>{value.proveedor}</td>
                  <td>{fact}</td>
                  <td>{value.planta_pur}</td>
                  <td>{value.proveedor_pur}</td>
                  <td>{factCompra}</td>
                  <td>{value.flag_automatic_match === "1" ? 'A' : 'M'}</td>
                  <td>
                    <input type='checkbox'/>
                  </td>
                </tr>
              )})
              }
            </TablaControl>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Save Changes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
