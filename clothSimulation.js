class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.oldX = x;
        this.oldY = y;
        this.pinned = false;
        this.mass = 1;
    }

    update(gravity, friction) {
        if (this.pinned) return;

        const vx = (this.x - this.oldX) * friction;
        const vy = (this.y - this.oldY) * friction;

        this.oldX = this.x;
        this.oldY = this.y;

        this.x += vx;
        this.y += vy;
        this.y += gravity;
    }
}

class Stick {
    constructor(p1, p2) {
        this.p1 = p1;
        this.p2 = p2;
        this.length = Math.hypot(p1.x - p2.x, p1.y - p2.y);
    }

    update() {
        const dx = this.p2.x - this.p1.x;
        const dy = this.p2.y - this.p1.y;
        const distance = Math.hypot(dx, dy);
        const difference = this.length - distance;
        const percent = difference / distance / 2;

        if (!this.p1.pinned) {
            this.p1.x -= dx * percent;
            this.p1.y -= dy * percent;
        }
        if (!this.p2.pinned) {
            this.p2.x += dx * percent;
            this.p2.y += dy * percent;
        }
    }
}

export class ClothSimulation {
    constructor(canvas, is3D = false) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.points = [];
        this.sticks = [];
        this.mouse = { x: 0, y: 0, down: false };
        this.gravity = 0.5;
        this.friction = 0.99;
        this.tearDistance = 30; // Distance threshold for tearing
        this.tearForce = 50;    // Force threshold for tearing
        this.tearRadius = 20;    // รัศมีการตัดเส้น
        this.pointColor = '#fff';
        this.stickColor = '#646cff';
        this.is3D = is3D;
        this.rotation = { x: 0, y: 0, z: 0 };
        this.init();
        this.setupEvents();
    }

    init(pattern = 'default') {
        this.points = [];
        this.sticks = [];
        
        const spacing = 20;
        const startX = 100;
        const startY = 20;
        const clothWidth = 20;
        const clothHeight = 15;

        // Create points with different patterns
        for (let y = 0; y <= clothHeight; y++) {
            for (let x = 0; x <= clothWidth; x++) {
                const point = new Point(startX + x * spacing, startY + y * spacing);
                if (pattern === 'default') {
                    if (y === 0 && (x === 0 || x === clothWidth)) {
                        point.pinned = true;
                    }
                } else if (pattern === 'triangle') {
                    // Calculate the triangle's height at each row
                    const rowWidth = clothWidth - Math.floor((y * clothWidth) / clothHeight);
                    const offsetX = Math.floor((clothWidth - rowWidth) / 2);
                    
                    // Only create points within the triangle shape
                    if (x >= offsetX && x <= offsetX + rowWidth) {
                        if (y === 0 && (x === 0 || x === clothWidth)) {
                            point.pinned = true;
                        }
                    } else {
                        continue; // Skip points outside the triangle
                    }
                } else if (pattern === 'square' || pattern === 'rectangle') {
                    if (y === 0 && (x === 0 || x === clothWidth)) {
                        point.pinned = true;
                    }
                } else if (pattern === 'rhombus') {
                    if (y === 0 && (x === 0 || x === clothWidth)) {
                        point.pinned = true;
                    }
                } else if (pattern === 'trapezoid') {
                    if (y === 0 && (x === 0 || x === clothWidth)) {
                        point.pinned = true;
                    }
                } else if (pattern === 'pentagon') {
                    if ((y === 0 && (x === 0 || x === clothWidth)) || (y === Math.floor(clothHeight / 2) && (x === Math.floor(clothWidth / 2)))) {
                        point.pinned = true;
                    }
                } else if (pattern === 'hexagon') {
                    if ((y === 0 && (x === 0 || x === clothWidth)) || (y === Math.floor(clothHeight / 2) && (x === Math.floor(clothWidth / 2)))) {
                        point.pinned = true;
                    }
                } else if (pattern === 'heptagon') {
                    if ((y === 0 && (x === 0 || x === clothWidth)) || (y === Math.floor(clothHeight / 2) && (x === Math.floor(clothWidth / 2)))) {
                        point.pinned = true;
                    }
                } else if (pattern === 'octagon') {
                    if ((y === 0 && (x === 0 || x === clothWidth)) || (y === Math.floor(clothHeight / 2) && (x === Math.floor(clothWidth / 2)))) {
                        point.pinned = true;
                    }
                } else if (pattern === 'nonagon') {
                    if ((y === 0 && (x === 0 || x === clothWidth)) || (y === Math.floor(clothHeight / 2) && (x === Math.floor(clothWidth / 2)))) {
                        point.pinned = true;
                    }
                } else if (pattern === 'decagon') {
                    if ((y === 0 && (x === 0 || x === clothWidth)) || (y === Math.floor(clothHeight / 2) && (x === Math.floor(clothWidth / 2)))) {
                        point.pinned = true;
                    }
                } else if (pattern === 'circle' || pattern === 'sphere') {
                    const centerX = clothWidth / 2;
                    const centerY = clothHeight / 2;
                    const radius = Math.min(clothWidth, clothHeight) / 2;
                    if (Math.hypot(x - centerX, y - centerY) <= radius) {
                        point.pinned = true;
                    }
                } else if (pattern === 'ellipse') {
                    const centerX = clothWidth / 2;
                    const centerY = clothHeight / 2;
                    const radiusX = clothWidth / 2;
                    const radiusY = clothHeight / 2;
                    if ((Math.pow(x - centerX, 2) / Math.pow(radiusX, 2)) + (Math.pow(y - centerY, 2) / Math.pow(radiusY, 2)) <= 1) {
                        point.pinned = true;
                    }
                } else if (pattern === 'star') {
                    if ((y === 0 && (x === 0 || x === clothWidth)) || (y === Math.floor(clothHeight / 2) && (x === Math.floor(clothWidth / 2)))) {
                        point.pinned = true;
                    }
                } else if (pattern === 'heart') {
                    if ((y === 0 && (x === 0 || x === clothWidth)) || (y === Math.floor(clothHeight / 2) && (x === Math.floor(clothWidth / 2)))) {
                        point.pinned = true;
                    }
                } else if (pattern === 'pyramid') {
                    if ((y === 0 && (x === 0 || x === clothWidth)) || (y === clothHeight && x === Math.floor(clothWidth / 2))) {
                        point.pinned = true;
                    }
                } else if (pattern === 'cylinder' || pattern === 'prism' || pattern === 'cone') {
                    if (y === 0 && (x === 0 || x === clothWidth)) {
                        point.pinned = true;
                    }
                }
                this.points.push(point);
            }
        }

        // Create sticks
        for (let y = 0; y <= clothHeight; y++) {
            for (let x = 0; x <= clothWidth; x++) {
                if (x < clothWidth) {
                    this.sticks.push(new Stick(
                        this.points[y * (clothWidth + 1) + x],
                        this.points[y * (clothWidth + 1) + x + 1]
                    ));
                }
                if (y < clothHeight) {
                    this.sticks.push(new Stick(
                        this.points[y * (clothWidth + 1) + x],
                        this.points[(y + 1) * (clothWidth + 1) + x]
                    ));
                }
            }
        }
    }

    setupEvents() {
        this.canvas.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            this.mouse.x = e.clientX - rect.left;
            this.mouse.y = e.clientY - rect.top;
        });

        this.canvas.addEventListener('mousedown', () => {
            this.mouse.down = true;
        });

        this.canvas.addEventListener('mouseup', () => {
            this.mouse.down = false;
        });

        if (this.is3D) {
            this.canvas.addEventListener('wheel', (e) => {
                this.rotation.y += e.deltaY * 0.01;
                this.rotation.x += e.deltaX * 0.01;
            });
        }
    }

    update() {
        // Update points
        for (const point of this.points) {
            point.update(this.gravity, this.friction);
        }

        // Handle mouse interaction for cutting
        if (this.mouse.down) {
            // ตรวจสอบเส้นทั้งหมดและลบเส้นที่อยู่ใกล้เมาส์
            this.sticks = this.sticks.filter(stick => {
                // คำนวณจุดกึ่งกลางของเส้น
                const midX = (stick.p1.x + stick.p2.x) / 2;
                const midY = (stick.p1.y + stick.p2.y) / 2;
                
                // คำนวณระยะห่างจากเมาส์ถึงจุดกึ่งกลางของเส้น
                const dist = Math.hypot(midX - this.mouse.x, midY - this.mouse.y);
                
                // เก็บเส้นที่อยู่ห่างจากเมาส์เกินรัศมีที่กำหนด
                return dist > this.tearRadius;
            });
        }

        // Update remaining sticks
        for (let i = 0; i < 3; i++) {
            for (const stick of this.sticks) {
                stick.update();
            }
        }

        // Keep points within canvas
        for (const point of this.points) {
            if (point.y > this.canvas.height) {
                point.y = this.canvas.height;
                point.oldY = point.y;
            }
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw sticks
        this.ctx.beginPath();
        this.ctx.strokeStyle = this.stickColor;
        this.ctx.lineWidth = 2;
        
        for (const stick of this.sticks) {
            const p1 = this.rotatePoint(stick.p1);
            const p2 = this.rotatePoint(stick.p2);
            this.ctx.moveTo(p1.x, p1.y);
            this.ctx.lineTo(p2.x, p2.y);
        }
        this.ctx.stroke();

        // Draw points
        this.ctx.fillStyle = this.pointColor;
        for (const point of this.points) {
            const p = this.rotatePoint(point);
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }

    rotatePoint(point) {
        if (!this.is3D) return point;

        const cosX = Math.cos(this.rotation.x);
        const sinX = Math.sin(this.rotation.x);
        const cosY = Math.cos(this.rotation.y);
        const sinY = Math.sin(this.rotation.y);
        const cosZ = Math.cos(this.rotation.z);
        const sinZ = Math.sin(this.rotation.z);

        let x = point.x;
        let y = point.y;
        let z = point.z || 0;

        // Rotate around X axis
        let y1 = y * cosX - z * sinX;
        let z1 = y * sinX + z * cosX;

        // Rotate around Y axis
        let x1 = x * cosY + z1 * sinY;
        z1 = -x * sinY + z1 * cosY;

        // Rotate around Z axis
        x = x1 * cosZ - y1 * sinZ;
        y = x1 * sinZ + y1 * cosZ;

        return { x, y, z: z1 };
    }
}
