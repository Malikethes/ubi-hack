import React from 'react';
import { Box, Typography, Divider, Skeleton } from '@mui/material';
// No icon imports needed

// This type defines the props our panel expects
export interface SummaryData {
  'heart-rate': string | number | null;
  'breathing-rate': string | number | null;
  'stress': string | number | null;
  'activity': string | number | null;
  'temperature': string | number | null;
}

interface StatusPanelProps {
  summary: SummaryData | null;
  isLoading: boolean;
}

// A new sub-component to make our list look good and consistent
const StatusRow: React.FC<{
  emoji: string;
  label: string;
  value: string | number | null;
  unit: string;
  isLoading: boolean;
}> = ({ emoji, label, value, unit, isLoading }) => {
  const displayValue =
    value === null || value === '...' ? '...' : Number(value).toFixed(1);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 2.5, // More vertical padding
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Typography sx={{ fontSize: '1.5rem', mr: 2 }}>{emoji}</Typography>
        <Box>
          <Typography
            sx={{
              fontWeight: 500,
              color: 'text.primary',
              lineHeight: 1.2,
            }}
          >
            {label}
          </Typography>
          <Typography sx={{ fontSize: '0.8rem', color: 'text.secondary' }}>
            {isLoading ? 'Loading...' : `Avg. (${unit})`}
          </Typography>
        </Box>
      </Box>
      <Box>
        {isLoading ? (
          <Skeleton variant="text" width={60} height={40} />
        ) : (
          <Typography
            variant="h4"
            sx={{ fontWeight: 600, color: 'text.primary' }}
          >
            {displayValue}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

const StatusPanel: React.FC<StatusPanelProps> = ({ summary, isLoading }) => {
  return (
    <Box>
      <Typography
        variant="h5"
        sx={{ fontWeight: 600, color: 'text.primary', mb: 1 }}
      >
        Live Status
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
        Average values for the selected time.
      </Typography>
      <Divider sx={{ mb: 1 }} />
      <StatusRow
        emoji="❤️"
        label="Heart Rate"
        unit="bpm"
        isLoading={isLoading}
        value={summary ? summary['heart-rate'] : null}
      />
      <Divider variant="middle" sx={{ opacity: 0.5 }} />
      <StatusRow
        emoji="🌬️"
        label="Breathing Rate"
        unit="br/min"
        isLoading={isLoading}
        value={summary ? summary['breathing-rate'] : null}
      />
      <Divider variant="middle" sx={{ opacity: 0.5 }} />
      <StatusRow
        emoji="🧘"
        label="Stress Level"
        unit="1-10"
        isLoading={isLoading}
        value={summary ? summary['stress'] : null}
      />
      <Divider variant="middle" sx={{ opacity: 0.5 }} />
      <StatusRow
        emoji="🏃"
        label="Activity"
        unit="Movement"
        isLoading={isLoading}
        value={summary ? summary['activity'] : null}
      />
      <Divider variant="middle" sx={{ opacity: 0.5 }} />
      <StatusRow
        emoji="🌡️"
        label="Temperature"
        unit="°C"
        isLoading={isLoading}
        value={summary ? summary['temperature'] : null}
      />
    </Box>
  );
};

export default StatusPanel;