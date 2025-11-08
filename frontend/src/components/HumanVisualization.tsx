import React, { useState } from 'react';
import { Box, Tooltip, Typography } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Our two sensor points
const SENSOR_POINTS = [
  {
    id: 'chest',
    name: 'Chest Sensors',
    x: '50%',
    y: '35%',
    color: '#007AFF', // Blue
  },
  {
    id: 'hand',
    name: 'Hand Sensor',
    x: '80%',
    y: '55%',
    color: '#ef4444', // Red
  },
];

// New Prop type
interface OverallStatus {
  emoji: string;
  insight: string;
}

interface HumanVisualizationProps {
  onSensorClick: (sensorPointId: string) => void;
  overallStatus: OverallStatus | null; // New prop
}

const HumanVisualization: React.FC<HumanVisualizationProps> = ({
  onSensorClick,
  overallStatus,
}) => {
  const [hoveredSensor, setHoveredSensor] = useState<string | null>(null);
  const theme = useTheme();

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: '300px',
        margin: '2rem auto',
        position: 'relative',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* --- NEW: Overall Status Emoji --- */}
      <Tooltip
        title={
          overallStatus ? overallStatus.insight : 'Calculating overall status...'
        }
        arrow
        placement="top"
      >
        <Typography
          variant="h3"
          sx={{
            position: 'absolute',
            top: '5%', // Position near the head
            left: '10%', // Position to the left
            cursor: 'default',
            transition: 'transform 0.2s ease',
            '&:hover': {
              transform: 'scale(1.1)',
            },
          }}
        >
          {overallStatus ? overallStatus.emoji : '🤔'}
        </Typography>
      </Tooltip>
      {/* --- End of New Code --- */}

      <svg
        width="100%"
        height="100%"
        viewBox="0 0 300 500"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* SVG Path for human body */}
        <path
          d="M150 75 C125 75 105 95 105 120 S125 165 150 165 195 145 195 120 175 75 150 75z M150 170 C120 170 90 175 90 205 L90 310 C90 340 110 350 110 350 L110 470 C110 485 120 495 135 495 L165 495 C180 495 190 485 190 470 L190 350 C190 350 210 340 210 310 L210 205 C210 175 180 170 150 170z M80 210 C70 210 60 215 60 225 L60 300 C60 310 70 315 75 315 S85 305 85 300 L85 225 C85 215 80 210 80 210z M220 210 C230 210 240 215 240 225 L240 300 C240 310 230 315 225 315 S215 305 215 300 L215 225 C215 215 220 210 220 210z"
          fill="#e0e0e0"
          stroke={theme.palette.grey[400]}
          strokeWidth="2"
        />

        {/* Clickable Health Metric Points */}
        {SENSOR_POINTS.map((sensor) => (
          <g key={sensor.id}>
            {/* Tooltip text (SVG native) */}
            {hoveredSensor === sensor.id && (
              <g style={{ pointerEvents: 'none' }}>
                <rect
                  x={parseFloat(sensor.x) * 3 - 60}
                  y={parseFloat(sensor.y) * 5 - 40}
                  width="120"
                  height="28"
                  fill="white"
                  stroke={sensor.color}
                  strokeWidth="2"
                  rx="4"
                />
                <text
                  x={parseFloat(sensor.x) * 3}
                  y={parseFloat(sensor.y) * 5 - 22}
                  textAnchor="middle"
                  fill="#1e293b"
                  style={{ fontSize: '14px', fontWeight: 500 }}
                >
                  {sensor.name}
                </text>
              </g>
            )}

            {/* Clickable Circle */}
            <circle
              cx={sensor.x}
              cy={sensor.y}
              r={hoveredSensor === sensor.id ? 10 : 8}
              fill={sensor.color}
              onClick={() => onSensorClick(sensor.id)}
              onMouseEnter={() => setHoveredSensor(sensor.id)}
              onMouseLeave={() => setHoveredSensor(null)}
              style={{
                cursor: 'pointer',
                transition: 'r 0.2s ease-out',
                stroke: 'white',
                strokeWidth: 2,
              }}
            />
          </g>
        ))}
      </svg>
    </Box>
  );
};

export default HumanVisualization;