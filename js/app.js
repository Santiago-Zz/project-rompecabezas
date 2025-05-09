document.addEventListener("DOMContentLoaded", () => {
    // Exportar la función mostrarPantalla para que puzzle.js pueda usarla
    window.mostrarPantalla = mostrarPantalla;
    
    // Ocultar todas las pantallas excepto la bienvenida al inicio
    document.querySelectorAll('.pantalla').forEach(p => {
        p.classList.remove('visible');
        p.style.display = 'none';
    });

    // Mostrar bienvenida primero
    mostrarPantalla("pantalla-bienvenida");

    // Después de 3.5 segundos, mostrar el formulario
    setTimeout(() => {
        mostrarPantalla("pantalla-formulario");
    }, 3500);

    // Evento al enviar el formulario
    document.querySelector("#pantalla-formulario form").addEventListener("submit", e => {
        e.preventDefault();
        mostrarPantalla("pantalla-juego");

        // Asegurarnos de que tenemos acceso a la función
        if (typeof window.ajustarTamanioCanvas === 'function') {
            window.ajustarTamanioCanvas();
        }

        if (typeof window.iniciarJuego === 'function') {
            window.iniciarJuego();
        } else {
            console.error("La función iniciarJuego no está definida. Verifica que puzzle.js se ha cargado correctamente");
        }
    });

    // Esta función debe ser llamada desde puzzle.js cuando termine el juego
    window.finalizarJuego = function(puntaje) {
        const puntajeFinal = (typeof puntaje === 'number' && !isNaN(puntaje)) ? puntaje : window.puntajeJuego;
        
        console.log("El puntaje final es: ", puntajeFinal);
        document.getElementById("puntaje-final").textContent = `Tu puntaje final fue: ${puntajeFinal}`;
        mostrarPantalla("pantalla-final");
        lanzarConfetti();
    };
});

// Función para mostrar una pantalla y ocultar las demás
function mostrarPantalla(pantallaNuevaId) {
    // Oculta completamente todas las pantallas
    document.querySelectorAll('.pantalla').forEach(p => {
        p.classList.remove('visible');
        p.style.display = 'none';
    });

    // Prepara la nueva pantalla y la muestra
    const nuevaPantalla = document.getElementById(pantallaNuevaId);
    if (!nuevaPantalla) {
        console.error(`Pantalla con ID ${pantallaNuevaId} no encontrada`);
        return;
    }
    
    nuevaPantalla.style.display = 'flex';

    // Pequeño retraso para permitir que el navegador aplique el display antes de añadir la clase visible
    setTimeout(() => {
        nuevaPantalla.classList.add('visible');
    }, 50);
}

function lanzarConfetti() {
    const contenedor = document.getElementById('confetti');
    contenedor.innerHTML = ''; // Limpiar confetti anterior
    let flakes = '';

    for (let i = 0; i < 200; i++) {
        const color = Math.floor(Math.random() * 16777215).toString(16);
        flakes += `<div class="ball" style="background:#${color}; left:${Math.random() * 100}vw; animation-duration:${Math.random() * 3 + 2}s; animation-delay:${Math.random()}s;"></div>`;
    }
    contenedor.innerHTML = flakes;
}

// Verificar que los scripts se han cargado correctamente
function verificarScriptsYAssets() {
    console.log("app.js cargado correctamente");
    
    // Verificar si las funciones de puzzle.js están disponibles
    if (window.iniciarJuego && window.ajustarTamanioCanvas) {
        console.log("puzzle.js cargado correctamente");
    } else {
        console.error("puzzle.js no se ha cargado correctamente o hay un error en el archivo");
    }
    
    // Verificar si los assets están disponibles
    const img = new Image();
    img.src = "assets/logo-coca-cola.jpg";
    img.onload = () => console.log("Imagen del rompecabezas cargada correctamente");
    img.onerror = () => console.error("Error al cargar la imagen del rompecabezas. Verifique la ruta: assets/logo-coca-cola.jpg");
    
    const imgFinal = new Image();
    imgFinal.src = "assets/snoopy.png";
    imgFinal.onload = () => console.log("Imagen final cargada correctamente");
    imgFinal.onerror = () => console.error("Error al cargar la imagen final. Verifique la ruta: assets/snoopy.png");
}

// Ejecutar verificación después de que todo esté cargado
window.addEventListener('load', verificarScriptsYAssets);