
(() => {
  const root = document.getElementById("aero-music-player");
  if (!root || root.dataset.initialized === "true") return;

  root.dataset.initialized = "true";

  const audio = root.querySelector("#aero-audio");
  const playButton = root.querySelector("#aero-play");
  const nextButton = root.querySelector("#aero-next");
  const singleInput = root.querySelector("#aero-single-file");
  const folderInput = root.querySelector("#aero-folder-files");
  const title = root.querySelector("#aero-track-title");
  const status = root.querySelector("#aero-status");
  const modeLabel = root.querySelector("#aero-mode-label");
  const seek = root.querySelector("#aero-seek");
  const volume = root.querySelector("#aero-volume");
  const currentTimeLabel = root.querySelector("#aero-current-time");
  const durationLabel = root.querySelector("#aero-duration");

  let mode = "single";
  let tracks = [];
  let queue = [];
  let currentTrack = null;
  let objectUrl = null;
  let lastTrackInCycle = null;

  const audioExtensions =
    /\.(mp3|wav|ogg|m4a|aac|flac|opus|weba|aif|aiff)$/i;

  function formatTime(seconds) {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";

    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    return `${mins}:${String(secs).padStart(2, "0")}`;
  }

  function shuffle(list) {
    const result = [...list];

    for (let i = result.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [result[i], result[j]] = [result[j], result[i]];
    }

    // Evita che il primo brano del nuovo ciclo sia
    // lo stesso con cui si è concluso il ciclo precedente.
    if (
      result.length > 1 &&
      lastTrackInCycle &&
      result[0] === lastTrackInCycle
    ) {
      const swapIndex = 1 + Math.floor(
        Math.random() * (result.length - 1)
      );

      [result[0], result[swapIndex]] =
        [result[swapIndex], result[0]];
    }

    return result;
  }

  function setStatus(message) {
    status.textContent = message;
  }

  function releaseObjectUrl() {
    if (objectUrl) {
      URL.revokeObjectURL(objectUrl);
      objectUrl = null;
    }
  }

  async function playTrack(file) {
    if (!file) return;

    releaseObjectUrl();

    currentTrack = file;
    objectUrl = URL.createObjectURL(file);
    audio.src = objectUrl;
    audio.loop = mode === "single";

    title.textContent = file.name;
    setStatus(mode === "single" ? "Single track · Loop" : "Shuffle playlist");
    modeLabel.textContent =
      mode === "single" ? "SINGLE MODE" : "SHUFFLE MODE";

    seek.value = 0;
    currentTimeLabel.textContent = "0:00";
    durationLabel.textContent = "0:00";
    playButton.textContent = "▶";

    try {
      await audio.play();
    } catch (error) {
      // Alcuni browser possono richiedere un nuovo clic
      // prima di permettere la riproduzione.
      setStatus("Premi ▶ per riprodurre");
    }
  }

  async function playNextTrack() {
    if (mode === "single") {
      // In modalità singola il brano si ripete in loop.
      if (currentTrack) {
        audio.currentTime = 0;
        try {
          await audio.play();
        } catch (error) {
          setStatus("Premi ▶ per riprodurre");
        }
      }
      return;
    }

    if (tracks.length === 0) return;

    if (queue.length === 0) {
      lastTrackInCycle = currentTrack;
      queue = shuffle(tracks);
    }

    const nextTrack = queue.shift();
    await playTrack(nextTrack);
  }

  singleInput.addEventListener("change", async () => {
    const file = singleInput.files && singleInput.files[0];
    if (!file) return;

    mode = "single";
    tracks = [file];
    queue = [];
    lastTrackInCycle = null;

    await playTrack(file);

    // Permette di selezionare di nuovo lo stesso file.
    singleInput.value = "";
  });

  folderInput.addEventListener("change", async () => {
    const files = Array.from(folderInput.files || [])
      .filter(file => {
        return file.type.startsWith("audio/") ||
          audioExtensions.test(file.name);
      });

    if (files.length === 0) {
      setStatus("Nessun file audio trovato");
      folderInput.value = "";
      return;
    }

    mode = "folder";
    tracks = files;
    queue = shuffle(tracks);
    lastTrackInCycle = null;

    setStatus(`${tracks.length} brani caricati`);
    modeLabel.textContent = "SHUFFLE MODE";

    await playNextTrack();

    folderInput.value = "";
  });

  playButton.addEventListener("click", async () => {
    if (!audio.src) {
      setStatus("Scegli prima un file o una cartella");
      return;
    }

    if (audio.paused) {
      try {
        await audio.play();
      } catch (error) {
        setStatus("Impossibile avviare la riproduzione");
      }
    } else {
      audio.pause();
    }
  });

  nextButton.addEventListener("click", () => {
    playNextTrack();
  });

  audio.addEventListener("play", () => {
    playButton.textContent = "Ⅱ";
    setStatus(
      mode === "single" ? "Playing · Loop" : "Playing · Shuffle"
    );
  });

  audio.addEventListener("pause", () => {
    playButton.textContent = "▶";

    if (audio.currentTime > 0 && !audio.ended) {
      setStatus("In pausa");
    }
  });

  audio.addEventListener("ended", () => {
    if (mode === "folder") {
      playNextTrack();
    }
  });

  audio.addEventListener("loadedmetadata", () => {
    durationLabel.textContent = formatTime(audio.duration);
  });

  audio.addEventListener("timeupdate", () => {
    currentTimeLabel.textContent = formatTime(audio.currentTime);

    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      seek.value = (audio.currentTime / audio.duration) * 100;
    } else {
      seek.value = 0;
    }
  });

  seek.addEventListener("input", () => {
    if (Number.isFinite(audio.duration) && audio.duration > 0) {
      audio.currentTime = (Number(seek.value) / 100) * audio.duration;
    }
  });

  volume.addEventListener("input", () => {
    audio.volume = Number(volume.value);
  });

  audio.volume = Number(volume.value);

  // La musica non prosegue quando si cambia pagina.
  window.addEventListener("pagehide", () => {
    audio.pause();
    audio.removeAttribute("src");
    audio.load();
    releaseObjectUrl();
  });
})();
