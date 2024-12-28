// components/WaveFooter.tsx
import { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface WaveOptions {
  amplitude?: number;
  curviness?: number;
  duration?: number;
  fillStyle?: string;
  frequency?: number;
  height?: number;
  segments?: number;
  waveHeight?: number;
  width?: number;
  x?: number;
  y?: number;
}

interface WavePoint {
  x: number;
  y: number;
}

interface Wave {
  amplitude: number;
  context: CanvasRenderingContext2D;
  curviness: number;
  duration: number;
  fillStyle: string;
  frequency: number;
  height: number;
  points: WavePoint[];
  segments: number;
  tweens: gsap.core.Tween[];
  waveHeight: number;
  width: number;
  x: number;
  y: number;
  init: () => void;
  draw: () => void;
  resize: (width: number, height: number) => void;
}

export default function WaveFooter() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wavesRef = useRef<Wave[]>([]);
  const resizedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext('2d');
    if (!context) return;

    const resolution = window.devicePixelRatio || 1;
    let vw: number, vh: number;

    function createWave(context: CanvasRenderingContext2D, options: WaveOptions): Wave {
      options = options || {};
      const wave: Wave = {
        amplitude: options.amplitude || 200,
        context,
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
        
        init() {
          this.points = [];
          this.tweens = [];
          
          for (let i = 0; i <= this.segments; i++) {
            const point = {
              x: this.x + i * (this.width / this.segments),
              y: 1
            };
            
            this.points.push(point);
            
            const tween = gsap.to(point, {
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
        
        draw() {
          this.context.beginPath();
          this.context.moveTo(this.points[0].x, this.waveHeight + this.points[0].y * this.amplitude);
          
          for (let i = 1; i < this.points.length; i++) {
            const point = this.points[i];
            let y = this.waveHeight + point.y * this.amplitude;
            y = Math.max(0, Math.min(y, this.height));
            this.context.lineTo(point.x, y);
          }
          
          this.context.lineTo(this.x + this.width, this.height);
          this.context.lineTo(this.x, this.height);
          this.context.closePath();
          this.context.fillStyle = this.fillStyle;
          this.context.fill();
        },
        
        resize(width: number, height: number) {
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
      
      canvas.width = vw * resolution;
      canvas.height = vh * resolution;
      
      canvas.style.width = `${vw}px`;
      canvas.style.height = `${vh}px`;
      
      context.scale(resolution, resolution);
    }

    function createWaves() {
      wavesRef.current = [];
      let waveHeight = vh * 0.5;

      const waves = [
        createWave(context, {
          amplitude: waveHeight * 0.3,
          duration: 4,
          fillStyle: "rgba(64, 224, 208, 0.7)",
          frequency: 2.5,
          width: vw,
          height: vh,
          segments: 100,
          waveHeight: waveHeight
        }),
        createWave(context, {
          amplitude: waveHeight * 0.2,
          duration: 2,
          fillStyle: "rgba(64, 224, 208, 0.5)",
          frequency: 1.5,
          width: vw,
          height: vh,
          segments: 100,
          waveHeight: waveHeight * 0.8
        }),
        createWave(context, {
          amplitude: waveHeight * 0.1,
          duration: 3,
          fillStyle: "rgba(64, 224, 208, 0.3)",
          frequency: 2,
          width: vw,
          height: vh,
          segments: 100,
          waveHeight: waveHeight * 0.6
        })
      ];

      wavesRef.current = waves;

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

    function update() {
      if (resizedRef.current) {
        resizeCanvas();
        createWaves();
        resizedRef.current = false;
      }
      
      context.clearRect(0, 0, vw, vh);  
      context.globalCompositeOperation = "soft-light";
      
      wavesRef.current.forEach(wave => wave.draw());
    }

    resizeCanvas();
    createWaves();

    const resizeHandler = () => {
      resizedRef.current = true;
    };

    window.addEventListener("resize", resizeHandler);
    const ticker = gsap.ticker.add(update);

    return () => {
      window.removeEventListener("resize", resizeHandler);
      gsap.ticker.remove(ticker);
    };
  }, []);

  return <canvas ref={canvasRef} id="footer-wave-canvas" />;
}