import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import allData from '../../img/allData.svg';
import TablaControl from '../table/table';
import FiltroMatch from '../filtros/filtroMatch'
import { apis } from '../../api/apis'
import { config } from '../../config/config'
import {usePlantas} from '../../hooks/usePlantas'

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
    //getMatch: async (idProveedor, idPlanta, fechaInicial, fechaFinal,token) => {
    async function fetchData() {
      const data = await apis.getMatch('-', '-', '2023-02-10', '2023-02-10', token) 
      setMatch(prev => ({
        ...prev,
        data: data
      }))
    }
    fetchData()
  }, []) 

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
              cols={["Planta","Proveedor", "Fact"]}
              mode={false}
            > 
              {match.data.map((value, index) => {
              const fact = value.id_tipo_doc.substring(1,0) + value.serie.substring(1) + "-" + value.nro_documento
              return(
                <tr key={index}>
                  <td>{value.planta}</td>
                  <td>{value.proveedor}</td>
                  <td>{fact}</td>
                </tr>
              )})
              }
            </TablaControl>
            <TablaControl
              cols={["Planta","Proveedor", "Fact"]}
              mode={false}
            > 
              {match.data.map((value, index) => {
              const fact = value.id_tipo_doc_pur.substring(1,0) + value.serie_pur.substring(1) + "-" + value.nro_documento_pur
              return(
                <tr key={index}>
                  <td>{value.planta_pur}</td>
                  <td>{value.proveedor_pur}</td>
                  <td>{fact}</td>
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
