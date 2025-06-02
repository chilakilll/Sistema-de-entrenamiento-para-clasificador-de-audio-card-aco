document.getElementById('form-audio').addEventListener('submit', async function (e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  

  try {
    const response = await fetch('http://localhost:3000/subir', {
      method: 'POST',
      body: formData,
    });

    const result = await response.text();
    console.log('Respuesta del servidor:', result);

    // Mostrar popup
    const popup = document.getElementById('popupExito');
popup.classList.add('visible');

setTimeout(() => {
  popup.classList.remove('visible');
  form.reset();
  document.getElementById('audioPreview').style.display = 'none';
  const canvas = document.getElementById('audioCanvas');
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}, 5000); // Ajusta el tiempo aquí (en milisegundos)
    alert('✅ Archivo subido exitosamente');
    
  } catch (error) {
    console.error('Error al enviar los datos:', error);
    alert('❌ Error al subir el archivo');
  }
});





// Mostrar reproductor y graficar
document.getElementById('audio').addEventListener('change', function() {
  const file = this.files[0];
  const player = document.getElementById('audioPlayer');

  if (file) {
    const url = URL.createObjectURL(file);
    player.src = url;
    player.style.display = 'block';
    visualizarAudio(file);
  }
});

function visualizarAudio(file) {
  const canvas = document.getElementById('visualizer');
  const ctx = canvas.getContext('2d');
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const reader = new FileReader();

  reader.onload = function(e) {
    audioContext.decodeAudioData(e.target.result, buffer => {
      const source = audioContext.createBufferSource();
      source.buffer = buffer;

      const analyser = audioContext.createAnalyser();
      source.connect(analyser);
      analyser.connect(audioContext.destination);
      source.start(0);

      analyser.fftSize = 256;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      function draw() {
        requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);
        ctx.fillStyle = '#fff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const barWidth = (canvas.width / bufferLength) * 2.5;
        let x = 0;

        for (let i = 0; i < bufferLength; i++) {
          const barHeight = dataArray[i];
          ctx.fillStyle = '#1a73e8';
          ctx.fillRect(x, canvas.height - barHeight / 2, barWidth, barHeight / 2);
          x += barWidth + 1;
        }
      }

      draw();
    });
  };

  reader.readAsArrayBuffer(file);
}
