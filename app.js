// ===== PARTE 1: PASAR LAS PÁGINAS DEL LIBRO =====

// document.querySelectorAll busca en la página TODOS los elementos que tengan esa clase y los guarda en una lista
const paginas = document.querySelectorAll('.pagina');
const puntos = document.querySelectorAll('.pt'); // los circulitos de abajo

// "let" crea una variable que puede cambiar. Aquí guarda el número de la página que se ve (0 = portada)
let actual = 0;

function mostrar(n) {
  if (n < 0 || n >= paginas.length) return; // si esa página no existe, no hace nada

  // classList.remove quita una clase CSS de un elemento (así la página se oculta)
  paginas[actual].classList.remove('activa');
  // La última página (dedicatoria) no tiene circulito, por eso primero preguntamos si existe: if (puntos[actual])
  if (puntos[actual]) puntos[actual].classList.remove('on');

  actual = n;

  // classList.add pone una clase CSS (así la página se muestra)
  paginas[actual].classList.add('activa');
  if (puntos[actual]) puntos[actual].classList.add('on');

  // window.scrollTo sube la pantalla al inicio de la página
  window.scrollTo(0, 0);
}

// document.getElementById busca UN elemento por su id.
// addEventListener significa: "cuando pase esto (click), ejecuta lo que sigue"
document.getElementById('sig').addEventListener('click', () => mostrar(actual + 1));
document.getElementById('ant').addEventListener('click', () => mostrar(actual - 1));
document.getElementById('abrir').addEventListener('click', () => mostrar(1));

// forEach repite algo para cada elemento de la lista (cada circulito lleva a su página)
puntos.forEach((punto, i) => punto.addEventListener('click', () => mostrar(i)));

// Flechas del teclado en computadora
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') mostrar(actual + 1);
  if (e.key === 'ArrowLeft') mostrar(actual - 1);
});

// ===== PARTE 2: REPRODUCTOR DE MÚSICA =====
// El <audio> está fuera de las páginas, por eso la música NO se reinicia al cambiar de capítulo.

const audio = document.getElementById('audio');
const panel = document.getElementById('panel');
const vinilo = document.getElementById('vinilo');
const botonPlay = document.getElementById('play');
const barra = document.getElementById('barra');
const botonBucle = document.getElementById('bucle');
const volumen = document.getElementById('vol');
const disco = document.getElementById('disco');
const tiempoActual = document.getElementById('t1');
const tiempoFalta = document.getElementById('t2');
const atras = document.getElementById('atras');
const adelante = document.getElementById('adelante');

audio.volume = Number(volumen.value); // audio.volume va de 0 (silencio) a 1 (máximo)

// Abrir y cerrar el panel al tocar el disco (classList.toggle pone la clase si no está y la quita si está)
vinilo.addEventListener('click', () => panel.classList.toggle('abierto'));

// Play / pausa: la música solo empieza cuando la persona presiona el botón
botonPlay.addEventListener('click', () => {
  if (audio.paused) {
    audio.play().catch(() => {}); // audio.play() inicia la canción; .catch evita errores si el navegador la bloquea
  } else {
    audio.pause(); // audio.pause() detiene la canción donde está
  }
});

// Estos eventos se disparan solos cuando la canción empieza o se detiene (también si se pausa por otro motivo)
audio.addEventListener('play', () => {
  botonPlay.textContent = '❚❚';
  vinilo.classList.add('sonando'); // el disco empieza a girar
  disco.classList.add('sonando');
});
audio.addEventListener('pause', () => {
  botonPlay.textContent = '▶';
  vinilo.classList.remove('sonando');
  disco.classList.remove('sonando');
});

// "timeupdate" ocurre varias veces por segundo mientras suena: movemos la barra de progreso
audio.addEventListener('timeupdate', () => {
  if (audio.duration) barra.value = (audio.currentTime / audio.duration) * 100; // currentTime = segundo actual; duration = duración total
  actualizarTiempos();
});

// Al arrastrar la barra, saltamos a ese punto de la canción
barra.addEventListener('input', () => {
  if (audio.duration) audio.currentTime = (barra.value / 100) * audio.duration;
});

// Bucle opcional: audio.loop en true repite la canción sin parar
botonBucle.addEventListener('click', () => {
  audio.loop = !audio.loop; // el signo ! invierte: si era true pasa a false y al revés
  botonBucle.classList.toggle('on', audio.loop);
});

// Volumen
volumen.addEventListener('input', () => {
  audio.volume = Number(volumen.value); // Number() convierte el texto de la barra en número
});

// Si se reproduce el video de la reseña, pausamos la música para que no se mezclen
const video = document.querySelector('video');
video.addEventListener('play', () => audio.pause());

// Convierte segundos en texto "m:ss" (por ejemplo 75 -> "1:15")
function formato(seg) {
  const m = Math.floor(seg / 60); // Math.floor redondea hacia abajo
  const s = Math.floor(seg % 60); // % da el resto de la división
  return m + ':' + (s < 10 ? '0' : '') + s;
}

// Muestra el tiempo que lleva y el que falta
function actualizarTiempos() {
  tiempoActual.textContent = formato(audio.currentTime); // textContent cambia el texto de un elemento
  if (audio.duration) tiempoFalta.textContent = '-' + formato(audio.duration - audio.currentTime);
}
audio.addEventListener('loadedmetadata', actualizarTiempos); // "loadedmetadata": el navegador ya conoce la duración

// Botones para retroceder o adelantar 10 segundos
atras.addEventListener('click', () => {
  audio.currentTime = Math.max(0, audio.currentTime - 10); // Math.max elige el mayor: así nunca baja de 0
});
adelante.addEventListener('click', () => {
  audio.currentTime = Math.min(audio.duration || 0, audio.currentTime + 10); // Math.min elige el menor: así no pasa del final
});

// ===== PARTE 3: ELEGIR CANCIÓN =====
const opciones = document.querySelectorAll('.opcion'); // todos los botones de canciones de la lista
const nombreAhora = document.getElementById('ahora'); // el texto con el nombre de la canción actual

opciones.forEach((boton) => {
  boton.addEventListener('click', () => {
    const archivo = boton.dataset.archivo; // dataset lee los datos guardados en el HTML con data-... (aquí data-archivo)
    if (audio.src.endsWith(archivo)) {
      // endsWith pregunta si la dirección termina con ese texto: si es la misma canción, solo alterna play/pausa
      if (audio.paused) audio.play().catch(() => {});
      else audio.pause();
    } else {
      audio.src = archivo; // cambiar src cambia la canción; como hay un solo <audio>, nunca suenan dos a la vez
      audio.play().catch(() => {});
    }
    opciones.forEach((o) => o.classList.remove('activa')); // quita la marca a todas las canciones
    boton.classList.add('activa'); // y se la pone a la elegida
    nombreAhora.textContent = boton.dataset.titulo; // muestra el nombre de la canción elegida
  });
});

// ===== ÍNDICE =====
// Cada botón del índice guarda en data-ir el número de su página; al tocarlo, vamos a esa página
document.querySelectorAll('[data-ir]').forEach((b) => {
  b.addEventListener('click', () => mostrar(Number(b.dataset.ir))); // Number() convierte el texto "2" en el número 2
});
