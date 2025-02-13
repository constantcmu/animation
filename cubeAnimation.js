class CubeRenderer {
    constructor(width = 160, height = 44) {
        this.A = 0;
        this.B = 0;
        this.C = 0;
        this.width = width;
        this.height = height;
        this.cubeWidth = 15 // ขยายขนาด cube
        this.backgroundChar = '.';
        this.distanceFromCam = 120; // ปรับระยะห่างกล้อง
        this.incrementSpeed = 0.6;
        this.K1 = 50; // เพิ่มขนาดการแสดงผล

        this.buffer = new Array(width * height).fill(this.backgroundChar);
        this.zBuffer = new Array(width * height).fill(0);
    }

    calculateX(i, j, k) {
        return j * Math.sin(this.A) * Math.sin(this.B) * Math.cos(this.C) - 
               k * Math.cos(this.A) * Math.sin(this.B) * Math.cos(this.C) +
               j * Math.cos(this.A) * Math.sin(this.C) + 
               k * Math.sin(this.A) * Math.sin(this.C) + 
               i * Math.cos(this.B) * Math.cos(this.C);
    }

    calculateY(i, j, k) {
        return j * Math.cos(this.A) * Math.cos(this.C) + 
               k * Math.sin(this.A) * Math.cos(this.C) -
               j * Math.sin(this.A) * Math.sin(this.B) * Math.sin(this.C) + 
               k * Math.cos(this.A) * Math.sin(this.B) * Math.sin(this.C) -
               i * Math.cos(this.B) * Math.sin(this.C);
    }

    calculateZ(i, j, k) {
        return k * Math.cos(this.A) * Math.cos(this.B) - 
               j * Math.sin(this.A) * Math.cos(this.B) + 
               i * Math.sin(this.B);
    }

    calculateForSurface(cubeX, cubeY, cubeZ, ch, horizontalOffset = 0) {
        const x = this.calculateX(cubeX, cubeY, cubeZ);
        const y = this.calculateY(cubeX, cubeY, cubeZ);
        const z = this.calculateZ(cubeX, cubeY, cubeZ) + this.distanceFromCam;

        const ooz = 1 / z;

        const xp = Math.floor(this.width / 2 + horizontalOffset + this.K1 * ooz * x * 2);
        const yp = Math.floor(this.height / 2 + this.K1 * ooz * y);

        const idx = xp + yp * this.width;
        if (idx >= 0 && idx < this.width * this.height) {
            if (ooz > this.zBuffer[idx]) {
                this.zBuffer[idx] = ooz;
                this.buffer[idx] = ch;
            }
        }
    }

    render() {
        this.buffer.fill(this.backgroundChar);
        this.zBuffer.fill(0);

        // Render only one cube in the center
        this.renderCube(this.cubeWidth, 0);

        // Convert buffer to string
        let output = '';
        for (let k = 0; k < this.width * this.height; k++) {
            output += k % this.width ? this.buffer[k] : '\n';
        }
        return output;
    }

    renderTop() {
        const buffer = new Array(this.width * this.height).fill(this.backgroundChar);
        const zBuffer = new Array(this.width * this.height).fill(0);
        const size = this.cubeWidth;

        // Define all vertices of the cube (x, y, z)
        const vertices = [
            // Top face
            [-size, -size, -size], [size, -size, -size],
            [size, -size, size], [-size, -size, size],
            // Bottom face
            [-size, size, -size], [size, size, -size],
            [size, size, size], [-size, size, size]
        ];

        // Apply 3D rotation from top perspective
        const rotatedVertices = vertices.map(([x, y, z]) => {
            // First rotate around Y-axis (using C)
            const x1 = x * Math.cos(this.C) - z * Math.sin(this.C);
            const z1 = x * Math.sin(this.C) + z * Math.cos(this.C);
            const y1 = y;

            // Then rotate around X-axis (fixed 90 degrees + this.A for perspective)
            const x2 = x1;
            const y2 = y1 * Math.cos(Math.PI/2 + this.A) - z1 * Math.sin(Math.PI/2 + this.A);
            const z2 = y1 * Math.sin(Math.PI/2 + this.A) + z1 * Math.cos(Math.PI/2 + this.A);

            // Apply same scale as main view
            const ooz = 1 / (z2 + this.distanceFromCam);
            return [
                x2 * this.K1 * ooz * 2,
                y2 * this.K1 * ooz * 2,
                z2
            ];
        });

        // Define faces with their symbols (matching main view)
        const faces = [
            { indices: [0,1,2,3], char: '6' }, // Top
            { indices: [4,5,6,7], char: '5' }, // Bottom
            { indices: [0,1,5,4], char: '1' }, // Front
            { indices: [2,3,7,6], char: '4' }, // Back
            { indices: [0,3,7,4], char: '3' }, // Left
            { indices: [1,2,6,5], char: '2' }  // Right
        ];

        // Sort faces by depth for proper rendering
        faces.sort((a, b) => {
            const avgZA = a.indices.reduce((sum, i) => sum + rotatedVertices[i][2], 0) / 4;
            const avgZB = b.indices.reduce((sum, i) => sum + rotatedVertices[i][2], 0) / 4;
            return avgZB - avgZA;
        });

        // Draw faces
        faces.forEach(face => {
            for (let i = 0; i < face.indices.length; i++) {
                const curr = face.indices[i];
                const next = face.indices[(i + 1) % face.indices.length];
                this.drawLine(
                    Math.floor(this.width/2 + rotatedVertices[curr][0]),
                    Math.floor(this.height/2 + rotatedVertices[curr][1]),
                    Math.floor(this.width/2 + rotatedVertices[next][0]),
                    Math.floor(this.height/2 + rotatedVertices[next][1]),
                    face.char,
                    buffer,
                    zBuffer,
                    (rotatedVertices[curr][2] + rotatedVertices[next][2]) / 2
                );
            }
        });

        // Convert buffer to string
        let output = '';
        for (let k = 0; k < this.width * this.height; k++) {
            output += k % this.width ? buffer[k] : '\n';
        }
        return output;
    }

    getRotatedPoint(x, y, z) {
        // Helper function for rotating a single point
        const x1 = x * Math.cos(this.C) - z * Math.sin(this.C);
        const z1 = x * Math.sin(this.C) + z * Math.cos(this.C);
        const y1 = y;

        const x2 = x1;
        const y2 = y1 * Math.cos(Math.PI/2 + this.A) - z1 * Math.sin(Math.PI/2 + this.A);
        const z2 = y1 * Math.sin(Math.PI/2 + this.A) + z1 * Math.cos(Math.PI/2 + this.A);

        const scale = 1 + z2 / (this.distanceFromCam * 2);
        return [x2 * scale, y2 * scale, z2];
    }

    // Add helper method for line drawing
    drawLine(x1, y1, x2, y2, char, buffer, zBuffer, z) {
        const dx = Math.abs(x2 - x1);
        const dy = Math.abs(y2 - y1);
        const sx = x1 < x2 ? 1 : -1;
        const sy = y1 < y2 ? 1 : -1;
        let err = dx - dy;

        while (true) {
            if (x1 >= 0 && x1 < this.width && y1 >= 0 && y1 < this.height) {
                const idx = x1 + y1 * this.width;
                if (!zBuffer[idx] || z > zBuffer[idx]) {
                    buffer[idx] = char;
                    zBuffer[idx] = z;
                }
            }

            if (x1 === x2 && y1 === y2) break;
            const e2 = 2 * err;
            if (e2 > -dy) {
                err -= dy;
                x1 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y1 += sy;
            }
        }
    }

    renderCube(size, offsetMultiplier) {
        const horizontalOffset = offsetMultiplier * size;
        for (let cubeX = -size; cubeX < size; cubeX += this.incrementSpeed) {
            for (let cubeY = -size; cubeY < size; cubeY += this.incrementSpeed) {
                // Using different ASCII characters for each face
                this.calculateForSurface(cubeX, cubeY, -size, '1', horizontalOffset); // Front
                this.calculateForSurface(size, cubeY, cubeX, '2', horizontalOffset); // Right
                this.calculateForSurface(-size, cubeY, -cubeX, '3', horizontalOffset); // Left
                this.calculateForSurface(-cubeX, cubeY, size, '4', horizontalOffset); // Back
                this.calculateForSurface(cubeX, -size, -cubeY, '5', horizontalOffset); // Bottom
                this.calculateForSurface(cubeX, size, cubeY, '6', horizontalOffset); // Top
            }
        }
    }

    update() {
        this.A += 0.05;
        this.B += 0.05;
        this.C += 0.01;
    }
}

// ปรับขนาดการแสดงผลให้ใหญ่ขึ้น
const cubeRenderer = new CubeRenderer(80, 40);

let animationFrame;

function animate() {
    const output = cubeRenderer.render();
    const topOutput = cubeRenderer.renderTop();
    document.getElementById('cubeRenderer').textContent = output;
    document.getElementById('cubeRendererTop').textContent = topOutput;
    cubeRenderer.update();
    animationFrame = requestAnimationFrame(animate);
}

export function startCubeAnimation() {
    if (!animationFrame) {
        animate();
    }
}

export function stopCubeAnimation() {
    if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        animationFrame = null;
    }
}
