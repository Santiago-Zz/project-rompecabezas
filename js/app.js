document.addEventListener("DOMContentLoaded", () => {
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

        // Suponiendo que tienes esta función definida en puzzle.js
        if (typeof iniciarJuego === 'function') {
            iniciarJuego();
        } else {
            console.error("La función iniciarJuego no está definida");
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
    nuevaPantalla.style.display = 'flex';

    // Pequeño retraso para permitir que el navegador aplique el display antes de añadir la clase visible
    setTimeout(() => {
        nuevaPantalla.classList.add('visible');
    }, 50);
}

function lanzarConfetti() {
    const contenedor = document.getElementById('confetti');
    let flakes = '';

    for (let i = 0; i < 200; i++) {
        const color = Math.floor(Math.random() * 16777215).toString(16);
        flakes += `<div class="ball" style="background:#${color}; left:${Math.random() * 100}vw; animation-duration:${Math.random() * 3 + 2}s; animation-delay:${Math.random()}s;"></div>`;
    }
    contenedor.innerHTML += flakes;
}