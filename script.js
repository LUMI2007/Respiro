document.addEventListener('DOMContentLoaded', () => {
    // Referencias
    const pantallaBienvenida = document.getElementById('pantalla-bienvenida');
    const pantallaCitas = document.getElementById('pantalla-inicio-citas');
    const pantallaTituloCuento = document.getElementById('pantalla-titulo-cuento');
    const pantallaHistoria = document.getElementById('pantalla-historia');
    
    const musicaFondo = document.getElementById('musicaFondo');
    const musicaCuento = document.getElementById('musicaCuento');


    function fadeOutAudio(audio, duracion) {
        if (!audio) return;
        let volumenActual = audio.volume;
        const pasos = 20;
        const tiempoPaso = duracion / pasos;
        const volumenPaso = volumenActual / pasos;

        const fade = setInterval(() => {
            if (audio.volume > volumenPaso) {
                audio.volume -= volumenPaso;
            } else {
                audio.volume = 0;
                audio.pause();
                clearInterval(fade);
            }
        }, tiempoPaso);
    }

    function fadeInAudio(audio, duracion) {
        if (!audio) return;
        audio.volume = 0; 
        audio.play().catch(e => console.log('Audio bloqueado:', e));
        
        const pasos = 20;
        const tiempoPaso = duracion / pasos;
        const volumenPaso = 1 / pasos;

        const fade = setInterval(() => {
            if (audio.volume < 1 - volumenPaso) {
                audio.volume += volumenPaso;
            } else {
                audio.volume = 1;
                clearInterval(fade);
            }
        }, tiempoPaso);
    }


    if (pantallaBienvenida) {
        pantallaBienvenida.addEventListener('click', () => {
            fadeInAudio(musicaFondo, 1500);
            pantallaCitas.classList.remove('oculto');
            pantallaBienvenida.classList.add('fade-out');
            setTimeout(() => { pantallaBienvenida.style.display = 'none'; }, 1500);
        });
    }

    if (pantallaCitas && pantallaTituloCuento) {
        pantallaCitas.addEventListener('dblclick', () => {
            fadeOutAudio(musicaFondo, 1500);
            pantallaCitas.classList.add('fade-out');
            setTimeout(() => {
                pantallaCitas.style.display = 'none';
                document.body.style.backgroundColor = '#0a0b10'; 
                pantallaTituloCuento.classList.remove('oculto');
                pantallaTituloCuento.classList.remove('fade-out'); 
                window.scrollTo(0, 0);
            }, 1500);
        });
    }

    if (pantallaTituloCuento && pantallaHistoria) {
        pantallaTituloCuento.addEventListener('click', () => {
            if (musicaCuento) musicaCuento.currentTime = 0; 
            fadeInAudio(musicaCuento, 2000);
            
            const canvasFuegos = document.getElementById('lienzo-fuegos');
            if(canvasFuegos) canvasFuegos.classList.remove('oculto');

            pantallaTituloCuento.classList.add('fade-out');
            setTimeout(() => {
                pantallaTituloCuento.style.display = 'none';
                pantallaHistoria.classList.remove('oculto');
                window.scrollTo(0, 0);
            }, 1500);
        });
    }


    const canvas = document.getElementById('lienzo-fuegos');
    const ctx = canvas.getContext('2d');
    const btnFuegos = document.getElementById('btn-fuegos');

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    let cohetes = [];
    let particulas = [];
    
    const colores = ['#00ffff', '#ff00ff', '#ffcc00', '#ffffff', '#ff6666', '#aaff00'];

    class Cohete {
        constructor(x, targetY) {
            this.x = x;
            this.y = window.innerHeight; 
            this.targetY = targetY;
            this.velocidadY = -12 - Math.random() * 4; 
            this.muerto = false;
            this.color = '#ffcc00';
            this.historial = []; 
        }
        actualizar() {
            this.historial.push({x: this.x, y: this.y});
            if(this.historial.length > 5) this.historial.shift();
            
            this.y += this.velocidadY;
            
            if (this.historial.length > 1) {
                ctx.beginPath();
                ctx.moveTo(this.historial[0].x, this.historial[0].y);
                ctx.lineTo(this.x, this.y);
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 3;
                ctx.shadowBlur = 10;
                ctx.shadowColor = this.color;
                ctx.stroke();
            }
            
            if (this.y <= this.targetY || this.velocidadY >= 0) {
                this.muerto = true;
                estallar(this.x, this.y);
            }
        }
    }

    class Particula {
        constructor(x, y, color) {
            this.x = x;
            this.y = y;
            this.color = color;
            const angulo = Math.random() * Math.PI * 2;
            const fuerza = Math.random() * 8 + 2;
            this.velocidad = {
                x: Math.cos(angulo) * fuerza,
                y: Math.sin(angulo) * fuerza
            };
            this.gravedad = 0.08; 
            this.friccion = 0.95; 
            this.transparencia = 1;
            this.decaimiento = Math.random() * 0.015 + 0.01; 
            this.historial = []; 
        }
        actualizar() {
            this.historial.push({x: this.x, y: this.y});
            if(this.historial.length > 6) this.historial.shift();

            this.velocidad.x *= this.friccion;
            this.velocidad.y *= this.friccion;
            this.velocidad.y += this.gravedad;
            this.x += this.velocidad.x;
            this.y += this.velocidad.y;
            this.transparencia -= this.decaimiento;

            if (this.historial.length > 1) {
                ctx.save();
                ctx.globalAlpha = this.transparencia;
                ctx.beginPath();
                ctx.moveTo(this.historial[0].x, this.historial[0].y);
                ctx.lineTo(this.x, this.y);
                ctx.strokeStyle = this.color;
                ctx.lineWidth = 2.5;
                ctx.shadowBlur = 15;
                ctx.shadowColor = this.color;
                ctx.stroke();
                ctx.restore();
            }
        }
    }

    function estallar(x, y) {
        const colorBase = colores[Math.floor(Math.random() * colores.length)];
        const cantidad = 90; 
        for (let i = 0; i < cantidad; i++) {
            const colorFinal = Math.random() > 0.4 ? colorBase : '#ffffff';
            particulas.push(new Particula(x, y, colorFinal));
        }
    }

    function animarFuegos() {
        requestAnimationFrame(animarFuegos);
        

        ctx.globalCompositeOperation = 'source-over';
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        

        ctx.globalCompositeOperation = 'lighter';

        cohetes.forEach((cohete, index) => {
            cohete.actualizar();
            if (cohete.muerto) cohetes.splice(index, 1);
        });

        particulas.forEach((particula, index) => {
            particula.actualizar();
            if (particula.transparencia <= 0) particulas.splice(index, 1);
        });
    }
    
    animarFuegos();


    if (btnFuegos) {
        btnFuegos.addEventListener('click', () => {
            const x = window.innerWidth / 2 + (Math.random() - 0.5) * 400; 
            const targetY = window.innerHeight * 0.2 + Math.random() * 150; 
            cohetes.push(new Cohete(x, targetY));
        });
    }
});