// document.addEventListener('DOMContentLoaded', () => {
//   const canvas = document.getElementById('myCanvas');
//   const ctx = canvas.getContext('2d');
//   const hotspots = document.querySelectorAll('.feature-hotspot');

//   function resizeCanvas() {
//     canvas.width = canvas.offsetWidth;
//     canvas.height = canvas.offsetHeight;
//   }

//   function initGraph() {
//     resizeCanvas();
//     drawAnimatedLine();
//   }

//   function drawAnimatedLine() {
//     ctx.clearRect(0, 0, canvas.width, canvas.height);

//     const points = Array.from(hotspots).map(hotspot => {
//       const rect = hotspot.getBoundingClientRect();
//       const canvasRect = canvas.getBoundingClientRect();
//       return {
//         x: rect.left + rect.width / 2 - canvasRect.left,
//         y: rect.top + rect.height / 2 - canvasRect.top
//       };
//     });

//     // Sort points from left to right
//     points.sort((a, b) => a.x - b.x);

//     // Create a path through all points
//     const path = `M${points[0].x},${points[0].y} ` + 
//                  points.slice(1).map(p => `L${p.x},${p.y}`).join(' ');

//     console.log('Path:', path); // Log the path for debugging

//     // Check if GSAP and MotionPathPlugin are available
//     if (typeof gsap === 'undefined' || typeof MotionPathPlugin === 'undefined') {
//       console.error('GSAP or MotionPathPlugin not loaded');
//       return;
//     }

//     // Register the plugin
//     gsap.registerPlugin(MotionPathPlugin);

//     // Create a dummy object to animate
//     const dummy = { progress: 0 };

//     // Set up GSAP animation
//     gsap.to(dummy, {
//       progress: 1,
//       duration: 3,
//       ease: "power1.inOut",
//       onUpdate: () => {
//         ctx.clearRect(0, 0, canvas.width, canvas.height);
//         ctx.beginPath();
//         ctx.strokeStyle = '#00FF00';
//         ctx.lineWidth = 3;
//         ctx.lineCap = 'round';
//         ctx.lineJoin = 'round';

//         // Draw the path
//         const pathLength = MotionPathPlugin.getLength(path);
//         const point = MotionPathPlugin.getPositionOnPath(path, dummy.progress * pathLength);
        
//         ctx.moveTo(points[0].x, points[0].y);
//         ctx.lineTo(point.x, point.y);
//         ctx.stroke();

//         // Draw circles at hotspots
//         points.forEach(p => {
//           ctx.beginPath();
//           ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
//           ctx.fillStyle = '#00FF00';
//           ctx.fill();
//         });
//       }
//     });
//   }

//   window.addEventListener('resize', initGraph);
//   initGraph();
// });