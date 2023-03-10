import React from 'react'
import { Table } from "react-bootstrap"

const TablaControl = ({cols, children }) => {

  return (
    <Table  bordered size="md" responsive style={{ 
      fontSize:'0.8rem',
      minWidth: '500px',
      maxWidth: '700px'
    }} >
      <thead style={{
        //width:'100%',
        //position:'fixed'
      }}>
        <tr>
          {cols.map((value, index) => (
            <th key={value} scope='col'>{ value }</th>
          ))}
        </tr>
      </thead>
      <tbody style={{
      }}>
        { children }
      </tbody>
    </Table>
  )
}

export default TablaControl
