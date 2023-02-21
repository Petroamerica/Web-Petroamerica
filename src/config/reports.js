import ExcelJS from 'exceljs'
import moment from 'moment'

export const exportar = {
    reporteXlsx_EESS : (tabla, filtro, rs, pv) =>{
        setTimeout(async ()=>{
            const workbook = new ExcelJS.Workbook();
            workbook.addWorksheet("reporte");
            const worksheet = workbook.getWorksheet("reporte");
            worksheet.columns = [ 
                { width: 12 }, 
                { width: 12 }, //FECHA
                { width: 15 }, //PLANTA
                // { width: 40 }, //CLIENTE EEPP
                { width: 40 }, //PUNTO DE VENTA
                { width: 20 }, //DOCUMENTO
                { width: 17 }, //NRO SCOP
                { width: 13 }, //TOTAL DOC
                { width: 10 }, //ITEM
                { width: 25 }, //ARTICULO
                { width: 13 }, //CANTIDAD
                { width: 16 }, //PRECIO SIN IGV
                { width: 13 }, //PRECIO TOTAL DEL ARTICULO
                { width: 13 }, //PERCEPCION
                { width: 35 }, // CHOFER
                { width: 18 }, // PLACA
                { width: 40 },    //COMENTARO
            ];

            let columnas = 'ABCDEFGHIJKLMNOPQRSTUVXYZ';
            let titulos = [ 'Fecha', 'Planta',  'Punto de Venta EEPP (Grifo)', 'Documento', 'Nro de Scop', 'Total Doc S./', 'Item', 'Articulo', 'Cantidad', 'Prec. Unit. c/igv', 'Total Item','Percepción', 'Chofer', 'Placa','Comentario' ]
            let detalle = 11
            let repetidor = ''

            worksheet.getCell('B2').value = 'REPORTE DE DOCUMENTOS DE VENTA ESTACIONES PROPIAS'
            worksheet.getCell('B2').font = {bold:true};

            // worksheet.getCell('B4').value = 'Cliente EEPP (Razón Social)'
            // worksheet.getCell('B4').font = {bold:true};
            // worksheet.getCell('D4').value = rs || ''

            worksheet.getCell('B4').value = 'Punto de Venta EEPP (Grifo)'
            worksheet.getCell('B4').font = {bold:true};
            worksheet.getCell('D4').value = pv || ''

            worksheet.getCell('B5').value = 'Fecha Inicial'
            worksheet.getCell('B5').font = {bold:true};
            worksheet.getCell('D5').value =  moment(filtro.fecha_i).format("DD/MM/YYYY")

            worksheet.getCell('B6').value = 'Fecha Final'
            worksheet.getCell('B6').font = {bold:true};
            worksheet.getCell('D6').value = moment(filtro.fecha_f).format("DD/MM/YYYY")

            for (let index = 0; index < titulos.length; index++) {
                worksheet.getCell(columnas.charAt(index+1)+'10').value = titulos[index]
                worksheet.getCell(columnas.charAt(index+1)+'10').font = {bold:true};
                worksheet.getCell(columnas.charAt(index+1)+'10').border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
                worksheet.getCell(columnas.charAt(index+1)+'10').alignment = { vertical: 'middle', horizontal: 'center' };
            }

            for (let index = 0; index < tabla.length; index++) {
                if(repetidor !== tabla[index].pk){
                    worksheet.getCell('B'+detalle).value = moment(tabla[index].fecha).format("DD/MM/YYYY")
                    worksheet.getCell('C'+detalle).value = tabla[index].planta
                    // worksheet.getCell('D'+detalle).value = tabla[index].cliente
                    worksheet.getCell('D'+detalle).value = tabla[index].punto_venta
                    worksheet.getCell('E'+detalle).value = `${tabla[index].id_tipo_doc.substring(0,1)}${tabla[index].serie}-${tabla[index].nro_documento}`
                    worksheet.getCell('E'+detalle).alignment = { vertical: 'middle', horizontal: 'center' };
                    worksheet.getCell('F'+detalle).value = tabla[index].nro_scop
                    worksheet.getCell('F'+detalle).alignment = { vertical: 'middle', horizontal: 'center' };

                    worksheet.getCell('G'+detalle).value = new Intl.NumberFormat("en-us", { maximumFractionDigits: 4 }).format(tabla[index].total)
                    worksheet.getCell('G'+detalle).alignment = { vertical: 'bottom', horizontal: 'right' };
                    worksheet.getCell('G'+detalle).numFmt = '########.####'

                    worksheet.getCell('H'+detalle).value = tabla[index].item
                    worksheet.getCell('H'+detalle).alignment = { vertical: 'middle', horizontal: 'center' };

                    worksheet.getCell('I'+detalle).value = tabla[index].articulo
                    worksheet.getCell('I'+detalle).alignment = { vertical: 'middle', horizontal: 'center' };

                    worksheet.getCell('J'+detalle).value = tabla[index].cantidad

                    worksheet.getCell('K'+detalle).value = new Intl.NumberFormat("en-us", { maximumFractionDigits: 4 }).format(tabla[index].precio_unit_con_igv)
                    worksheet.getCell('K'+detalle).alignment = { vertical: 'bottom', horizontal: 'right' };
                    worksheet.getCell('K'+detalle).numFmt = '########.####'

                    worksheet.getCell('L'+detalle).value = new Intl.NumberFormat("en-us", { maximumFractionDigits: 4 }).format(tabla[index].total_item)
                    worksheet.getCell('L'+detalle).alignment = { vertical: 'bottom', horizontal: 'right' };
                    worksheet.getCell('L'+detalle).numFmt = '########.####'

                    worksheet.getCell('M'+detalle).value = new Intl.NumberFormat("en-us", { maximumFractionDigits: 4 }).format(tabla[index].monto_percepcion)
                    worksheet.getCell('M'+detalle).alignment = { vertical: 'bottom', horizontal: 'right' };
                    worksheet.getCell('M'+detalle).numFmt = '########.####'

                    worksheet.getCell('N'+detalle).value = tabla[index].chofer
                    worksheet.getCell('N'+detalle).alignment = { vertical: 'middle', horizontal: 'center' };

                    worksheet.getCell('O'+detalle).value = tabla[index].placa
                    worksheet.getCell('O'+detalle).alignment = { vertical: 'middle', horizontal: 'center' };

                    worksheet.getCell('P'+detalle).value = tabla[index].observacion_eepp

                    repetidor = tabla[index].pk
                }else{
                    
                    worksheet.getCell('H'+detalle).value = tabla[index].item
                    worksheet.getCell('H'+detalle).alignment = { vertical: 'middle', horizontal: 'center' };

                    worksheet.getCell('I'+detalle).value = tabla[index].articulo
                    worksheet.getCell('I'+detalle).alignment = { vertical: 'middle', horizontal: 'center' };

                    worksheet.getCell('J'+detalle).value = tabla[index].cantidad

                    worksheet.getCell('K'+detalle).value = new Intl.NumberFormat("en-us", { maximumFractionDigits: 4 }).format(tabla[index].precio_unit_con_igv)
                    worksheet.getCell('K'+detalle).alignment = { vertical: 'bottom', horizontal: 'right' };
                    worksheet.getCell('K'+detalle).numFmt = '########.####'

                    worksheet.getCell('L'+detalle).value = new Intl.NumberFormat("en-us", { maximumFractionDigits: 4 }).format(tabla[index].total_item)
                    worksheet.getCell('L'+detalle).alignment = { vertical: 'bottom', horizontal: 'right' };
                    worksheet.getCell('L'+detalle).numFmt = '########.####'

                    worksheet.getCell('M'+detalle).value = new Intl.NumberFormat("en-us", { maximumFractionDigits: 4 }).format(tabla[index].monto_percepcion)
                    worksheet.getCell('M'+detalle).alignment = { vertical: 'bottom', horizontal: 'right' };
                    worksheet.getCell('M'+detalle).numFmt = '########.####'

                    worksheet.getCell('N'+detalle).value = tabla[index].chofer
                    worksheet.getCell('N'+detalle).alignment = { vertical: 'middle', horizontal: 'center' };

                    worksheet.getCell('O'+detalle).value = tabla[index].placa
                    worksheet.getCell('O'+detalle).alignment = { vertical: 'middle', horizontal: 'center' };

                    worksheet.getCell('P'+detalle).value = tabla[index].observacion_eepp

                    repetidor = tabla[index].pk
                }

                detalle+=1
            }

            const uint8Array = await workbook.xlsx.writeBuffer()
            const blob = new Blob([uint8Array], { type: "application/octet-binary" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "reporte.xlsx";
            a.click();
            a.remove();

        }, 1000)
    },
    reporteXlsx_Volumetrico: (filtro, documentos, usuario, nombre_proveedor) =>{
        setTimeout(async ()=>{
            const workbook = new ExcelJS.Workbook();
            workbook.addWorksheet("reporte");
            const worksheet = workbook.getWorksheet("reporte");
            worksheet.getCell('H3').value = "VOLUMETRICO"
            worksheet.getCell('H3').font = {bold:true, size: 18,} ;
            worksheet.getCell('H3').alignment = { vertical: 'middle', horizontal: 'center' };
            worksheet.getCell('C5').value = "Usuario:"
            worksheet.getCell('C5').font = {bold:true};
            worksheet.getCell('D5').value = usuario.toUpperCase()
            worksheet.getCell('C6').value = "Compañia:"
            worksheet.getCell('C6').font = {bold:true};
            worksheet.getCell('D6').value = "Hidrocarburos del Mundo S.A.C."
            worksheet.getCell('C7').value = "Proveedor:"
            worksheet.getCell('C7').font = {bold:true};
            worksheet.getCell('D7').value = nombre_proveedor
            worksheet.getCell('L6').value = "Fecha y Hora:"
            worksheet.getCell('L6').font = {bold:true};
            worksheet.getCell('M6').value = " "+moment().format('DD-MM-YYYY HH:mm')
            worksheet.columns = [ { width: 7 }, { width: 30 },{ width: 12 }, { width: 12 }, { width: 12 }, { width: 12 }, { width: 15 }, { width: 12 }, { width: 15 }, { width: 15 }, { width: 15 }, { width: 22 }, { width: 12 }, { width: 15 }, { width: 15 }, { width: 15 } ];
            let columnas = 'ABCDEFGHIJKLMNOPQRSTUVXYZ';
            let titulos = [ '#','Proveedor','Planta', 'TpoDoc', 'Serie', 'NroDoc', 'Fecha', 'Fecha OE', 'SCOP', 'PlacaTractor', 'PlacaCisterna', 'Articulo', 'Unid.', 'Cantidad Fac', 'Volumetrico', 'Cond. Pago' ]
            let detalle = 11
            let nro = 1
            let repetidor = ''
            let cantidadDocumentos = 0
            let totalCantidadFac = 0
            let totalVolumetrico = 0
            for (let index = 0; index < titulos.length; index++) {
                worksheet.getCell(columnas.charAt(index)+'10').value = titulos[index]
                worksheet.getCell(columnas.charAt(index)+'10').font = {bold:true, color:{'argb': 'FFFFFF'}};
                worksheet.getCell(columnas.charAt(index)+'10').border = { top: {style:'thin'}, left: {style:'thin'}, bottom: {style:'thin'}, right: {style:'thin'} };
                worksheet.getCell(columnas.charAt(index)+'10').alignment = { vertical: 'middle', horizontal: 'center' };
                worksheet.getCell(columnas.charAt(index)+'10').fill ={ type: 'pattern', pattern:'solid', fgColor:{argb:'0d6efd'} }
            }
            
            for (let index = 0; index < documentos.length; index++) {
                if(documentos[index].id_estado_doc === '02'){
                    worksheet.getCell('A'+detalle).fill ={ type: 'pattern', pattern:'solid', fgColor:{argb:'E3E4E5'} }
                    worksheet.getCell('B'+detalle).fill ={ type: 'pattern', pattern:'solid', fgColor:{argb:'E3E4E5'} }
                    worksheet.getCell('C'+detalle).fill ={ type: 'pattern', pattern:'solid', fgColor:{argb:'E3E4E5'} }
                    worksheet.getCell('D'+detalle).fill ={ type: 'pattern', pattern:'solid', fgColor:{argb:'E3E4E5'} }
                    worksheet.getCell('E'+detalle).fill ={ type: 'pattern', pattern:'solid', fgColor:{argb:'E3E4E5'} }
                    worksheet.getCell('F'+detalle).fill ={ type: 'pattern', pattern:'solid', fgColor:{argb:'E3E4E5'} }
                    worksheet.getCell('G'+detalle).fill ={ type: 'pattern', pattern:'solid', fgColor:{argb:'E3E4E5'} }
                    worksheet.getCell('H'+detalle).fill ={ type: 'pattern', pattern:'solid', fgColor:{argb:'E3E4E5'} }
                    worksheet.getCell('I'+detalle).fill ={ type: 'pattern', pattern:'solid', fgColor:{argb:'E3E4E5'} }
                    worksheet.getCell('J'+detalle).fill ={ type: 'pattern', pattern:'solid', fgColor:{argb:'E3E4E5'} }
                    worksheet.getCell('K'+detalle).fill ={ type: 'pattern', pattern:'solid', fgColor:{argb:'E3E4E5'} }
                    worksheet.getCell('L'+detalle).fill ={ type: 'pattern', pattern:'solid', fgColor:{argb:'E3E4E5'} }
                    worksheet.getCell('M'+detalle).fill ={ type: 'pattern', pattern:'solid', fgColor:{argb:'E3E4E5'} }
                    worksheet.getCell('N'+detalle).fill ={ type: 'pattern', pattern:'solid', fgColor:{argb:'E3E4E5'} }
                    worksheet.getCell('O'+detalle).fill ={ type: 'pattern', pattern:'solid', fgColor:{argb:'E3E4E5'} }
                    worksheet.getCell('P'+detalle).fill ={ type: 'pattern', pattern:'solid', fgColor:{argb:'E3E4E5'} }
                }
                if(repetidor !== documentos[index].nro_documento){
                    worksheet.getCell('A'+detalle).value = nro
                    cantidadDocumentos++
                }else{
                    nro--
                    worksheet.getCell('A'+detalle).value = nro
                }
                worksheet.getCell('A'+detalle).alignment = { vertical: 'middle', horizontal: 'center' };
                worksheet.getCell('B'+detalle).value = documentos[index].proveedor.substring(14,documentos[index].proveedor.length)
                worksheet.getCell('C'+detalle).value = documentos[index].planta
                worksheet.getCell('D'+detalle).value = documentos[index].id_tipo_doc
                worksheet.getCell('E'+detalle).value = documentos[index].serie
                worksheet.getCell('F'+detalle).value = documentos[index].nro_documento
                worksheet.getCell('G'+detalle).value = moment(documentos[index].fecha).format("DD/MM/YYYY")
                worksheet.getCell('H'+detalle).value = moment(documentos[index].fecha_oe).format("DD/MM/YYYY")
                worksheet.getCell('I'+detalle).value = documentos[index].nro_scop
                worksheet.getCell('J'+detalle).value = documentos[index].placa_tractor
                worksheet.getCell('K'+detalle).value = documentos[index].placa_cisterna
                worksheet.getCell('L'+detalle).value = documentos[index].articulo
                worksheet.getCell('M'+detalle).value = documentos[index].id_unidad
                worksheet.getCell('N'+detalle).value = documentos[index].cantidad_fac
                worksheet.getCell('O'+detalle).value = documentos[index].volumetric || ''
                worksheet.getCell('O'+detalle).font = {color:{'argb': (documentos[index].cantidad_fac.toString() === (documentos[index].volumetric || '').toString()) ? '000000' : 'FF0000'}}
                worksheet.getCell('P'+detalle).value = documentos[index].condicion_pago_prov
                detalle+=1
                repetidor = documentos[index].nro_documento
                nro++
                totalCantidadFac = totalCantidadFac + parseInt(documentos[index].cantidad_fac)
                totalVolumetrico = totalVolumetrico + parseInt(documentos[index].volumetric || 0)
            }

            worksheet.getCell('N'+(detalle)).value = totalCantidadFac
            worksheet.getCell('N'+(detalle)).font = {bold:true};
            worksheet.getCell('O'+(detalle)).value = totalVolumetrico
            worksheet.getCell('O'+(detalle)).font = {bold:true};

            worksheet.getCell('C'+(detalle+2)).value = "Total de Facturas"
            worksheet.getCell('C'+(detalle+2)).font = {bold:true};
            worksheet.getCell('E'+(detalle+2)).value = cantidadDocumentos
            worksheet.getCell('E'+(detalle+2)).font = {bold:true};
            const uint8Array = await workbook.xlsx.writeBuffer()
            const blob = new Blob([uint8Array], { type: "application/octet-binary" });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "reporte.xlsx";
            a.click();
            a.remove();
        }, 1000)
    }
}