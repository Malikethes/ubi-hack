import React from 'react';
import { Box, Typography, Divider } from '@mui/material';

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

// Helper component for each row in the panel
const StatusRow = ({
  label,
  value,
  unit,
}: {
  label: string;
  value: string | number | null;
  unit: string;
}) => (
  <Box sx={{ py: 2 }}>
    <Typography
      variant="body2"
      color="text.secondary"
      sx={{ fontWeight: 500 }}
    >
      {label}
    </Typography>
    <Box
      sx={{
        display: 'flex',
        alignItems: 'baseline',
        gap: 0.5,
        mt: 0.5,
      }}
    >
      <Typography variant="h5" sx={{ fontWeight: 600 }}>
        {value}
      </Typography>
      <Typography variant="body1" color="text.secondary">
        {unit}
      </Typography>
    </Box>
  </Box>
);

const StatusPanel: React.FC<StatusPanelProps> = ({ summary, isLoading }) => {
  // Use '...' as a placeholder while loading
  const val = (param: keyof SummaryData) =>
    isLoading || !summary ? '...' : summary[param];

  return (
    <Box
      sx={{
        p: { xs: 2, md: 3 },
        borderRight: { xs: 'none', md: '1px solid #eee' },
        height: '100%',
      }}
    >
      <Typography variant="h6" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
        Live Status
      </Typography>
      <Typography variant="body2" color="text.secondary">
        Summary for the selected time period.
      </Typography>
      <Box sx={{ mt: 2 }}>
        <StatusRow
          label="Heart Rate"
          value={val('heart-rate')}
          unit="bpm"
        />
        <Divider />
        <StatusRow
          label="Breathing Rate"
          value={val('breathing-rate')}
          unit="br/min"
        />
        <Divider />
        {/* --- STRESS ROW IS NOW A STANDARD ROW --- */}
        <StatusRow
          label="Stress Level"
          value={val('stress')}
          unit="0-10"
        />
        <Divider />
        <StatusRow label="Activity" value={val('activity')} unit="MET" />
        <Divider />
        <StatusRow
          label="Temperature"
          value={val('temperature')}
          unit="°C"
        />
      </Box>
    </Box>
  );
};

export default StatusPanel;