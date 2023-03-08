
export const ParseFactCompra = (value) => { 
  const fact = value.id_tipo_doc.substring(1,0) + value.serie_doc.substring(1) + "-" + value.nro_doc
  return fact
}

export const ParseFactVenta = (value) => {
  const fact = value.id_tipo_doc.substring(1,0) + value.serie.substring(1) + "-" + value.nro_documento
  return fact
}
