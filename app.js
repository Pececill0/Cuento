// app.js

// --- YouTube (GLOBAL, no dentro de DOMContentLoaded) ---
const YT_VIDEO_ID = "yJvUO-eWR5Q";

// --- 1) Pantalla de entrada ---
document.addEventListener('DOMContentLoaded', () => {
  const welcome = document.getElementById('welcome-screen');
  const gift = document.getElementById('gift-click-area');
  const main = document.getElementById('main-content');
  const videoBtn = document.getElementById('videoBtn');

  gift.addEventListener('click', () => {
    welcome.classList.add('hidden');
    main.classList.add('visible');

    // Mostrar botón de video desde que entras al libro (tu requisito)
    if (videoBtn) videoBtn.style.display = "inline-flex";

    setTimeout(() => { welcome.style.display = 'none'; }, 850);
  });
});

// --- 2) Lógica del libro ---
const TOTAL_SPREADS = 12; 
const spreads = Array.from({ length: TOTAL_SPREADS }, (_, k) => {
  const n = String(k + 1).padStart(2, "0");
  return `assets/spreads/${n}.jpg`;
});

let currentIndex = 0;     // 0 = portada (01.jpg), 1 = primer interior (02.jpg)
let isAnimating = false;
let isBookOpen = false;

const book = document.getElementById('book');
const coverFace = document.getElementById('coverFace');
const staticLeft = document.getElementById('staticLeft');
const staticRight = document.getElementById('staticRight');
const flipper = document.getElementById('flipper');
const flipperFront = document.getElementById('flipperFront');
const flipperBack = document.getElementById('flipperBack');
const prevBtn = document.getElementById('prevBtn');
const nextBtn = document.getElementById('nextBtn');
const counter = document.getElementById('counter');

function init() {
  coverFace.style.backgroundImage = `url('${spreads[0]}')`;
  updateControls();
}

function updateOpenBookViews(index) {
  const imgUrl = `url('${spreads[index]}')`;

  // páginas estáticas
  staticLeft.style.backgroundImage = imgUrl;
  staticRight.style.backgroundImage = imgUrl;

  // hoja que gira (front/back)
  flipperFront.style.backgroundImage = imgUrl;
  flipperBack.style.backgroundImage = imgUrl;
}

function openBook() {
  if (isAnimating || isBookOpen) return;

  isAnimating = true;
  book.classList.add('opening');

  setTimeout(() => {
    book.classList.add('opened');
    isBookOpen = true;

    currentIndex = 1; // primer interior = 02.jpg
    updateOpenBookViews(currentIndex);
    updateControls();

    isAnimating = false;
  }, 800);
}

// AVANZAR
function goNext() {
  if (!isBookOpen) { openBook(); return; }
  if (isAnimating || currentIndex >= spreads.length - 1) return;

  isAnimating = true;
  flipper.classList.add('turning-next');

  const onNextDone = () => {
    flipper.removeEventListener('transitionend', onNextDone);

    currentIndex++;
    updateOpenBookViews(currentIndex);

    // reset del flipper sin animación (tu técnica)
    flipper.classList.add('no-anim');
    flipper.classList.remove('turning-next');
    void flipper.offsetWidth;
    flipper.classList.remove('no-anim');

    updateControls();
    isAnimating = false;

    // Si llegaste al último spread, puedes mostrar el video automáticamente si quieres:
    // (si NO lo quieres automático, comenta estas 2 líneas)
    // if (currentIndex >= spreads.length - 1) setTimeout(showEndVideo, 350);
  };

  flipper.addEventListener('transitionend', onNextDone);
}

// RETROCEDER (tu versión con animación inversa)
function goPrev() {
  if (isAnimating || !isBookOpen) return;

  if (currentIndex <= 1) {
    closeBook();
    return;
  }

  isAnimating = true;

  const prevIdx = currentIndex - 1;
  const imgPrev = `url('${spreads[prevIdx]}')`;
  const imgCurr = `url('${spreads[currentIndex]}')`;

  staticLeft.style.backgroundImage = imgPrev;
  staticRight.style.backgroundImage = imgCurr;
  flipperBack.style.backgroundImage = imgCurr;
  flipperFront.style.backgroundImage = imgPrev;

  flipper.classList.add('no-anim', 'turning-next');
  void flipper.offsetWidth;

  setTimeout(() => {
    flipper.classList.remove('no-anim');

    setTimeout(() => {
      flipper.classList.remove('turning-next');

      const onPrevDone = () => {
        flipper.removeEventListener('transitionend', onPrevDone);
        finishPrev();
      };

      flipper.addEventListener('transitionend', onPrevDone);

      setTimeout(() => {
        if (isAnimating) {
          flipper.removeEventListener('transitionend', onPrevDone);
          finishPrev();
        }
      }, 800);

    }, 50);
  }, 50);
}

function finishPrev() {
  currentIndex--;
  updateOpenBookViews(currentIndex);
  updateControls();
  isAnimating = false;
}

function closeBook() {
  isAnimating = true;
  book.classList.remove('opened');

  setTimeout(() => {
    book.classList.remove('opening');
    isBookOpen = false;
    currentIndex = 0;
    init();
    isAnimating = false;
  }, 500);
}

function updateControls() {
  if (!isBookOpen) {
    counter.textContent = "Portada";
    prevBtn.disabled = true;
    nextBtn.disabled = false;
  } else {
    counter.textContent = `Spread ${currentIndex} / ${spreads.length - 1}`;
    prevBtn.disabled = false;
    nextBtn.disabled = (currentIndex >= spreads.length - 1);
  }
}

document.getElementById('cover').addEventListener('click', openBook);
nextBtn.addEventListener('click', goNext);
prevBtn.addEventListener('click', goPrev);

// EFECTO 3D con mouse
document.addEventListener('mousemove', (e) => {
  if (!isBookOpen) return;
  const xAxis = (window.innerWidth / 2 - e.pageX) / 60;
  const yAxis = (window.innerHeight / 2 - e.pageY) / 60;
  book.style.transform = `rotateY(${-xAxis}deg) rotateX(${yAxis}deg)`;
});

// --- Mini reproductor ---
const bgMusic  = document.getElementById("bgMusic");
const mpToggle = document.getElementById("mpToggle");
const mpVolume = document.getElementById("mpVolume");

bgMusic.volume = Number(mpVolume.value);

mpToggle.addEventListener("click", async () => {
  try {
    if (bgMusic.paused) {
      await bgMusic.play();
      mpToggle.textContent = "⏸";
    } else {
      bgMusic.pause();
      mpToggle.textContent = "▶";
    }
  } catch (e) {
    console.log("No se pudo reproducir audio:", e);
  }
});

mpVolume.addEventListener("input", () => {
  bgMusic.volume = Number(mpVolume.value);
});

bgMusic.addEventListener("pause", () => { mpToggle.textContent = "▶"; });
bgMusic.addEventListener("play",  () => { mpToggle.textContent = "⏸"; });

// --- Overlay YouTube ---
const endOverlay = document.getElementById("endOverlay");
const ytFrame    = document.getElementById("ytFrame");
const endClose   = document.getElementById("endClose");
const endReplay  = document.getElementById("endReplay");
const videoBtn   = document.getElementById("videoBtn");

function showEndVideo() {
  ytFrame.src = `https://www.youtube.com/embed/${YT_VIDEO_ID}?rel=0&modestbranding=1`;
  endOverlay.classList.add("show");
  endOverlay.setAttribute("aria-hidden", "false");
}

function hideEndVideo() {
  endOverlay.classList.remove("show");
  endOverlay.setAttribute("aria-hidden", "true");
  ytFrame.src = "";
}

endClose.addEventListener("click", hideEndVideo);
endOverlay.addEventListener("click", (e) => {
  if (e.target === endOverlay) hideEndVideo();
});

// Botón visible desde que entras al libro
if (videoBtn) {
  videoBtn.addEventListener("click", showEndVideo);
}

// Replay: vuelve al inicio del libro (02.jpg)
endReplay.addEventListener("click", () => {
  hideEndVideo();
  if (!isBookOpen) openBook();

  // Asegura estar en modo libro abierto y reiniciar al primer interior
  currentIndex = 1;
  updateOpenBookViews(currentIndex);
  updateControls();
});

// Inicio

// --- Nota de instrucciones ---
const noteOverlay = document.getElementById("noteOverlay");
const noteClose   = document.getElementById("noteClose");

noteClose.addEventListener("click", () => {
  noteOverlay.style.display = "none";
});

init();
