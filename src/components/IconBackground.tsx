"use client";
import { useState, useEffect, useRef, useMemo } from 'react';
import {
    FileText, CheckCircle2, Book, PenTool, GraduationCap, Calculator,
    Binary, Globe, Microscope, FlaskConical, Atom, Dna, Music, Palette,
    Trophy, Lightbulb, Brain, Puzzle, Layers, Archive, Folder, Search,
    Settings, User, Mail, Calendar, Clock, Compass, Map, Bookmark,
    Link, Cloud, Zap, Star, Heart, Smile, Lock, Shield, CreditCard,
    BarChart, TrendingUp, Code, Terminal, Database, Cpu, Server,
    Wifi, Bluetooth, Radio, Speaker, Mic, Video, Camera, Image,
    Printer, Smartphone, Tablet, Laptop, Monitor, Mouse, Keyboard
} from 'lucide-react';

const ICONS = [
    FileText, CheckCircle2, Book, PenTool, GraduationCap, Calculator,
    Binary, Globe, Microscope, FlaskConical, Atom, Dna, Music, Palette,
    Trophy, Lightbulb, Brain, Puzzle, Layers, Archive, Folder, Search,
    Settings, User, Mail, Calendar, Clock, Compass, Map, Bookmark,
    Link, Cloud, Zap, Star, Heart, Smile, Lock, Shield, CreditCard,
    BarChart, TrendingUp, Code, Terminal, Database, Cpu, Server,
    Wifi, Bluetooth, Radio, Speaker, Mic, Video, Camera, Image,
    Printer, Smartphone, Tablet, Laptop, Monitor, Mouse, Keyboard
];

const IconCell = ({ Icon, mousePos }: { Icon: any, mousePos: { x: number, y: number } }) => {
    const cellRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);

    // Use requestAnimationFrame for smoother animation
    useEffect(() => {
        let animationFrameId: number;

        const animate = () => {
            if (cellRef.current) {
                const rect = cellRef.current.getBoundingClientRect();
                const cellCenterX = rect.left + rect.width / 2;
                const cellCenterY = rect.top + rect.height / 2;

                const dist = Math.hypot(mousePos.x - cellCenterX, mousePos.y - cellCenterY);

                // Wave effect logic
                const maxDist = 250;
                const maxScale = 1.6;

                let newScale = 1;
                if (dist < maxDist) {
                    // Cosine wave for smooth falloff
                    const falloff = Math.cos((dist / maxDist) * (Math.PI / 2));
                    newScale = 1 + (maxScale - 1) * falloff;
                }

                setScale(newScale);
            }
            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => cancelAnimationFrame(animationFrameId);
    }, [mousePos]);

    return (
        <div
            ref={cellRef}
            className="flex items-center justify-center text-[var(--text-secondary)]"
        >
            <Icon
                style={{
                    transform: `scale(${scale})`,
                    opacity: 0.1 + (scale - 1) * 0.3,
                    color: scale > 1.2 ? 'var(--brand-primary)' : 'inherit'
                }}
                size={24}
                className="transition-colors duration-200"
            />
        </div>
    );
};

const IconBackground = () => {
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const [gridDimensions, setGridDimensions] = useState({ rows: 0, cols: 0 });

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            setMousePos({ x: e.clientX, y: e.clientY });
        };

        const updateDimensions = () => {
            if (containerRef.current) {
                const { width, height } = containerRef.current.getBoundingClientRect();
                // Density of icons
                const cols = Math.ceil(width / 60);
                const rows = Math.ceil(height / 60);
                setGridDimensions({ rows, cols });
            }
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('resize', updateDimensions);
        updateDimensions();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('resize', updateDimensions);
        };
    }, []);

    // Memoize the grid of icons to prevent re-randomizing on every render
    const iconGrid = useMemo(() => {
        const grid = [];
        for (let i = 0; i < gridDimensions.rows * gridDimensions.cols; i++) {
            const Icon = ICONS[Math.floor(Math.random() * ICONS.length)];
            grid.push(Icon);
        }
        return grid;
    }, [gridDimensions]);

    return (
        <div
            ref={containerRef}
            className="fixed inset-0 z-0 overflow-hidden bg-[var(--bg-main)] pointer-events-none"
        >
            <div
                className="grid w-full h-full transition-opacity duration-500"
                style={{
                    gridTemplateColumns: `repeat(${gridDimensions.cols}, 1fr)`,
                    gridTemplateRows: `repeat(${gridDimensions.rows}, 1fr)`,
                }}
            >
                {iconGrid.map((Icon, index) => (
                    <IconCell
                        key={index}
                        Icon={Icon}
                        mousePos={mousePos}
                    />
                ))}
            </div>
        </div>
    );
};

export default IconBackground;
