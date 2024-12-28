document.addEventListener('DOMContentLoaded', function() {
    console.log('Landing page JavaScript loaded');

    // Cube animation code
    const cube = document.querySelector('.cube');
    if (cube) {
        let rotationX = 0;
        let rotationY = 0;
        let rotationZ = 0;

        function rotateCube() {
            rotationX += 0.02;
            rotationY += 0.09;
            rotationZ += 0.05;
            
            cube.style.transform = `rotateX(${rotationX}deg) rotateY(${rotationY}deg)`;
            
            requestAnimationFrame(rotateCube);
        }

        // Start the rotation
        rotateCube();

        // Optional: Pause rotation on hover
        cube.addEventListener('mouseenter', () => {
            cancelAnimationFrame(rotateCube);
        });

        cube.addEventListener('mouseleave', () => {
            requestAnimationFrame(rotateCube);
        });
    }
});