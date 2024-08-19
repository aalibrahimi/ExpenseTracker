document.addEventListener('DOMContentLoaded', function() {
    let canvas = document.getElementById("footer-wave-canvas");
    let context = canvas.getContext("2d");
    let resolution = window.devicePixelRatio || 1;

    let waves = [];
    let resized = false;

    let vw, vh;
    resizeCanvas();

    function createWaves() {
        waves = []; // Clear existing waves
        let waveHeight = vh * 0.5; // Adjust this value to control the overall height of the waves

        let wave1 = createWave(context, {
            amplitude: waveHeight * 0.3,
            duration: 4,
            fillStyle: "rgba(64, 224, 208, 0.7)",
            frequency: 2.5,
            width: vw,
            height: vh,
            segments: 100,
            waveHeight: waveHeight
        });

        let wave2 = createWave(context, {
            amplitude: waveHeight * 0.2,
            duration: 2,
            fillStyle: "rgba(64, 224, 208, 0.5)",
            frequency: 1.5,
            width: vw,
            height: vh,
            segments: 100,
            waveHeight: waveHeight * 0.8
        });

        let wave3 = createWave(context, {
            amplitude: waveHeight * 0.1,
            duration: 3,
            fillStyle: "rgba(64, 224, 208, 0.3)",
            frequency: 2,
            width: vw,
            height: vh,
            segments: 100,
            waveHeight: waveHeight * 0.6
        });

        waves.push(wave1, wave2, wave3);

        // Animate waves
        waves.forEach((wave, index) => {
            gsap.to(wave, {
                duration: 10 + index * 2,
                waveHeight: waveHeight * (0.6 + index * 0.1),
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true
            });

            gsap.to(wave, {
                duration: 6 + index * 1.5,
                amplitude: wave.amplitude * (0.6 + Math.random() * 0.4),
                ease: "sine.inOut",
                repeat: -1,
                yoyo: true
            });
        });
    }

    createWaves();

    window.addEventListener("resize", () => {
        resized = true;
    });

    gsap.ticker.add(update);

    function update() {
        if (resized) {
            resizeCanvas();
            createWaves(); // Recreate waves on resize
            resized = false;
        }
        
        context.clearRect(0, 0, vw, vh);  
        context.globalCompositeOperation = "soft-light";
        
        waves.forEach(wave => wave.draw());
    }

    function createWave(context, options) {
        options = options || {};
        let wave = {
            amplitude: options.amplitude || 200,
            context: context,
            curviness: options.curviness || 0.75,
            duration: options.duration || 2,
            fillStyle: options.fillStyle || "rgba(33,150,243,1)",
            frequency: options.frequency || 4,
            height: options.height || 600,
            points: [],
            segments: options.segments || 100,
            tweens: [],
            waveHeight: options.waveHeight || 300,
            width: options.width || 800,
            x: options.x || 0,
            y: options.y || 0,
            
            init: function() {
                this.points = [];
                this.tweens = [];
                
                for (let i = 0; i <= this.segments; i++) {
                    let point = {
                        x: this.x + i * (this.width / this.segments),
                        y: 1
                    };
                    
                    this.points.push(point);
                    
                    let tween = gsap.to(point, {
                        duration: this.duration,
                        y: -1,
                        repeat: -1,
                        yoyo: true,
                        ease: "sine.inOut"
                    });
                    
                    tween.progress(i / this.segments * this.frequency);
                    this.tweens.push(tween);
                }
            },
            
            draw: function() {
                this.context.beginPath();
                this.context.moveTo(this.points[0].x, this.waveHeight + this.points[0].y * this.amplitude);
                
                for (let i = 1; i < this.points.length; i++) {
                    let point = this.points[i];
                    let y = this.waveHeight + point.y * this.amplitude;
                    y = Math.max(0, Math.min(y, this.height)); // Ensure y is within canvas bounds
                    this.context.lineTo(point.x, y);
                }
                
                this.context.lineTo(this.x + this.width, this.height);
                this.context.lineTo(this.x, this.height);
                this.context.closePath();
                this.context.fillStyle = this.fillStyle;
                this.context.fill();
            },
            
            resize: function(width, height) {
                this.width = width;
                this.height = height;
                
                for (let i = 0; i < this.points.length; i++) {
                    this.points[i].x = this.x + i * (this.width / this.segments);
                }
            }
        };
        
        wave.init();
        return wave;
    }

    function resizeCanvas() {
        vw = canvas.offsetWidth;
        vh = canvas.offsetHeight;
        
        canvas.width  = vw * resolution;
        canvas.height = vh * resolution;
        
        canvas.style.width  = vw + "px";
        canvas.style.height = vh + "px";
        
        context.scale(resolution, resolution);
    }
});