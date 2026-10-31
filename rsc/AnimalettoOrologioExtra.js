
document.addEventListener("DOMContentLoaded", () => {

  // 1. ANIMALETTO
  const gatto = document.createElement("div");
  gatto.id = "animaletto";

  gatto.innerHTML = `
    <div class="fumetto">
      Zzz... Oh! Hi explorer!, how are you? I'm here to keep you company :D.
    </div>
    <img src="TextureGatto/gatto.png"
         alt="Il gatto del sito"
         title="Click me!">
  `;

  gatto.addEventListener("click", () => {
    gatto.classList.toggle("aperto");
  });

  document.body.appendChild(gatto);


  // 1B. IL GATTO CAMMINA PER LO SCHERMO
  const immagineGatto = gatto.querySelector("img");

  let x = 20;
  let y = 100;

  function cammina() {
    const larghezza = gatto.offsetWidth;
    const altezza = gatto.offsetHeight;

    const maxX = Math.max(0, window.innerWidth - larghezza);
    const maxY = Math.max(0, window.innerHeight - altezza);

    // Sceglie una nuova destinazione casuale
    let nuovoX;
    let nuovoY;

    // Evita, per quanto possibile, la zona dell'orologio
    // in basso a sinistra.
    do {
      nuovoX = Math.random() * maxX;
      nuovoY = Math.random() * maxY;
    } while (
      nuovoX < 230 &&
      nuovoY > window.innerHeight - 170
    );

    // Si gira nella direzione in cui sta andando
    immagineGatto.style.transform =
      nuovoX < x ? "scaleX(-1)" : "scaleX(1)";

    x = nuovoX;
    y = nuovoY;

    gatto.style.left = x + "px";
    gatto.style.top = y + "px";
  }

  // Parte dalla posizione iniziale
  gatto.style.left = x + "px";
  gatto.style.top = y + "px";

  // Cammina continuamente
  const intervalloGatto = setInterval(cammina, 2600);

  // Adatta la posizione se cambia la dimensione dello schermo
  window.addEventListener("resize", () => {
    x = Math.min(x, window.innerWidth - gatto.offsetWidth);
    y = Math.min(y, window.innerHeight - gatto.offsetHeight);

    x = Math.max(0, x);
    y = Math.max(0, y);

    gatto.style.left = x + "px";
    gatto.style.top = y + "px";
  });



  // 2. WIDGET: OROLOGIO E SORPRENDIMI
  const widget = document.createElement("div");
  widget.className = "widget-sito";

  widget.innerHTML = `
    <div class="riquadro">
      <div>LOCAL TIME</div>
      <div id="orario">--:--:--</div>
      <div id="data">--/--/----</div>
      <div id="saluto">Caricamento...</div>
    </div>

  `;

  document.body.appendChild(widget);


  // 3. OROLOGIO CHE SI AGGIORNA
  function aggiornaOrologio() {
    const adesso = new Date();
    const ora = adesso.getHours();

    document.getElementById("orario").textContent =
      adesso.toLocaleTimeString("it-IT");

    document.getElementById("data").textContent =
      adesso.toLocaleDateString("it-IT");

    let saluto;

    if (ora >= 6 && ora < 12) {
      saluto = "Goodmorning ☀";
    } else if (ora >= 12 && ora < 18) {
      saluto = "good afternoon ☁";
    } else if (ora >= 18 && ora < 22) {
      saluto = "Goodevening 🌙";
    } else {
      saluto = "It's late!... Zzz";
    }

    document.getElementById("saluto").textContent =
      saluto;
  }

  aggiornaOrologio();
  setInterval(aggiornaOrologio, 1000);


  // 4. PAGINE PER IL PULSANTE SORPRENDIMI
  // Sostituisci questi esempi con le TUE pagine!
  const pagine = [
    "index.html",
    "rsc/email.html",
    "rsc/info.html",
    "rsc/dreams/cat.html",
    "rsc/myblog.html"
  ];

  document.getElementById("sorprendimi")
    .addEventListener("click", () => {

      // Evita di selezionare la pagina corrente,
      // quando ci sono altre pagine disponibili.
      const alternative = pagine.filter(pagina => {
        const destinazione = new URL(
          pagina, window.location.href
        );

        return destinazione.pathname !==
          window.location.pathname;
      });

      if (alternative.length === 0) return;

      const scelta = alternative[
        Math.floor(Math.random() * alternative.length)
      ];

      window.location.href = scelta;
    });

});
