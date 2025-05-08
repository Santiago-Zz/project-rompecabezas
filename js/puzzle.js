// Variables globales
let tiempoRestante = 60;
let puntaje = 0;
let piezas = [];
let timer;
let anchoPieza, altoPieza;
let juegoActivo = false;

// Variable global para compartir entre archivos
window.puntajeJuego = 0;

function iniciarJuego() {
    // Evitar iniciar el juego múltiples veces
    if (juegoActivo) return;
    
    juegoActivo = true;
    puntaje = 0;
    window.puntajeJuego = 0; // Inicializar la variable global
    tiempoRestante = 60;
    
    const canvas = document.getElementById("rompecabezas");
    const ctx = canvas.getContext("2d");

    const filas = 4;
    const columnas = 4;
    
    // Reset del canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Ocultar pantalla final si estaba visible
    document.getElementById("pantalla-final").style.display = "none";

    // Actualizar información inicial
    document.getElementById("tiempo").textContent = `⏱️ Tiempo: ${tiempoRestante}`;
    document.getElementById("puntaje").textContent = `⭐ Puntaje: ${puntaje}`;

    let imagen = new Image();
    imagen.src = "assets/logo-coca-cola.jpg";

    let piezaSeleccionada = null;
    let offsetX, offsetY;
    let estaDragando = false;

    // Detener cualquier timer previo
    if (timer) clearInterval(timer);
    
    // Iniciar nuevo timer
    timer = setInterval(() => {
        tiempoRestante--;
        document.getElementById("tiempo").textContent = `⏱️ Tiempo: ${tiempoRestante}`;
        if (tiempoRestante <= 0) {
            clearInterval(timer);
            finalizarJuego();
        }
    }, 1000);

    imagen.onload = () => {
        // Calcular dimensiones para que la imagen encaje perfectamente en el canvas
        // y evitar cuadros vacíos
        const aspectRatio = imagen.width / imagen.height;
        
        // Asegurarse de que las dimensiones de pieza sean enteras
        anchoPieza = Math.floor(canvas.width / columnas);
        altoPieza = Math.floor(canvas.height / filas);
        
        crearPiezas();
        mezclarPiezas();
        dibujar();
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
        const margen = 10; // Margen de seguridad
        
        for (let p of piezas) {
            // Asegurar que las piezas no queden fuera del canvas
            p.dx = margen + Math.random() * (canvas.width - anchoPieza - margen * 2);
            p.dy = margen + Math.random() * (canvas.height - altoPieza - margen * 2);
        }
    }

    function dibujar() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar fondo con un color suave
        ctx.fillStyle = "#f9f9f9";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar guías sutiles para el rompecabezas
        ctx.strokeStyle = "#ddd";
        ctx.lineWidth = 1;
        
        // Dibujar líneas verticales
        for (let x = 0; x <= columnas; x++) {
            ctx.beginPath();
            ctx.moveTo(x * anchoPieza, 0);
            ctx.lineTo(x * anchoPieza, canvas.height);
            ctx.stroke();
        }
        
        // Dibujar líneas horizontales
        for (let y = 0; y <= filas; y++) {
            ctx.beginPath();
            ctx.moveTo(0, y * altoPieza);
            ctx.lineTo(canvas.width, y * altoPieza);
            ctx.stroke();
        }
        
        // Dibujar un borde alrededor del canvas
        ctx.strokeStyle = '#888';
        ctx.lineWidth = 2;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        
        // Dibujar todas las piezas que no están siendo arrastradas primero
        for (let p of piezas.filter(p => p !== piezaSeleccionada)) {
            ctx.drawImage(
                imagen,
                p.xOriginal * anchoPieza,
                p.yOriginal * altoPieza,
                anchoPieza,
                altoPieza,
                p.dx,
                p.dy,
                anchoPieza,
                altoPieza
            );
            
            // Dibujar un borde alrededor de cada pieza
            ctx.strokeStyle = p.encajada ? '#2e7d32' : '#000';
            ctx.lineWidth = 1;
            ctx.strokeRect(p.dx, p.dy, anchoPieza, altoPieza);
        }
        
        // Dibujar la pieza seleccionada al final para que aparezca encima
        if (piezaSeleccionada) {
            ctx.drawImage(
                imagen,
                piezaSeleccionada.xOriginal * anchoPieza,
                piezaSeleccionada.yOriginal * altoPieza,
                anchoPieza,
                altoPieza,
                piezaSeleccionada.dx,
                piezaSeleccionada.dy,
                anchoPieza,
                altoPieza
            );
            
            // Sombra para la pieza seleccionada
            ctx.shadowColor = 'rgba(0,0,0,0.5)';
            ctx.shadowBlur = 10;
            ctx.shadowOffsetX = 5;
            ctx.shadowOffsetY = 5;
            
            // Borde para la pieza seleccionada
            ctx.strokeStyle = '#ff0000';
            ctx.lineWidth = 2;
            ctx.strokeRect(piezaSeleccionada.dx, piezaSeleccionada.dy, anchoPieza, altoPieza);
            
            // Resetear sombra
            ctx.shadowColor = 'transparent';
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        }
    }

    // Limpiar los event listeners previos
    canvas.removeEventListener("mousedown", manejarMouseDown);
    canvas.removeEventListener("mousemove", manejarMouseMove);
    canvas.removeEventListener("mouseup", manejarMouseUp);
    
    // Definir los manejadores de eventos
    function manejarMouseDown(e) {
        if (!juegoActivo) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Buscar piezas desde arriba (última) hacia abajo para manejar superposición
        for (let i = piezas.length - 1; i >= 0; i--) {
            const p = piezas[i];
            if (!p.encajada &&
                x > p.dx && x < p.dx + anchoPieza &&
                y > p.dy && y < p.dy + altoPieza
            ) {
                // Mover la pieza seleccionada al final del array para que se dibuje encima
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
        if (!juegoActivo || !estaDragando || !piezaSeleccionada) return;
        
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        // Limitar el movimiento para que la pieza no salga del canvas
        piezaSeleccionada.dx = Math.max(0, Math.min(canvas.width - anchoPieza, x - offsetX));
        piezaSeleccionada.dy = Math.max(0, Math.min(canvas.height - altoPieza, y - offsetY));
        
        dibujar();
    }

    function manejarMouseUp(e) {
        if (!juegoActivo || !estaDragando) return;
        
        estaDragando = false;
        
        if (piezaSeleccionada) {
            const distancia = Math.hypot(
                piezaSeleccionada.dx - piezaSeleccionada.correctoX,
                piezaSeleccionada.dy - piezaSeleccionada.correctoY
            );

            if (distancia < 35) {
                // Se encaja automáticamente si está lo suficientemente cerca
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
    
    // Soporte para dispositivos táctiles
    canvas.addEventListener("touchstart", function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent("mousedown", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    }, false);
    
    canvas.addEventListener("touchmove", function(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const mouseEvent = new MouseEvent("mousemove", {
            clientX: touch.clientX,
            clientY: touch.clientY
        });
        canvas.dispatchEvent(mouseEvent);
    }, false);
    
    canvas.addEventListener("touchend", function(e) {
        e.preventDefault();
        const mouseEvent = new MouseEvent("mouseup", {});
        canvas.dispatchEvent(mouseEvent);
    }, false);
    
    // Agregar los event listeners
    canvas.addEventListener("mousedown", manejarMouseDown);
    canvas.addEventListener("mousemove", manejarMouseMove);
    canvas.addEventListener("mouseup", manejarMouseUp);
    
    // Manejar el caso donde el mouse sale del canvas mientras arrastra
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
    
    // También actualizar la variable global
    window.puntajeJuego = puntaje;
    
    // Actualizar con animación
    document.getElementById("puntaje").textContent = `⭐ Puntaje: ${puntaje}`;
    
    // Efecto visual para el cambio de puntaje
    const marcadorPuntaje = document.getElementById("puntaje");
    marcadorPuntaje.classList.add('puntaje-cambiado');
    setTimeout(() => {
        marcadorPuntaje.classList.remove('puntaje-cambiado');
    }, 300);
    
    console.log(`Puntaje actualizado: ${cambio > 0 ? '+' : ''}${cambio} → Total: ${puntaje}`);
}

function verificarJuego() {
    const incompletas = piezas.some(p => !p.encajada);
    if (!incompletas) {
        clearInterval(timer); // Detiene el tiempo del juego cuando haya completado
        finalizarJuego(true); // cambia la pantalla de puntaje final sin tener que esperar
    }
}

function finalizarJuego(completado = false) {
    juegoActivo = false;
    if (timer) clearInterval(timer);
    
    // Aseguramos que puntajeJuego esté actualizado con el puntaje actual
    window.puntajeJuego = puntaje;
    
    console.log("El juego ha finalizado");
    console.log("El puntaje es: ", puntaje);
    console.log("El puntaje global es: ", window.puntajeJuego);
    
    // Actualizar pantalla final
    document.getElementById("puntaje-final").textContent = `Tu puntaje final fue: ${window.puntajeJuego}`;
    
    // Mostrar mensaje según si completó el juego o se acabó el tiempo
    const mensajeFinal = document.querySelector("#pantalla-final h2");
    if (mensajeFinal) {
        if (completado) {
            mensajeFinal.textContent = "¡Felicidades! Completaste el rompecabezas";
        } else {
            mensajeFinal.textContent = "¡Se acabó el tiempo!";
        }
    }
    
    // Mostrar pantalla final
    document.getElementById("pantalla-final").style.display = "block";
    
    // Si existe una función global para finalizar, la llamamos
    if (window.finalizarJuego) {
        window.finalizarJuego(window.puntajeJuego);
    }
}

// Iniciar el juego cuando todo esté cargado
window.addEventListener('load', () => {
    const btnIniciar = document.getElementById('btn-iniciar');
    if (btnIniciar) {
        btnIniciar.focus();
    }
});