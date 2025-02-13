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
    constructor(canvas) {
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
        this.init();
        this.setupEvents();
    }

    init() {
        this.points = [];
        this.sticks = [];
        
        const spacing = 20;
        const startX = 100;
        const startY = 20;
        const clothWidth = 20;
        const clothHeight = 15;

        // Create points with only top corners pinned
        for (let y = 0; y <= clothHeight; y++) {
            for (let x = 0; x <= clothWidth; x++) {
                const point = new Point(startX + x * spacing, startY + y * spacing);
                // Pin only the top corners (was: if (y === 0 && (x === 0 || x === clothWidth)))
                if (y === 0 && x === 0) {
                    point.pinned = true; // Pin top-left corner
                } else if (y === 0 && x === clothWidth) {
                    point.pinned = true; // Pin top-right corner
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
        this.ctx.strokeStyle = '#646cff';
        this.ctx.lineWidth = 2;
        
        for (const stick of this.sticks) {
            this.ctx.moveTo(stick.p1.x, stick.p1.y);
            this.ctx.lineTo(stick.p2.x, stick.p2.y);
        }
        this.ctx.stroke();

        // Draw points
        this.ctx.fillStyle = '#fff';
        for (const point of this.points) {
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
}
