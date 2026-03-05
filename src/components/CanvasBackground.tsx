import { useEffect, useRef } from 'react';

const CanvasBackground = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let width = (canvas.width = window.innerWidth);
        let height = (canvas.height = window.innerHeight);

        interface Node {
            x: number;
            y: number;
            vx: number;
            vy: number;
            radius: number;
        }

        let nodes: Node[] = [];

        const createNodes = () => {
            nodes = [];
            const count = Math.floor(
                (width * height) / (window.innerWidth < 768 ? 25000 : 15000)
            );
            for (let i = 0; i < count; i++) {
                nodes.push({
                    x: Math.random() * width,
                    y: Math.random() * height,
                    vx: (Math.random() - 0.5) * 0.3,
                    vy: (Math.random() - 0.5) * 0.3,
                    radius: Math.random() * 1.5 + 1,
                });
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, width, height);
            const connDist = window.innerWidth < 768 ? 80 : 120;

            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const d = Math.sqrt(
                        Math.pow(nodes[i].x - nodes[j].x, 2) + Math.pow(nodes[i].y - nodes[j].y, 2)
                    );
                    if (d < connDist) {
                        ctx.beginPath();
                        ctx.moveTo(nodes[i].x, nodes[i].y);
                        ctx.lineTo(nodes[j].x, nodes[j].y);
                        const isLight = document.documentElement.classList.contains('light');
                        ctx.strokeStyle = `rgba(255, 138, 155, ${
                            isLight ? 0.08 : 0.15
                        } * (1 - d / connDist))`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            nodes.forEach((n) => {
                n.x += n.vx;
                n.y += n.vy;
                if (n.x < 0 || n.x > width) n.vx *= -1;
                if (n.y < 0 || n.y > height) n.vy *= -1;

                ctx.beginPath();
                ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
                const isLight = document.documentElement.classList.contains('light');
                ctx.fillStyle = `rgba(255, 138, 155, ${isLight ? 0.4 : 0.7})`;
                ctx.fill();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        const handleResize = () => {
            width = canvas.width = window.innerWidth;
            height = canvas.height = window.innerHeight;
            createNodes();
        };

        handleResize();
        animate();
        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas ref={canvasRef} id="neural-canvas" className="fixed top-0 left-0 w-full h-full z-0 opacity-50 pointer-events-none" />
    );
};

export default CanvasBackground;