var urlProfile = "img/usuario.png";

function uploadImage() {
    try {

        const ref = firebase.storage().ref();
        const file = document.getElementById('photo').files[0];
        var hoy = new Date();
        hora = hoy.getHours() + ':' + hoy.getSeconds() + ':' + hoy.getMinutes();
        horaFecha = hoy.getDate() + ':' + (hoy.getMonth() + 1) + ':' + hoy.getFullYear() + ':' + hora;
        const name = file.name + ':' + horaFecha;
        if (file == null) {

        } else {
            const metadata = {
                contentType: file.type
            }
            const task = ref.child(name).put(file, metadata);

            task.then(snapshot => snapshot.ref.getDownloadURL())
                .then(url => {


                    urlProfile = url;

                });

        }
    } catch {

    }

}

function hacerRegistroProducto() {
    event.preventDefault();

    var CODIGO = document.getElementById("codidoPR").value;
    var DESCRIPCION = document.getElementById("nombrePR").value;
    var PRECIO_VENTA = document.getElementById("precioPr").value;
    var PRECIO_COMPRA = document.getElementById("costoPr").value;
    var STOCK = document.getElementById("stockPr").value;
    var proveedor = document.getElementById("proveedores1").value;
    var LIMITE_INFERIOR = document.getElementById("limiteM").value;
    var CATEGORIA = document.getElementById("categoria").value;

    PRECIO_COMPRA = parseInt(PRECIO_COMPRA, 10);
    PRECIO_VENTA = parseInt(PRECIO_VENTA, 10);
    STOCK = parseInt(STOCK, 10);
    LIMITE_INFERIOR = parseInt(LIMITE_INFERIOR, 10);

    estado = true;
    estado2 = false;
    db.collection("productos").where("CODIGO", "==", CODIGO)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach(async (doc) => {
                datos = doc.data();
                estado = false;

            });
            var VOLUMEN_GANANCIA = PRECIO_VENTA - PRECIO_COMPRA;

            if (CODIGO != "" && DESCRIPCION != "" && PRECIO_VENTA != NaN && PRECIO_COMPRA != NaN && STOCK != NaN && proveedor != "" && LIMITE_INFERIOR != NaN && CATEGORIA != "") {
                if (estado) {
                    firebase.auth().onAuthStateChanged((user) => {
                        registradoPor = user.uid;
                        var PORCENTAJE = (VOLUMEN_GANANCIA / PRECIO_VENTA) * 100

                        db.collection('productos').doc(CODIGO).set({
                            CODIGO,
                            DESCRIPCION,
                            PRECIO_COMPRA,
                            PRECIO_VENTA,
                            STOCK,
                            CATEGORIA,
                            LIMITE_INFERIOR,
                            registradoPor,
                            VOLUMEN_GANANCIA,
                            PORCENTAJE,
                            urlProfile,
                            proveedor
                        })
                    })


                    CODIGO.value = "";
                    DESCRIPCION.value = "";
                    PRECIO_VENTA.value = "";
                    STOCK.value = "";
                    proveedor.value = "";
                    LIMITE_INFERIOR.value = "";

                    Swal.fire('Guardado!', '', 'success');
                    
                } else {

                    Swal.fire({

                        icon: 'info',
                        title: 'Ya hay un producto con este c??digo',
                        showConfirmButton: false,
                        timer: 1500
                    })
                }


            } else {
                Swal.fire({

                    icon: 'info',
                    title: 'Ning??n campo debe estar vac??o',
                    showConfirmButton: false,
                    timer: 1500
                })
            }
        })
}
function SubirXLSX() {
    try {
        var carga = document.getElementById("carga");
        carga.innerHTML = `<img src="img/carga.gif" width="10%">`;
        archivoXLSX = document.getElementById("archivoXLSX").files[0];
        let fileReader = new FileReader();
        fileReader.readAsBinaryString(archivoXLSX);
        fileReader.onload = (event) => {
            let data = event.target.result;
            let workbook = XLSX.read(data, { type: "binary" });

            workbook.SheetNames.forEach(sheet => {
                let rowObject = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheet]);


                firebase.auth().onAuthStateChanged((user) => {
                    try {

                        var registradoPor = user.uid;
                        for (let i = 0; i < rowObject.length; i++) {
                            var CODIGO = rowObject[i].CODIGO;
                            var DESCRIPCION = rowObject[i].DESCRIPCION;
                            var PRECIO_COMPRA = rowObject[i].PRECIO_COMPRA;
                            var PRECIO_VENTA = rowObject[i].PRECIO_VENTA;
                            var STOCK = rowObject[i].STOCK;
                            var CATEGORIA = rowObject[i].CATEGORIA;
                            var LIMITE_INFERIOR = rowObject[i].limite_inferior;

                            registradoPor = user.uid
                            var VOLUMEN_GANANCIA = PRECIO_VENTA - PRECIO_COMPRA;
                            var PORCENTAJE = (VOLUMEN_GANANCIA / PRECIO_VENTA) * 100
                           
                            db.collection('productos').doc(CODIGO).set({
                                CODIGO,
                                DESCRIPCION,
                                PRECIO_COMPRA,
                                PRECIO_VENTA,
                                STOCK,
                                CATEGORIA,
                                LIMITE_INFERIOR,
                                registradoPor,
                                VOLUMEN_GANANCIA,
                                PORCENTAJE,
                                urlProfile
                            })
                            carga.innerHTML = "";
                            Swal.fire('Guardado!', '', 'success');

                            

                        }
                    } catch (e) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Nombre inv??lidos',
                            text: e,

                        })
                        carga.innerHTML = "";
                    }

                })
            });

        }

    } catch (e) {

    }

}
const obtenerProductos = () => db.collection("productos").get();
async function cargarProductosLista() {
    toggle();
    var tabTree = document.getElementById("main");
    tabTree.innerHTML = "";
    tabTree.innerHTML = `
    <br><h3>Lista de productos:<div id="ValorInventario"></div></h3><br><div class="delimitado"><table id="tabla3" class="table table-striped table-bordered">
     <thead>
       <tr>
         <th>CODIGO</th>
         <th>DESCRIPCION</th>
         <th>PRECIO DE VENTA</th>
         <th>PRECIO DE COMPRA</th>
         <th>STOCK</th>
         <th>VOLUMEN DE GANANCIA</th>
         <th>PORCENTAJE DE GANANCIA</th>
         <th>VALOR DEL INVENTARIO</th>
         <th colspan=4>Acciones</th>
       </tr>
     </thead>
   </table></div>`;
    var validado = false;
    if (!validado) {
        tabTree.innerHTML += `<center><div id="aviso"><img width="100" src="img/carga.gif"></div></center>`;
    }
    var tabla3 = document.getElementById("tabla3");
    var suma = [];
    
    querySnapshot=await obtenerProductos();
   
    querySnapshot.forEach((doc) => {
        
        suma.push(datos.STOCK * datos.PRECIO_VENTA);
        datos = doc.data();
        validado = true;
        var porcentaje = datos.PORCENTAJE;
        porcentaje = parseInt(porcentaje, 10);
        porcentaje.toString();
        porcentaje = porcentaje + "%"
        var aviso = document.getElementById("aviso");
        aviso.innerHTML = "";
        fila=document.createElement("tr");
        Ccodigo=document.createElement("td");
        Ccodigo.innerHTML=datos.CODIGO
        Cdescripcion=document.createElement("td");
        Cdescripcion.innerHTML=datos.DESCRIPCION;
        CprecioVenta=document.createElement("td");
        CprecioVenta.innerHTML=ingresar(datos.PRECIO_VENTA);
        CprecioCompra=document.createElement("td");
        CprecioCompra.innerHTML=ingresar(datos.PRECIO_COMPRA);
        Cstock=document.createElement("td");
        Cstock.innerHTML=datos.STOCK;
        Cvolumen=document.createElement("td");
        Cvolumen.innerHTML=ingresar(datos.VOLUMEN_GANANCIA);
        Cporcentaje=document.createElement("td");
        Cporcentaje.innerHTML=porcentaje;
        Cvalor=document.createElement("td");
        Cvalor.innerHTML=ingresar(datos.STOCK * datos.PRECIO_VENTA);
        Cacciones=document.createElement("td");
        Cacciones.innerHTML=`<a class="cursor" id="${doc.id}" onclick="eliminarProducto(this)"><img src="img/delete.png" width=20 title="Borrar"></a><br>
        <a class="cursor" id="${datos.CODIGO}" onclick="EditarProducto(this)"><img src="img/editar.png" width=20 title="Editar"></a><br>
        <a class="cursor" id="${doc.id}" onclick="observacion(this)"><img src="img/obs.png" width=20 title="Observaci??n"></a><br>
        <a class="cursor" id="${doc.id}" onclick="mirarObsAdmin(this)"><img src="img/ojo.png" width=20 title="Observaciones"></a><br>
        `
        fila.appendChild(Ccodigo);
        fila.appendChild(Cdescripcion);
        fila.appendChild(CprecioVenta);
        fila.appendChild(CprecioCompra);
        fila.appendChild(Cstock);
        fila.appendChild(Cvolumen);
        fila.appendChild(Cporcentaje);
        fila.appendChild(Cvalor);
        fila.appendChild(Cacciones);
        tabla3.appendChild(fila);
         
    })
    var ValorInventario = document.getElementById("ValorInventario");
    suma1 = 0;

    for (let i = 1; i < suma.length; i++) {
        suma1 += suma[i]

    }
    ValorInventario.innerHTML = `<p id="Aviso">Valor global del inventario: ${ingresar(suma1)}<br><hr></p>`



}
function eliminarProducto(element) {
    Swal.fire({
        title: '??Quieres borrar este producto?',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: `Borrar`,
        denyButtonText: `No borrar`,
    }).then((result) => {
        if (result.isConfirmed) {
            var id = element.id;

            db.collection("productos").doc(id).delete();
            Swal.fire('Borrado!', '', 'success');

           
        }

    })

}

function EditarProducto(element) {
    var feed = document.getElementById("main");

    db.collection("productos").where("CODIGO", "==", element.id)
        .get()
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                datos = doc.data();
                var urlProfile = datos.urlProfile;

                feed.innerHTML = `<br><h3>Datos del producto</h3>`;

                feed.innerHTML += `<center><div class="col-md-10" >
        <div class="card">
            <div class="card-body" id="contenido3">
                <form>
                    <div>
                        <img src="${urlProfile}" width=150>
                    </div>
                    <div class="form-group">
                        <h5>C??digo del producto*</h5>
                        <input type="text" id="codidoPR" readonly class="form-control" placeholder="c??digo*" value="${datos.CODIGO}">
                    </div>
                    <div class="form-group">
                        <h5>Nombre del producto*</h5>
                        <input type="text" id="nombrePR" class="form-control" placeholder="Nombre*" value="${datos.DESCRIPCION}">
                    </div>
                    <div class="form-group">
                        <h5>Precio del producto*</h5>
                        <input type="text" id="precioPr" class="form-control" placeholder="precio*" value="${datos.PRECIO_VENTA}">
                    </div>
                    <div class="form-group">
                        <h5>Costo del producto*</h5>
                        <input type="text" id="costoPr" class="form-control" placeholder="Costo*" value="${datos.PRECIO_COMPRA}">
                    </div>
                    <div class="form-group">
                        <h5>Cantidad del producto*</h5>
                        <input type="text" id="stockPr" class="form-control" placeholder="cantidad*" value="${datos.STOCK}">
                    </div>
                    <div class="form-group">
                        <h5>Proveedor</h5>
                        <input type=text class="form-control" id="proveedor1" value="${datos.proveedor}">
                    </div>
                    <div class="form-group">
                        <h5>Categor??a</h5>
                        <input type=text class="form-control" id="categoria" value="${datos.CATEGORIA}">
                    </div>
                    <div class="form-group">
                        <h5>L??mite M??nimo del producto*</h5>
                        <input type="text" id="limiteM" class="form-control" placeholder="l??mite m??nimo*" value="${datos.LIMITE_INFERIOR}">
                    </div>
                    <div class="form-group">
                    <h5>categor??a</h5>
                    <input type="file" id="photo" class="form-control" accept="image/png, image/jpeg, image/gif">
                    </div>
                    <div class="form-group">
                    <input type="button" class="btn btn-secondary" onclick="uploadImage()"
                        value="subir imagen">
                    </div>
                    <div class="form-group">
                        <h5>Nueva cantidad</h5>
                        <input type="text" id="NuevaCantidad" class="form-control" placeholder="Nueva cantidad">
                    </div>
                    <div class="form-group">
                        <h5>N??mero de la factura de compra</h5>
                        <input type="text" id="NumeroFactura" class="form-control" placeholder="Numero de la Factura">
                    </div>
                    <hr>
                    <div id="sugerencias" class="form-gruop">
    
                    </div>
                    <br>
                    <div id="botonE">
                        <button onclick="GuardarCambiosProducto()" class="btn btn-danger" id="btn-task-form">
                            Guardar cambios
                        </button>
                    </div>
    
                </form>
            </div>
        </div>
    </div>
    
        `;
                var tipoDeUsuario = document.getElementById("tipoDeUsuario");



            })
        })
}
var ventaGarray = [];
function Emitir() {
    var cantidad = document.getElementById("cantidadVenta").value;
    var idProducto = document.getElementById("productos1").value;
    var Descuento = document.getElementById("Descuento").value;
    if (cantidad != "") {
        if (idProducto != "") {
            if (Descuento != "") {
                cantidad = parseInt(cantidad, 10);
                Descuento = parseFloat(Descuento, 10);
                var ventaG = {
                    cantidad, idProducto, Descuento
                }
                ventaGarray.push(ventaG);

                pintarTabla(ventaGarray);
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Especificar descuento',
                    text: 'Si el producto no tiene descuento, debe colocar 0',

                })

            }
        } else {
            Swal.fire({
                icon: 'error',
                title: 'Producto inv??lido',
                text: 'debe especificar el c??digo del producto',

            })
        }
    } else {
        Swal.fire({
            icon: 'error',
            title: 'Cantidades inv??lidas',
            text: 'Debe especificar las cantidades a vender',

        })

    }


}
function pintarTabla(ventaGarray) {

    var items = document.getElementById("tabla4");
    items.innerHTML = "";
    for (let i = 0; i < ventaGarray.length; i++) {
        db.collection("productos").where("CODIGO", "==", ventaGarray[i].idProducto).get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                var datos = doc.data();
                items.innerHTML += `
                <tr>
                    <td>${datos.CODIGO}</td>
                    <td>${datos.DESCRIPCION}</td>
                    <td>${datos.STOCK}</td>
                    <td>${datos.PRECIO_VENTA}</td>
                    <td><a id="${datos.CODIGO}" class="cursor" onclick="CambiarCantidad(this)">${ventaGarray[i].cantidad}</a></td>
                    <td><a id="${datos.CODIGO}" class="cursor" onclick="CambiarDescuento(this)">${ventaGarray[i].Descuento}%</a></td>
                    <th><a id="${datos.CODIGO}" class="cursor" onclick="EliminarItem(this)"><img src="img/delete.png" width=20></a></th>
                    
                </tr>
                `;

                var botonGuardar = document.getElementById("botonGuadar");

                botonGuardar.innerHTML = `<button class="btn btn-success" onclick="GuardarPedido()">Guardar</button>`;

            })
        })
    }
    var cantidad = document.getElementById("cantidadVenta");
    var idProducto = document.getElementById("productos1");

    cantidad.value = "";
    idProducto.value = "";
}
function EliminarItem(element) {
    var idElemento = element.id;
    for (let i = 0; i < ventaGarray.length; i++) {
        if (idElemento == ventaGarray[i].idProducto) {
            ventaGarray.splice(i);

        }
    }
    pintarTabla(ventaGarray);
}
function CambiarCantidad(element) {
    var cantidad_nueva;
    Swal.fire({
        title: 'Ingrese la nueva cantidad',
        input: 'text',
        inputAttributes: {
            autocapitalize: 'off'
        },
        showCancelButton: true,
        confirmButtonText: 'Ingresar',
        showLoaderOnConfirm: true,
        CancelButtonText: 'Cancelar'

    }).then((result) => {
        if (result.isConfirmed) {
            cantidad_nueva = result.value;
            cantidad_nueva = parseInt(cantidad_nueva, 10);
            for (let i = 0; i < ventaGarray.length; i++) {
                if (element.id == ventaGarray[i].idProducto) {
                    ventaGarray[i].cantidad = cantidad_nueva;
                }
            }

            pintarTabla(ventaGarray);
        }
    })

}
function CambiarDescuento(element) {
    var descuento;
    Swal.fire({
        title: 'Ingrese el nuevo descuento',
        input: 'text',
        inputAttributes: {
            autocapitalize: 'off'
        },
        showCancelButton: true,
        confirmButtonText: 'Ingresar',
        showLoaderOnConfirm: true,
        CancelButtonText: 'Cancelar'

    }).then((result) => {
        if (result.isConfirmed) {
            descuento = result.value;
            descuento = parseInt(descuento, 10);
            for (let i = 0; i < ventaGarray.length; i++) {
                if (element.id == ventaGarray[i].idProducto) {
                    ventaGarray[i].Descuento = descuento;
                }
            }

            pintarTabla(ventaGarray);
        }
    })

}
function GuardarPedido() {
    var cliente = document.getElementById("clientes1").value;
    if (cliente != "") {


        var cantidades = [];
        var idProducto = [];
        var descuentos = [];
        for (let i = 0; i < ventaGarray.length; i++) {
            cantidades[i] = ventaGarray[i].cantidad;
            idProducto[i] = ventaGarray[i].idProducto;
            descuentos[i] = ventaGarray[i].Descuento;
        }
        var entrada = true;
        var suma = 0
        var sumaCosto = 0
        db.collection("productos").get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                datos = doc.data();
                for (let i = 0; i < idProducto.length; i++) {
                    if (datos.CODIGO == idProducto[i]) {
                        if (datos.STOCK < cantidades[i]) {
                            entrada = false;
                        } else {
                            suma = suma + (cantidades[i] * (datos.PRECIO_VENTA - (datos.PRECIO_VENTA * (descuentos[i]) / 100)))
                            sumaCosto = sumaCosto + (cantidades[i] * datos.PRECIO_COMPRA)
                        }
                    }
                }
            })
            if (entrada) {
                firebase.auth().onAuthStateChanged((user) => {
                    var vendedor = user.uid;
                    var date = new Date();
                    var fecha = [date.getDate(), date.getMonth() + 1, date.getFullYear()]
                    var entregado = false;
                    var pagado = false;
                    var debe = suma;
                    var rentabilidad = suma - sumaCosto;
                    rentabilidad = rentabilidad * 100 / suma;
                    var NumeroFactura = 1;
                    db.collection("ventas").get().then((querySnapshot) => {
                        querySnapshot.forEach((doc) => {
                            NumeroFactura += 1;

                        })
                        var plazo;
                        db.collection("clientes").where("nit", "==", cliente).get().then((querySnapshot) => {
                            querySnapshot.forEach((doc) => {
                                var datos = doc.data();
                                plazo = datos.plazo;
                            })
                            var fechaAux = new Date(fecha[2], fecha[1], fecha[0] + plazo)
                            var fechaVencimiento = [fechaAux.getDate(), fechaAux.getMonth(), fechaAux.getFullYear()]
                            db.collection("ventas").doc().set({
                                cantidades,
                                idProducto,
                                descuentos,
                                entregado,
                                vendedor,
                                fecha,
                                pagado,
                                suma,
                                debe,
                                cliente,
                                NumeroFactura,
                                rentabilidad,
                                plazo,
                                fechaVencimiento


                            })
                        })

                    })

                    for (let i = 0; i < idProducto.length; i++) {

                        db.collection("productos").where("CODIGO", "==", idProducto[i]).get()
                            .then((querySnapshot) => {
                                querySnapshot.forEach((doc) => {

                                    var datos = doc.data();
                                    var CODIGO = datos.CODIGO;
                                    var DESCRIPCION = datos.DESCRIPCION;
                                    var STOCK = datos.STOCK;
                                    var LIMITE_INFERIOR = datos.LIMITE_INFERIOR;
                                    var PRECIO_VENTA = datos.PRECIO_VENTA;
                                    var VOLUMEN_GANANCIA = datos.VOLUMEN_GANANCIA;
                                    var PRECIO_COMPRA = datos.PRECIO_COMPRA;
                                    var registradoPor = datos.registradoPor;
                                    var PORCENTAJE = datos.PORCENTAJE;
                                    STOCK = STOCK - cantidades[i];
                                    var CATEGORIA = datos.CATEGORIA;
                                    var urlProfile = datos.urlProfile;
                                    db.collection("productos").doc(doc.id).set({
                                        CODIGO,
                                        DESCRIPCION,
                                        PRECIO_COMPRA,
                                        PRECIO_VENTA,
                                        STOCK,
                                        CATEGORIA,
                                        LIMITE_INFERIOR,
                                        registradoPor,
                                        VOLUMEN_GANANCIA,
                                        PORCENTAJE,
                                        urlProfile
                                    })
                                })

                                ventaGarray.splice(i);
                                var botonGuadar = document.getElementById("botonGuadar");
                                botonGuadar.innerHTML = "";

                                pintarTabla(ventaGarray)
                            })

                    }
                    Swal.fire('Guardado!', '', 'success');

                })

            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Inventario insuficiente',
                    text: 'Al parecer las cantidades que digitaste, superan la cantidad existente',

                })
            }
        })

    } else {
        Swal.fire({
            icon: 'error',
            title: 'Cliente inv??lido',
            text: 'Debe especificar el nit del cliente',

        })
    }

}
function GuardarCambiosProducto() {
    event.preventDefault();
    var CODIGO = document.getElementById("codidoPR").value;
    var DESCRIPCION = document.getElementById("nombrePR").value;
    var PRECIO_VENTA = document.getElementById("precioPr").value;
    var PRECIO_COMPRA = document.getElementById("costoPr").value;
    var STOCK = document.getElementById("stockPr").value;
    var proveedor = document.getElementById("proveedor1").value;
    var LIMITE_INFERIOR = document.getElementById("limiteM").value;
    var CATEGORIA = document.getElementById("categoria").value;
    var NuevaCantidad = document.getElementById("NuevaCantidad").value;
    var NumeroFactura = document.getElementById("NumeroFactura").value;
    PRECIO_VENTA = parseInt(PRECIO_VENTA, 10);
    PRECIO_COMPRA = parseInt(PRECIO_COMPRA, 10);
    STOCK = parseInt(STOCK, 10);
    LIMITE_INFERIOR = parseInt(LIMITE_INFERIOR, 10);

    NuevaCantidad = parseInt(NuevaCantidad, 10);
    entrada = !Number.isNaN(NuevaCantidad)
    entrada2 = false;

    var VOLUMEN_GANANCIA = PRECIO_VENTA - PRECIO_COMPRA
    if (CODIGO != "" && DESCRIPCION != "" && PRECIO_VENTA != NaN && PRECIO_COMPRA != NaN && stockPr != NaN && LIMITE_INFERIOR != NaN && CATEGORIA != "") {
        if (entrada && NumeroFactura != "") {

            var productos = [];
            var cantidades = [];
            var costos = [];
            var fecha1 = [];

            var entrada3 = false;
            db.collection("compras").where("NumeroFactura", "==", NumeroFactura).get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    entrada3 = true;
                    datos = doc.data();
                    productos = datos.productos;
                    cantidades = datos.cantidades;
                    costos = datos.costos;
                    fecha1 = datos.fecha1;
                    Proveedor = datos.Proveedor;
                    valorFactura = datos.valorFactura;
                    estado = datos.estado;
                    deuda = datos.deuda;
                })
                if (entrada3) {
                    productos.push(CODIGO);
                    cantidades.push(NuevaCantidad);
                    costos.push(PRECIO_COMPRA);
                    var fecha = new Date();
                    var fecha2 = `${fecha.getDate()}/${fecha.getMonth() + 1}/${fecha.getFullYear()}`;
                    fecha1.push(fecha2);

                    db.collection("compras").doc(NumeroFactura).set({
                        NumeroFactura,
                        Proveedor,
                        valorFactura,
                        productos,
                        cantidades,
                        costos,
                        fecha1,
                        estado,
                        deuda
                    })
                    db.collection("productos").where("CODIGO", "==", CODIGO).get()
                        .then((querySnapshot) => {
                            querySnapshot.forEach((doc1) => {

                                var datos = doc1.data();
                                var registradoPor = datos.registradoPor;
                                STOCK = STOCK + NuevaCantidad;
                                var PORCENTAJE = (VOLUMEN_GANANCIA / PRECIO_VENTA) * 100
                                var urlProfile = datos.urlProfile;
                                db.collection("productos").doc(doc1.id).set({
                                    CODIGO,
                                    DESCRIPCION,
                                    PRECIO_COMPRA,
                                    PRECIO_VENTA,
                                    STOCK,
                                    CATEGORIA,
                                    LIMITE_INFERIOR,
                                    registradoPor,
                                    VOLUMEN_GANANCIA,
                                    PORCENTAJE,
                                    urlProfile
                                })
                                Swal.fire('Guardado!', '', 'success');

                            })


                        })
                } else {
                    Swal.fire({
                        icon: 'info',
                        title: 'El n??mero de factura no existe.',
                        showConfirmButton: false,
                        timer: 1500
                    })
                }



            })
        } else if (!entrada || NumeroFactura == "") {
            Swal.fire({
                icon: 'info',
                title: 'Si va a ingresar una compra, debe especificar el c??digo de la factura de compra y la cantidad de la compra para este producto',
                showConfirmButton: false,
                timer: 1500
            })
            Swal.fire({
                title: '??Quieres solo actualizar los datos?',
                showDenyButton: true,
                confirmButtonText: `Guardar`,
                denyButtonText: `No Guardar`,
            }).then((result) => {
                if (result.isConfirmed) {
                    db.collection("productos").where("CODIGO", "==", CODIGO).get()
                        .then((querySnapshot) => {
                            querySnapshot.forEach((doc1) => {
                                var datos = doc1.data()

                                var registradoPor = datos.registradoPor;
                                var PORCENTAJE = (VOLUMEN_GANANCIA / PRECIO_VENTA) * 100

                                if (urlProfile == undefined) {
                                    urlProfile = "img/usuario.png";
                                }
                                db.collection("productos").doc(doc1.id).set({
                                    CODIGO,
                                    DESCRIPCION,
                                    PRECIO_COMPRA,
                                    PRECIO_VENTA,
                                    STOCK,
                                    CATEGORIA,
                                    LIMITE_INFERIOR,
                                    registradoPor,
                                    VOLUMEN_GANANCIA,
                                    PORCENTAJE,
                                    urlProfile
                                })
                                Swal.fire('Guardado!', '', 'success');

                            })


                        })
                }

            })
        }
    } else {
        Swal.fire({
            icon: 'info',
            title: 'Llene los campos obligatorios',
            showConfirmButton: false,
            timer: 1500
        })
    }
}
function AbonarPedido(element) {
    var entrada = true;
    Swal.fire({
        title: 'Ingrese el dinero a abonar',
        input: 'text',
        inputAttributes: {
            autocapitalize: 'off'
        },
        showCancelButton: true,
        confirmButtonText: 'Ingresar',
        showLoaderOnConfirm: true,
        CancelButtonText: 'Cancelar'

    }).then((result) => {
        if (result.isConfirmed) {
            cantidad_abono = result.value;
            cantidad_abono = parseInt(cantidad_abono, 10);
            db.collection("ventas").get().then((querySnapshot) => {
                querySnapshot.forEach((doc) => {
                    if (element.id == doc.id) {
                        var datos = doc.data();
                        cantidades = datos.cantidades;
                        descuentos = datos.descuentos;
                        NumeroFactura = datos.NumeroFactura
                        idProducto = datos.idProducto;
                        entregado = datos.entregado;
                        vendedor = datos.vendedor;
                        fecha = datos.fecha
                        pagado = datos.pagado
                        suma = datos.suma
                        debe = datos.debe;
                        cliente = datos.cliente;
                        plazo = datos.plazo;
                        rentabilidad = datos.rentabilidad
                        fechaVencimiento = datos.fechaVencimiento
                        if (cantidad_abono > suma || cantidad_abono > debe) {
                            Swal.fire({
                                icon: 'info',
                                title: 'el abono no puede superar la suma',
                                showConfirmButton: false,
                                timer: 1500
                            })
                            entrada = false;
                        } else if (cantidad_abono == suma) {
                            pagado = true;
                            debe = 0;
                        } else {
                            debe = debe - cantidad_abono;
                            if (debe == 0) {
                                pagado = true;
                            }
                        }

                        if (entrada) {
                            db.collection("ventas").doc(doc.id).set({
                                cantidades,
                                idProducto,
                                entregado,
                                vendedor,
                                fecha,
                                pagado,
                                suma,
                                debe,
                                cliente,
                                NumeroFactura,
                                descuentos,
                                rentabilidad,
                                plazo,
                                fechaVencimiento
                            })

                            var hoy = new Date();
                            var fecha = [hoy.getDate(), hoy.getMonth() + 1, hoy.getFullYear()];
                            db.collection("abonos").doc().set({
                                rentabilidad,
                                NumeroFactura,
                                cantidad_abono,
                                fecha
                            })

                        }

                    }

                })
            })
        }
    })
}
function cambiarEstado(element) {
    var Ventaid = element.id;

    db.collection("ventas").get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            if (doc.id == Ventaid) {
                datos = doc.data();
                var cantidades = datos.cantidades;

                var idProducto = datos.idProducto;
                var entregado = true;
                var vendedor = datos.vendedor;
                var fecha = datos.fecha;
                var pagado = datos.pagado;
                var suma = datos.suma;
                var debe = datos.debe;
                var cliente = datos.cliente;
                var NumeroFactura = datos.NumeroFactura
                var descuentos = datos.descuentos;
                var rentabilidad = datos.rentabilidad
                var plazo = datos.plazo;
                var fechaVencimiento = datos.fechaVencimiento;
                db.collection("ventas").doc(Ventaid).set({
                    cantidades,
                    idProducto,
                    entregado,
                    vendedor,
                    fecha,
                    pagado,
                    suma,
                    debe,
                    cliente,
                    NumeroFactura,
                    descuentos,
                    plazo,
                    rentabilidad,
                    fechaVencimiento
                })
            }
        })
    })
}
function observacion(element) {
    Swal.fire({
        title: 'Observaciones',
        input: 'textarea',
        inputLabel: "A??adir Observaci??n",
        inputPlaceholder: "Escriba aqu??...",
        inputAttributes: {
            autocapitalize: 'off'
        },
        showCancelButton: true,
        confirmButtonText: 'A??adir',
        showLoaderOnConfirm: true,
        CancelButtonText: 'Cancelar'

    }).then((result) => {
        var CODIGO = element.id;
        var comentarios = [];
        var usuario = [];
        var fecha = [];
        db.collection("comentarios").where("CODIGO", "==", CODIGO).get().then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                var datos = doc.data();
                comentarios = datos.comentarios;
                usuario = datos.usuario;
                fecha = datos.fecha;
            })
            firebase.auth().onAuthStateChanged((user) => {
                comentarios.push(result.value);
                usuario.push(user.uid);
                var hoy = new Date();
                dia = hoy.getDate()
                mes = hoy.getMonth() + 1
                if (dia < 10) {
                    dia = dia.toString();
                    var cero = "0";
                    cero += dia
                    dia = cero;
                }
                if (mes < 10) {
                    mes = mes.toString();
                    var cero = "0";
                    cero += mes
                    mes = cero;
                }
                dia = dia.toString();
                mes = mes.toString();
                fecha1 = `${dia}/${mes}/${hoy.getFullYear()}`
                fecha.push(fecha1);
                db.collection("comentarios").doc(CODIGO).set({
                    CODIGO,
                    usuario,
                    comentarios,
                    fecha
                })
                Swal.fire('Guardado!', '', 'success');
            })
        })
    });
}
function mirarObs(element) {
    event.preventDefault();
    var login = document.getElementById("login-page");
    login.innerHTML = "";
    var nombre;
    var main = document.getElementById("main");
    main.innerHTML = `<div id="sugerencia">No hay observaciones.</div>`;
    var user = firebase.auth().currentUser;
    db.collection("comentarios").where("CODIGO", "==", element.id).get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            var datos = doc.data();
            var comentariosG = datos.comentarios;
            var comentarios = [];

            for (let i = 0; i < comentariosG.length; i++) {

                if (datos.usuario[i] == user.uid) {
                    comentarios.push(comentariosG[i]);
                }
            }
            db.collection("productos").where("CODIGO", "==", element.id).get().then((querySnapshot2) => {
                querySnapshot2.forEach((doc2) => {
                    var datos2 = doc2.data();
                    nombre = datos2.DESCRIPCION;
                    main.innerHTML = `<br><br><h5>Mis observaciones de: <h5 id="aviso">${nombre}</h5></h5>`;
                })
                var comentario1 = "";
                for (let i = 0; i < comentarios.length; i++) {
                    aux = comentarios[i]
                    for (let j = 0; j < aux.length; j++) {

                        comentario1 += aux[j];
                        if (j % 14 == 0 && j != 0) {
                            comentario1 += "\n";
                        }
                    }

                    main.innerHTML += `<div id="fecha${i}${element.id}" class="container text-left border">
                    <br>
                        <div class="col-sm-16">Fecha: ${datos.fecha[i]}<br><p class=" bg-light" id="${i}">${comentario1}</p>
                        <center><a class="cursor" id="${i},${doc.id}" onclick="EliminarComentario(this)"><img src="img/delete.png" width=30></a></center>
                        <br>
                        </div>
                    </div><br>`
                    comentario1 = "";
                }
            })
        })
    })


}
function EliminarComentario(element) {
    codigo1 = element.id;
    var estado = false;
    var indice = "";
    var CODIGO = "";
    for (let i = 0; i < codigo1.length; i++) {
        if (codigo1[i] == ",") {

            estado = true;
        }
        if (!estado) {
            indice += codigo1[i];
        } else {
            CODIGO += codigo1[i];
        }
        CODIGO = CODIGO.replace(",", "");
        indice = parseInt(indice, 10);
    }
    db.collection("comentarios").where("CODIGO", "==", CODIGO).get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            var datos = doc.data();
            var comentarios = datos.comentarios;
            var fecha = datos.fecha;
            var usuario = datos.usuario;

            comentarios.splice(indice, 1);
            fecha.splice(indice, 1);
            usuario.splice(indice, 1);

            if (fecha.length == 0 && usuario.length == 0 && comentarios.length == 0) {
                db.collection("comentarios").doc(CODIGO).delete();
            } else {
                db.collection("comentarios").doc(CODIGO).set({
                    CODIGO,
                    usuario,
                    comentarios,
                    fecha
                })
            }

            Swal.fire('Borrado!', '', 'success');

        })
    })
}
function mirarObsAdmin(element) {
    event.preventDefault();
    var login = document.getElementById("login-page");
    login.innerHTML = "";
    var nombre;
    var main = document.getElementById("main");
    main.innerHTML = `<div id="sugerencia">No hay observaciones.</div>`;

    db.collection("comentarios").where("CODIGO", "==", element.id).get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
            var datos = doc.data();
            var comentariosG = datos.comentarios;
            var comentarios = [];

            for (let i = 0; i < comentariosG.length; i++) {


                comentarios.push(comentariosG[i]);

            }
            db.collection("productos").where("CODIGO", "==", element.id).get().then((querySnapshot2) => {
                querySnapshot2.forEach((doc2) => {
                    var datos2 = doc2.data();
                    nombre = datos2.DESCRIPCION;
                    main.innerHTML = `<br><br><h5>Observaciones generales de: <h5 id="aviso">${nombre}</h5></h5>`;
                })
                var comentario1 = "";
                for (let i = 0; i < comentarios.length; i++) {
                    aux = comentarios[i]
                    for (let j = 0; j < aux.length; j++) {

                        comentario1 += aux[j];
                        if (j % 14 == 0 && j != 0) {
                            comentario1 += "\n";
                        }
                    }

                    main.innerHTML += `<div id="fecha${i}${element.id}" class="container text-left border">
                    <br>
                        <div class="col-sm-16">Fecha: ${datos.fecha[i]}<br><p class=" bg-light" id="${i}">${comentario1}</p>
                        <center><a class="cursor" id="${i},${doc.id}" onclick="EliminarComentario(this)"><img src="img/delete.png" width=30></a></center>
                        <br>
                        </div>
                    </div><br>`
                    comentario1 = "";
                }
            })
        })
    })
}
function Devolver() {
    var productos = document.getElementById("productos1").value;
    var clientes = document.getElementById("clientes1").value;
    var tipoDeDevolucion = document.getElementById("tipoDeDevolucion").value;
    var cantidades1 = document.getElementById("cantidades").value;

    if (productos != "" && clientes != "" && tipoDeDevolucion != "") {

        var CODIGO = productos;
        cantidades1 = parseInt(cantidades1, 10)
        var cliente = [];
        var cantidad = [];
        var tipo = [];
        var fecha = [];


        db.collection("devoluciones").where("CODIGO", "==", CODIGO).get().then((querySnapshot) => {

            querySnapshot.forEach((doc) => {
                var datos = doc.data();
                cliente = datos.cliente;
                cantidad = datos.cantidad;
                tipo = datos.tipo
                fecha = datos.fecha;

            })


            cliente.push(clientes);
            cantidad.push(cantidades1);


            tipo.push(tipoDeDevolucion);
            var hoy = new Date();
            dia = hoy.getDate()
            mes = hoy.getMonth() + 1
            if (dia < 10) {
                dia = dia.toString();
                var cero = "0";
                cero += dia
                dia = cero;
            }
            if (mes < 10) {
                mes = mes.toString();
                var cero = "0";
                cero += mes
                mes = cero;
            }
            dia = dia.toString();
            mes = mes.toString();
            fecha1 = `${dia}/${mes}/${hoy.getFullYear()}`
            fecha.push(fecha1);


            db.collection("devoluciones").doc(CODIGO).set({
                CODIGO,
                cliente,
                cantidad,
                tipo,
                fecha,

            })
            if (tipoDeDevolucion == "inventario") {
                var PRECIO_VENTA;
                db.collection("productos").where("CODIGO", "==", CODIGO).get()
                    .then((querySnapshot) => {
                        querySnapshot.forEach((doc2) => {

                            var datos2 = doc2.data();
                            var CODIGO = datos2.CODIGO;
                            var DESCRIPCION = datos2.DESCRIPCION;
                            var STOCK = datos2.STOCK;
                            var LIMITE_INFERIOR = datos2.LIMITE_INFERIOR;
                            PRECIO_VENTA = datos2.PRECIO_VENTA;
                            var VOLUMEN_GANANCIA = datos2.VOLUMEN_GANANCIA;
                            var PRECIO_COMPRA = datos2.PRECIO_COMPRA;
                            var registradoPor = datos2.registradoPor;
                            var PORCENTAJE = datos2.PORCENTAJE;
                            var urlProfile = datos2.urlProfile;
                            STOCK = STOCK + cantidades1;
                            var CATEGORIA = datos2.CATEGORIA;

                            db.collection("productos").doc(doc2.id).set({
                                CODIGO,
                                DESCRIPCION,
                                PRECIO_COMPRA,
                                PRECIO_VENTA,
                                STOCK,
                                CATEGORIA,
                                LIMITE_INFERIOR,
                                registradoPor,
                                VOLUMEN_GANANCIA,
                                PORCENTAJE,
                                urlProfile
                            })
                        })


                    })


            }

            Swal.fire('Guardado!', '', 'success');

        })
    }


}
