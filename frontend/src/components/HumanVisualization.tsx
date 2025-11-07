import React, { useState } from 'react';
import { Box } from '@mui/material'; // We still use Box for layout

// We'll use the sensor data structure from your Figma code,
// as it's perfect for this (x, y, color, etc.)
// These IDs (e.g., 'heart-rate') will be passed to our dataService.
const SENSOR_POINTS = [
  {
    id: 'heart-rate',
    name: 'Heart Rate',
    x: 200,
    y: 180,
    color: '#ef4444',
  },
  {
    id: 'temperature',
    name: 'Body Temperature',
    x: 200,
    y: 80,
    color: '#f59e0b',
  },
  {
    id: 'blood-pressure',
    name: 'Blood Pressure',
    x: 240,
    y: 170,
    color: '#3b82f6',
  },
  {
    id: 'oxygen',
    name: 'Oxygen Saturation',
    x: 160,
    y: 170,
    color: '#06b6d4',
  },
  {
    id: 'steps', // Mapped to 'activity'
    name: 'Activity (Steps)',
    x: 200,
    y: 360,
    color: '#8b5cf6',
  },
  {
    id: 'sleep',
    name: 'Sleep Quality',
    x: 200,
    y: 50, // Slightly different from 'temperature' y
    color: '#6366f1',
  },
  {
    id: 'respiratory-rate',
    name: 'Respiratory Rate',
    x: 160,
    y: 200,
    color: '#10b981',
  },
  {
    id: 'hydration',
    name: 'Hydration Level',
    x: 240,
    y: 200,
    color: '#14b8a6',
  },
];

interface HumanVisualizationProps {
  onSensorClick: (sensorId: string) => void;
}

const HumanVisualization: React.FC<HumanVisualizationProps> = ({
  onSensorClick,
}) => {
  const [hoveredSensor, setHoveredSensor] = useState<string | null>(null);

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '400px', // Set max width for the SVG
        margin: '2rem auto',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <svg
        width="400"
        height="500"
        viewBox="0 0 400 500"
        style={{ maxWidth: '100%', height: 'auto' }}
      >
        {/* Human Body Outline - from your code */}
        <g stroke="#94a3b8" strokeWidth="2" fill="none">
          {/* Head */}
          <circle cx="200" cy="60" r="35" />

          {/* Neck */}
          <line x1="200" y1="95" x2="200" y2="120" />

          {/* Torso */}
          <path d="M 200 120 L 160 130 L 150 200 L 155 280 L 175 320 L 200 320 L 225 320 L 245 280 L 250 200 L 240 130 Z" />

          {/* Arms */}
          <path d="M 160 130 L 120 150 L 100 240" strokeLinecap="round" />
          <path d="M 240 130 L 280 150 L 300 240" strokeLinecap="round" />

          {/* Legs */}
          <path d="M 175 320 L 170 400 L 175 480" strokeLinecap="round" />
          <path d="M 225 320 L 230 400 L 225 480" strokeLinecap="round" />
        </g>

        {/* Clickable Health Metric Points - from your code */}
        {SENSOR_POINTS.map((sensor) => (
          <g key={sensor.id}>
            <circle
              cx={sensor.x}
              cy={sensor.y}
              r={hoveredSensor === sensor.id ? 16 : 12}
              fill={sensor.color}
              opacity={hoveredSensor === sensor.id ? 1 : 0.8}
              onClick={() => onSensorClick(sensor.id)}
              onMouseEnter={() => setHoveredSensor(sensor.id)}
              onMouseLeave={() => setHoveredSensor(null)}
              style={{
                cursor: 'pointer',
                transition: 'r 0.2s ease-out, opacity 0.2s ease-out',
              }}
            />
            {/* Inner white circle for style */}
            <circle
              cx={sensor.x}
              cy={sensor.y}
              r={6}
              fill="white"
              style={{ pointerEvents: 'none' }} // Makes it non-interactive
            />

            {/* Hover tooltip text (from your code) */}
            {hoveredSensor === sensor.id && (
              <g style={{ pointerEvents: 'none' }}>
                <rect
                  x={sensor.x - 60}
                  y={sensor.y - 40}
                  width="120"
                  height="28"
                  fill="white"
                  stroke={sensor.color}
                  strokeWidth="2"
                  rx="4"
                />
                <text
                  x={sensor.x}
                  y={sensor.y - 22}
                  textAnchor="middle"
                  fill="#1e293b"
                  style={{ fontSize: '14px', fontWeight: 500 }}
                >
                  {sensor.name}
                </text>
              </g>
            )}
          </g>
        ))}
      </svg>
    </Box>
  );
};

export default HumanVisualization;