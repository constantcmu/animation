import { ClothSimulation } from './clothSimulation.js';

let clothSim2D, clothSim3D;
let clothAnimFrame2D, clothAnimFrame3D;

function animateCloth2D() {
    clothSim2D.update();
    clothSim2D.render();
    clothAnimFrame2D = requestAnimationFrame(animateCloth2D);
}

function animateCloth3D() {
    clothSim3D.update();
    clothSim3D.render();
    clothAnimFrame3D = requestAnimationFrame(animateCloth3D);
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialize cloth simulation 2D
    const canvas2D = document.getElementById('clothCanvas2D');
    canvas2D.width = 800;
    canvas2D.height = 600;
    clothSim2D = new ClothSimulation(canvas2D);

    // Initialize cloth simulation 3D
    const canvas3D = document.getElementById('clothCanvas3D');
    canvas3D.width = 800;
    canvas3D.height = 600;
    clothSim3D = new ClothSimulation(canvas3D, true);

    // Reset cloth button 2D
    document.getElementById('resetCloth2D').addEventListener('click', () => {
        clothSim2D.init();
    });

    // Reset cloth button 3D
    document.getElementById('resetCloth3D').addEventListener('click', () => {
        clothSim3D.init();
    });

    // Cloth pattern selection 2D
    const patternSelect2D = document.getElementById('patternSelect2D');
    patternSelect2D.addEventListener('change', (e) => {
        const pattern = e.target.value;
        clothSim2D.init(pattern);
    });

    // Cloth pattern selection 3D
    const patternSelect3D = document.getElementById('patternSelect3D');
    patternSelect3D.addEventListener('change', (e) => {
        const pattern = e.target.value;
        clothSim3D.init(pattern);
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
            if (viewToShow === 'cloth2D') {
                animateCloth2D();
                if (clothAnimFrame3D) {
                    cancelAnimationFrame(clothAnimFrame3D);
                    clothAnimFrame3D = null;
                }
            } else if (viewToShow === 'cloth3D') {
                animateCloth3D();
                if (clothAnimFrame2D) {
                    cancelAnimationFrame(clothAnimFrame2D);
                    clothAnimFrame2D = null;
                }
            }
        });
    });

    // Start cloth animation 2D by default
    animateCloth2D();
});
