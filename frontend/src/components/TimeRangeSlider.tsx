import React from 'react';
import { Box, Slider, Typography } from '@mui/material';
import { formatSeconds } from '../utils/formatters'; // Import our new helper

interface TimeRangeSliderProps {
  // The earliest possible time (slider min, e.g., 0)
  masterStart: number;
  // The latest possible time (slider max, e.g., 3600)
  masterEnd: number;
  // The current selected range [start, end]
  value: number[];
  // Callback when the value changes
  onChange: (newValue: number[]) => void;
}

const TimeRangeSlider: React.FC<TimeRangeSliderProps> = ({
  masterStart,
  masterEnd,
  value,
  onChange,
}) => {
  const handleChange = (event: Event, newValue: number | number[]) => {
    onChange(newValue as number[]);
  };

  return (
    <Box sx={{ width: '90%', margin: '1rem auto 0' }}>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Select Time Range
      </Typography>
      <Slider
        value={value}
        onChange={handleChange}
        min={masterStart}
        max={masterEnd}
        valueLabelFormat={formatSeconds} // Use our new helper
        valueLabelDisplay="auto"
        disableSwap
      />
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary">
          {formatSeconds(value[0])}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {formatSeconds(value[1])}
        </Typography>
      </Box>
    </Box>
  );
};

export default TimeRangeSlider;