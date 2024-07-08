const boton = document.querySelector("#boton");
const input = document.querySelector("#input");
const cambioMoneda = document.querySelector("#cambiomoneda");
const buscar = document.querySelector("#buscar");
const myChartCtx = document.querySelector("#myChart").getContext('2d');
let myChart;



async function obtenerTiposDeCambio() {
    try {
        const respuesta = await fetch ('https://mindicador.cl/api');
        const datos = await respuesta.json();
        return datos;
     } catch (error) {
        document.querySelector('#buscar').textContent = `Error: ${error.message}`;
     }
}  
    function poblarSelectMonedas(tiposDeCambio) {
    const select = document.querySelector('#cambiomoneda');
    const monedas = ['dolar', 'euro'];

    for (let i = 0; i < monedas.length; i++) {
        const moneda = monedas[i];
        if (tiposDeCambio[moneda]) {
            select.innerHTML += `<option value="${moneda}">${tiposDeCambio[moneda].nombre}(${tiposDeCambio[moneda].unidad_medida})</option>`;
        }
    }
    
} 

async function convertirMoneda() {
    const monto = document.querySelector("#input").value;
    const moneda = document.querySelector("#cambiomoneda").value;

    if (monto === "" || moneda === "") {
        document.querySelector("#buscar").textContent = "Ingrese un valor valido"
        return;
    }

    try { 
        const tiposDeCambio = await obtenerTiposDeCambio();
        const tipoCambioSeleccionado = tiposDeCambio[moneda].valor;
        const resultado = Number(monto) / tipoCambioSeleccionado;

        document.querySelector("#buscar").textContent = `Resultado 
        ${tiposDeCambio[moneda].nombre} es ${resultado.toFixed(2)} ${tiposDeCambio[moneda].unidad_medida}`;
    } catch (error) {
        document.querySelector("#buscar").textContent = `Error: ${error.message}`;
    }
}

boton.addEventListener('click', convertirMoneda);

document.addEventListener('DOMContentLoaded', async () => {
    try{
        const tiposDeCambio = await obtenerTiposDeCambio();
        poblarSelectMonedas(tiposDeCambio);
        
    } catch (error) {
        console.error('No se puede Cargar el tipo de Cambio:',error);
    }
});



/*grafico*/




async function obtenerHistorialMoneda(moneda) {
    try {
    const respuesta = await fetch(`https://mindicador.cl/api/${moneda}`);
    const datos = await respuesta.json();
    return datos.serie.slice(0, 10);  /*ultimos 10 dias */
} catch (error) { 
     console.error(`Error al obtener el historial de ${moneda}:`, error);
    throw error; 
}
}


function hacerGrafico(historial, moneda){
    const labels = historial.map(entry => new Date(entry.fecha).toLocaleDateString());
    const data = historial.map(entry => entry.valor);

    if (myChart) {
        myChart.destroy();
    }

    myChart = new Chart(myChartCtx, {
        type:'line',
        data: {
                labels: labels,
                datasets: [{
                    label:`Historial de ${moneda.toUpperCase()} (ultimos 10 dias)`,
                    data: data,
                    borderColor: 'white',
                    borderWidth: 1

                }]
        },
        options: {
            scales: {
                y: { 
                    beginAtZero: false

                }
            }
        }
    });
}

async function actualizarGrafico(moneda) {
    try{
    const historial = await obtenerHistorialMoneda(moneda);
    if (historial) {
        actualizarGrafico(historial, moneda);
    }
} catch (error) {
    console.log('error al actualizar', error);
}  }





