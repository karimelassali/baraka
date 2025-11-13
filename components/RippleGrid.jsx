'use client';

import React, { useEffect, useRef } from 'react';

const RippleGrid = ({
  enableRainbow = false,
  gridColor = '#ffffff',
  rippleIntensity = 0.05,
  gridSize = 10,
  gridThickness = 15,
  mouseInteraction = true,
  mouseInteractionRadius = 1.2,
  opacity = 0.8,
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      const { width, height } = container.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Ripple effects
    const ripples = [];
    
    const createRipple = (x, y) => {
      ripples.push({
        x,
        y,
        size: 1,
        maxRadius: Math.min(canvas.width, canvas.height) * mouseInteractionRadius,
        growing: true,
      });
    };
    
    if (mouseInteraction) {
      const handleMouseMove = (e) => {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        createRipple(x, y);
      };
      
      canvas.addEventListener('mousemove', handleMouseMove);
    }
    
    // Animation loop
    let animationFrame;
    
    const drawGrid = () => {
      const width = canvas.width;
      const height = canvas.height;
      
      // Clear canvas
      ctx.clearRect(0, 0, width, height);
      
      // Draw grid
      ctx.strokeStyle = gridColor;
      ctx.lineWidth = gridThickness;
      ctx.globalAlpha = opacity;
      
      // Draw vertical lines
      for (let x = 0; x <= width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      // Draw horizontal lines
      for (let y = 0; y <= height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }
      
      // Draw ripples
      ctx.strokeStyle = enableRainbow ? '#ff0000' : gridColor;
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.6;
      
      for (let i = ripples.length - 1; i >= 0; i--) {
        const ripple = ripples[i];
        
        ctx.beginPath();
        ctx.arc(ripple.x, ripple.y, ripple.size, 0, Math.PI * 2);
        ctx.stroke();
        
        // Update ripple size
        if (ripple.growing) {
          ripple.size += rippleIntensity * 10;
          if (ripple.size > ripple.maxRadius) {
            ripple.growing = false;
          }
        } else {
          ripple.size -= rippleIntensity * 5;
          if (ripple.size <= 0) {
            ripples.splice(i, 1);
            continue;
          }
        }
      }
      
      // Reset alpha for next frame
      ctx.globalAlpha = opacity;
      
      animationFrame = requestAnimationFrame(drawGrid);
    };
    
    drawGrid();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      canvas?.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrame);
    };
  }, [enableRainbow, gridColor, rippleIntensity, gridSize, gridThickness, mouseInteraction, mouseInteractionRadius, opacity]);

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
      <canvas 
        ref={canvasRef} 
        style={{ 
          position: 'absolute', 
          top: 0, 
          left: 0, 
          width: '100%', 
          height: '100%',
          background: enableRainbow ? 'linear-gradient(45deg, #ff0000, #00ff00, #0000ff)' : 'white'
        }}
      />
    </div>
  );
};

export default RippleGrid;