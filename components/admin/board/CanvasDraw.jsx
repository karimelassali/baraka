"use client";

import { useRef, useState, useEffect } from 'react';
import { Eraser, Undo, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function CanvasDraw({ onSave, initialData }) {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [color, setColor] = useState('#000000');
    const [lineWidth, setLineWidth] = useState(2);
    const [context, setContext] = useState(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        setContext(ctx);

        if (initialData) {
            const img = new Image();
            img.src = initialData;
            img.onload = () => {
                ctx.drawImage(img, 0, 0);
            };
        }

        // Handle resize
        const resizeCanvas = () => {
            const parent = canvas.parentElement;
            if (parent) {
                // Save current content
                const tempCanvas = document.createElement('canvas');
                const tempCtx = tempCanvas.getContext('2d');
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                tempCtx.drawImage(canvas, 0, 0);

                // Resize
                canvas.width = parent.clientWidth;
                canvas.height = 300; // Fixed height

                // Restore content
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.strokeStyle = color;
                ctx.lineWidth = lineWidth;
                ctx.drawImage(tempCanvas, 0, 0);
            }
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        return () => window.removeEventListener('resize', resizeCanvas);
    }, []);

    useEffect(() => {
        if (context) {
            context.strokeStyle = color;
            context.lineWidth = lineWidth;
        }
    }, [color, lineWidth, context]);

    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        context.beginPath();
        context.moveTo(x, y);
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        e.preventDefault(); // Prevent scrolling on touch
        const canvas = canvasRef.current;
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        context.lineTo(x, y);
        context.stroke();
    };

    const stopDrawing = () => {
        if (isDrawing) {
            context.closePath();
            setIsDrawing(false);
            handleSave();
        }
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        context.clearRect(0, 0, canvas.width, canvas.height);
        handleSave();
    };

    const handleSave = () => {
        const canvas = canvasRef.current;
        const dataUrl = canvas.toDataURL('image/png');
        onSave(dataUrl);
    };

    const colors = ['#000000', '#EF4444', '#3B82F6', '#10B981', '#F59E0B'];

    return (
        <div className="flex flex-col gap-2 w-full">
            <div className="flex items-center justify-between bg-muted/30 p-2 rounded-lg border">
                <div className="flex items-center gap-2">
                    {colors.map((c) => (
                        <button
                            key={c}
                            onClick={() => setColor(c)}
                            className={cn(
                                "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                                color === c ? "border-primary scale-110" : "border-transparent"
                            )}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                    <div className="w-px h-6 bg-border mx-2" />
                    <input
                        type="range"
                        min="1"
                        max="10"
                        value={lineWidth}
                        onChange={(e) => setLineWidth(parseInt(e.target.value))}
                        className="w-20 cursor-pointer"
                    />
                </div>
                <button
                    onClick={clearCanvas}
                    className="p-1.5 text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                    title="Clear"
                >
                    <Trash2 className="h-4 w-4" />
                </button>
            </div>
            <div className="relative w-full h-[300px] border rounded-lg bg-white overflow-hidden touch-none">
                <canvas
                    ref={canvasRef}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="cursor-crosshair w-full h-full"
                />
            </div>
        </div>
    );
}
