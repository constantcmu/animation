import { startCubeAnimation, stopCubeAnimation } from './cubeAnimation.js';
import { ClothSimulation } from './clothSimulation.js';

let clothSim;
let clothAnimFrame;

function animateCloth() {
    clothSim.update();
    clothSim.render();
    clothAnimFrame = requestAnimationFrame(animateCloth);
}

document.addEventListener('DOMContentLoaded', () => {
    // Cube animation controls
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    startBtn.addEventListener('click', startCubeAnimation);
    stopBtn.addEventListener('click', stopCubeAnimation);

    // Initialize cloth simulation
    const canvas = document.getElementById('clothCanvas');
    canvas.width = 800;
    canvas.height = 600;
    clothSim = new ClothSimulation(canvas);

    // Reset cloth button
    document.getElementById('resetCloth').addEventListener('click', () => {
        clothSim.init();
    });

    // View navigation
    const navButtons = document.querySelectorAll('.nav-btn');
    const views = document.querySelectorAll('.view');

    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const viewToShow = btn.dataset.view;
            
            // Update active states
            navButtons.forEach(b => b.classList.remove('active'));
            views.forEach(v => v.classList.remove('active'));
            
            btn.classList.add('active');
            document.getElementById(`${viewToShow}View`).classList.add('active');

            // Handle view-specific actions
            if (viewToShow === 'cube') {
                startCubeAnimation();
                if (clothAnimFrame) {
                    cancelAnimationFrame(clothAnimFrame);
                    clothAnimFrame = null;
                }
            } else if (viewToShow === 'cloth') {
                stopCubeAnimation();
                if (!clothAnimFrame) {
                    animateCloth();
                }
            }
        });
    });

    // Start cube animation by default
    startCubeAnimation();
});
