// Variables globales
let tiempoRestante = 60;
let puntaje = 0;
let piezas = [];
let timer;
let anchoPieza, altoPieza;
let juegoActivo = false;
let imagenCargada = false;
let imagen = new Image();

// Variable global para compartir entre archivos
window.puntajeJuego = 0;

// Función para ajustar dinámicamente el tamaño del canvas y las piezas
function ajustarTamanioCanvas() {
    const canvas = document.getElementById("rompecabezas");
    const contenedor = document.querySelector('.canvas-container') || document.body;
    
    // Obtener el tamaño disponible (con margen de seguridad)
    const anchoDisponible = Math.min(contenedor.clientWidth * 0.95, window.innerWidth * 0.9, 600);
    const altoDisponible = Math.min(contenedor.clientHeight * 0.95, window.innerHeight * 0.6, 600);
    
    // Crear un canvas cuadrado que se ajuste al espacio disponible
    const lado = Math.min(anchoDisponible, altoDisponible);
    
    canvas.width = lado;
    canvas.height = lado;
    
    console.log(`Canvas ajustado a: ${lado}x${lado}`);
    
    // Si la imagen ya está cargada y el juego está activo, recalcular tamaños de piezas
    if (imagenCargada && juegoActivo) {
        recalcularPiezas();
    }
    
    return lado;
}

function recalcularPiezas() {
    const canvas = document.getElementById("rompecabezas");
    const filas = 4;
    const columnas = 4;
    
    // Recalcular dimensiones de las piezas
    anchoPieza = Math.floor(canvas.width / columnas);
    altoPieza = Math.floor(canvas.height / filas);
    
    // Actualizar posiciones de las piezas manteniendo su estado
    for (let p of piezas) {
        // Actualizar las posiciones correctas
        p.correctoX = p.xOriginal * anchoPieza;
        p.correctoY = p.yOriginal * altoPieza;
        
        if (p.encajada) {
            // Si ya estaba encajada, moverla a la nueva posición correcta
            p.dx = p.correctoX;
            p.dy = p.correctoY;
        } else {
            // Si no estaba encajada, mantener su posición relativa
            const porcentajeX = p.dx / (canvas.width - (anchoPieza / 2));
            const porcentajeY = p.dy / (canvas.height - (altoPieza / 2));
            
            p.dx = Math.max(0, Math.min(canvas.width - anchoPieza, porcentajeX * (canvas.width - anchoPieza)));
            p.dy = Math.max(0, Math.min(canvas.height - altoPieza, porcentajeY * (canvas.height - altoPieza)));
        }
    }
    
    // Redibujar todo
    dibujar();
}

function iniciarJuego() {
    if (juegoActivo) return;
    
    // Asegura tamaño correcto
    const tamanoCanvas = ajustarTamanioCanvas();
    
    juegoActivo = true;
    puntaje = 0;
    window.puntajeJuego = 0;
    tiempoRestante = 60;
    imagenCargada = false;

    const canvas = document.getElementById("rompecabezas");
    const ctx = canvas.getContext("2d");

    const filas = 4;
    const columnas = 4;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    document.getElementById("pantalla-final").style.display = "none";
    document.getElementById("tiempo").textContent = `⏱️ Tiempo: ${tiempoRestante}`;
    document.getElementById("puntaje").textContent = `⭐ Puntaje: ${puntaje}`;

    // Mostrar un indicador de carga mientras se carga la imagen
    ctx.fillStyle = "#f5f5f5";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#333";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";
    ctx.fillText("Cargando imagen...", canvas.width/2, canvas.height/2);

    // Ruta absoluta para garantizar que la imagen se cargue correctamente
    imagen = new Image();
    imagen.src = "assets/logo-coca-cola.jpg";
    
    console.log("Cargando imagen desde:", imagen.src);

    let piezaSeleccionada = null;
    let offsetX, offsetY;
    let estaDragando = false;

    if (timer) clearInterval(timer);

    timer = setInterval(() => {
        tiempoRestante--;
        document.getElementById("tiempo").textContent = `⏱️ Tiempo: ${tiempoRestante}`;
        if (tiempoRestante <= 0) {
            clearInterval(timer);
            finalizarJuego();
        }
    }, 1000);

    imagen.onload = () => {
        console.log("Imagen cargada correctamente");
        imagenCargada = true;
        
        // Calcular dimensiones de las piezas basadas en el canvas actual
        anchoPieza = Math.floor(canvas.width / columnas);
        altoPieza = Math.floor(canvas.height / filas);

        crearPiezas();
        mezclarPiezas();
        dibujar();
    };

    imagen.onerror = (error) => {
        console.error("Error al cargar la imagen:", error);
        // Cargar una imagen alternativa o mostrar un mensaje de error
        ctx.fillStyle = "#f44336";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "white";
        ctx.font = "20px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Error al cargar la imagen", canvas.width/2, canvas.height/2);
    };

    function crearPiezas() {
        piezas = [];
        for (let y = 0; y < filas; y++) {
            for (let x = 0; x < columnas; x++) {
                piezas.push({
                    xOriginal: x,
                    yOriginal: y,
                    correctoX: x * anchoPieza,
                    correctoY: y * altoPieza,
                    dx: x * anchoPieza,
                    dy: y * altoPieza,
                    encajada: false
                });
            }
        }
    }

    function mezclarPiezas() {
        // Usar un margen proporcional al tamaño del canvas
        const margenPorcentaje = 0.05; // 5% del tamaño del canvas
        const margen = Math.floor(canvas.width * margenPorcentaje);
        
        for (let p of piezas) {
            p.dx = margen + Math.random() * (canvas.width - anchoPieza - margen * 2);
            p.dy = margen + Math.random() * (canvas.height - altoPieza - margen * 2);
        }
    }

    function dibujar() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = "#f9f9f9";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = "#ddd";
        ctx.lineWidth = 1;

        // Dibujar la cuadrícula de fondo
        for (let x = 0; x <= columnas; x++) {
            ctx.beginPath();
            ctx.moveTo(x * anchoPieza, 0);
            ctx.lineTo(x * anchoPieza, canvas.height);
            ctx.stroke();
        }

        for (let y = 0; y <= filas; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * altoPieza);
            ctx.lineTo(canvas.width, y * altoPieza);
            ctx.stroke();
        }

        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        // Dibujar todas las piezas que no están siendo arrastradas
        for (let p of piezas.filter(p => p !== piezaSeleccionada)) {
            ctx.drawImage(
                imagen,
                p.xOriginal * (imagen.width / columnas),    // Coordenada x de la fuente (imagen original)
                p.yOriginal * (imagen.height / filas),     // Coordenada y de la fuente (imagen original)
                imagen.width / columnas,                   // Ancho del recorte en la imagen original
                imagen.height / filas,                     // Alto del recorte en la imagen original
                p.dx,                                      // Coordenada x de destino (canvas)
                p.dy,                                      // Coordenada y de destino (canvas)
                anchoPieza,                                // Ancho de la pieza en el canvas
                altoPieza                                  // Alto de la pieza en el canvas
            );
            ctx.strokeStyle = p.encajada ? '#2e7d32' : '#000';
            ctx.lineWidth = 1;
            ctx.strokeRect(p.dx, p.dy, anchoPieza, altoPieza);
        }

        // Dibujar la pieza seleccionada al final para que aparezca encima
        if (piezaSeleccionada) {
            ctx.drawImage(
                imagen,
                piezaSeleccionada.xOriginal * (imagen.width / columnas),
                piezaSeleccionada.yOriginal * (imagen.height / filas),
                imagen.width / columnas,
                imagen.height / filas,
                piezaSeleccionada.dx,
                piezaSeleccionada.dy,
                anchoPieza,
                altoPieza
            );

            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 5;
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 2;
            ctx.strokeRect(piezaSeleccionada.dx, piezaSeleccionada.dy, anchoPieza, altoPieza);
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }
    }

    // Asegúrate de eliminar los listeners anteriores antes de agregar nuevos
    canvas.removeEventListener("mousedown", manejarMouseDown);
    canvas.removeEventListener("mousemove", manejarMouseMove);
    canvas.removeEventListener("mouseup", manejarMouseUp);
    canvas.removeEventListener("touchstart", manejarTouchStart);
    canvas.removeEventListener("touchmove", manejarTouchMove);
    canvas.removeEventListener("touchend", manejarTouchEnd);

    function manejarMouseDown(e) {
        if (!juegoActivo || !imagenCargada) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;    // Relación entre el tamaño del canvas y su tamaño mostrado
        const scaleY = canvas.height / rect.height;
        
        const x = (e.clientX - rect.left) * scaleX;  // Escalar las coordenadas del clic al tamaño real del canvas
        const y = (e.clientY - rect.top) * scaleY;

        for (let i = piezas.length - 1; i >= 0; i--) {
            const p = piezas[i];
            if (!p.encajada &&
                x > p.dx && x < p.dx + anchoPieza &&
                y > p.dy && y < p.dy + altoPieza
            ) {
                piezas.splice(i, 1);
                piezas.push(p);
                piezaSeleccionada = p;
                offsetX = x - p.dx;
                offsetY = y - p.dy;
                estaDragando = true;
                break;
            }
        }

        dibujar();
    }

    function manejarMouseMove(e) {
        if (!juegoActivo || !estaDragando || !piezaSeleccionada || !imagenCargada) return;
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;

        piezaSeleccionada.dx = Math.max(0, Math.min(canvas.width - anchoPieza, x - offsetX));
        piezaSeleccionada.dy = Math.max(0, Math.min(canvas.height - altoPieza, y - offsetY));
        dibujar();
    }

    function manejarMouseUp() {
        if (!juegoActivo || !estaDragando || !imagenCargada) return;

        estaDragando = false;

        if (piezaSeleccionada) {
            const distanciaMaxima = Math.min(anchoPieza, altoPieza) * 0.3; // Distancia proporcional al tamaño de la pieza
            const distancia = Math.hypot(
                piezaSeleccionada.dx - piezaSeleccionada.correctoX,
                piezaSeleccionada.dy - piezaSeleccionada.correctoY
            );

            if (distancia < distanciaMaxima) {
                piezaSeleccionada.dx = piezaSeleccionada.correctoX;
                piezaSeleccionada.dy = piezaSeleccionada.correctoY;
                piezaSeleccionada.encajada = true;
                actualizarPuntaje(10);
            } else {
                actualizarPuntaje(-5);
            }

            piezaSeleccionada = null;
            dibujar();
            verificarJuego();
        }
    }

    function manejarTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const simulatedEvent = {
            clientX: touch.clientX,
            clientY: touch.clientY
        };
        manejarMouseDown(simulatedEvent);
    }

    function manejarTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const simulatedEvent = {
            clientX: touch.clientX,
            clientY: touch.clientY
        };
        manejarMouseMove(simulatedEvent);
    }

    function manejarTouchEnd(e) {
        e.preventDefault();
        manejarMouseUp();
    }

    // Agregar listeners
    canvas.addEventListener("mousedown", manejarMouseDown);
    canvas.addEventListener("mousemove", manejarMouseMove);
    canvas.addEventListener("mouseup", manejarMouseUp);
    canvas.addEventListener("touchstart", manejarTouchStart, { passive: false });
    canvas.addEventListener("touchmove", manejarTouchMove, { passive: false });
    canvas.addEventListener("touchend", manejarTouchEnd, { passive: false });

    document.addEventListener("mouseup", () => {
        if (estaDragando) {
            estaDragando = false;
            piezaSeleccionada = null;
            dibujar();
        }
    });
}

function actualizarPuntaje(cambio) {
    puntaje += cambio;
    if (puntaje < 0) puntaje = 0;
    window.puntajeJuego = puntaje;

    document.getElementById("puntaje").textContent = `⭐ Puntaje: ${puntaje}`;
    const marcadorPuntaje = document.getElementById("puntaje");
    marcadorPuntaje.classList.add('puntaje-cambiado');
    setTimeout(() => {
        marcadorPuntaje.classList.remove('puntaje-cambiado');
    }, 300);
}

function verificarJuego() {
    const incompletas = piezas.some(p => !p.encajada);
    if (!incompletas) {
        clearInterval(timer);
        finalizarJuego(true);
    }
}

function finalizarJuego(completado = false) {
    juegoActivo = false;
    if (timer) clearInterval(timer);
    window.puntajeJuego = puntaje;

    document.getElementById("puntaje-final").textContent = `Tu puntaje final fue: ${window.puntajeJuego}`;

    const mensajeFinal = document.querySelector("#pantalla-final h2");
    if (mensajeFinal) {
        mensajeFinal.textContent = completado ? "¡Felicidades! Completaste el rompecabezas" : "¡Se acabó el tiempo!";
    }

    // En lugar de mostrar/ocultar directamente, usa la función del app.js
    if (window.mostrarPantalla) {
        window.mostrarPantalla("pantalla-final");
    } else {
        document.getElementById("pantalla-final").style.display = "flex";
        document.getElementById("pantalla-final").classList.add("visible");
    }

    if (window.finalizarJuego) {
        window.finalizarJuego(window.puntajeJuego);
    }
}

// Redimensionar el canvas y reubicar las piezas cuando cambia el tamaño de pantalla
let temporizadorResize;
window.addEventListener("resize", () => {
    // Usar debounce para evitar múltiples recalculos rápidos
    clearTimeout(temporizadorResize);
    temporizadorResize = setTimeout(() => {
        ajustarTamanioCanvas();
        if (juegoActivo && imagenCargada) {
            recalcularPiezas();
        }
    }, 250);
});

// Enfocar botón de inicio al cargar
window.addEventListener('load', () => {
    const btnIniciar = document.getElementById('btn-iniciar');
    if (btnIniciar) btnIniciar.focus();
    
    // Detectar orientación y mostrar mensaje en móviles si es necesario
    detectarOrientacion();
});

function detectarOrientacion() {
    // Solo mostrar mensaje en dispositivos móviles
    if (window.innerWidth < 768) {
        if (window.innerHeight < window.innerWidth) {
            mostrarMensajeOrientacion(true); // Landscape
        } else {
            mostrarMensajeOrientacion(false); // Portrait
        }
    }
}

function mostrarMensajeOrientacion(esLandscape) {
    // Crear o actualizar mensaje de orientación
    let mensajeEl = document.getElementById('mensaje-orientacion');
    if (!mensajeEl) {
        mensajeEl = document.createElement('div');
        mensajeEl.id = 'mensaje-orientacion';
        mensajeEl.style.position = 'fixed';
        mensajeEl.style.bottom = '10px';
        mensajeEl.style.left = '10px';
        mensajeEl.style.right = '10px';
        mensajeEl.style.backgroundColor = 'rgba(0,0,0,0.7)';
        mensajeEl.style.color = 'white';
        mensajeEl.style.padding = '10px';
        mensajeEl.style.borderRadius = '5px';
        mensajeEl.style.textAlign = 'center';
        mensajeEl.style.zIndex = '9999';
        document.body.appendChild(mensajeEl);
    }
    
    if (esLandscape) {
        mensajeEl.textContent = '📱 Para una mejor experiencia, gira tu dispositivo a modo vertical';
        mensajeEl.style.display = 'block';
    } else {
        mensajeEl.style.display = 'none';
    }
}

// Monitorear cambios de orientación en dispositivos móviles
window.addEventListener('orientationchange', detectarOrientacion);

// Exportar la función para que app.js pueda usarla
window.iniciarJuego = iniciarJuego;
window.ajustarTamanioCanvas = ajustarTamanioCanvas;