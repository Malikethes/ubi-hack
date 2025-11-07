import React, { useState, useEffect } from 'react';
import { getAiOverview } from '../services/openAiService';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';

interface AiOverviewProps {
  sensorName: string;
  data: { time: number; value: number }[];
}

const AiOverview: React.FC<AiOverviewProps> = ({ sensorName, data }) => {
  const [overview, setOverview] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const theme = useTheme(); // Use theme for colors

  useEffect(() => {
    // Only fetch if data is available and sensorName is not empty
    if (sensorName && data && data.length > 0) {
      setIsLoading(true);
      setOverview(''); // Clear previous overview
      getAiOverview(sensorName, data)
        .then((text) => {
          setOverview(text);
        })
        .catch((err) => {
          console.error(err);
          setOverview('An error occurred while getting the summary.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (!sensorName && !data) {
      // If modal opens but no sensor data is selected yet (e.g., loading states)
      setOverview('');
      setIsLoading(false);
    }
  }, [sensorName, data]); // Re-run when data or sensorName changes

  return (
    <Box> {/* Removed styling from here, parent SensorModal handles the box styling */}
      {isLoading ? (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
          <CircularProgress size={16} sx={{ mr: 1, color: theme.palette.primary.main }} />
          <Typography variant="body2" color="text.secondary">
            Asking our AI assistant for a simple explanation...
          </Typography>
        </Box>
      ) : (
        <Typography variant="body2" sx={{ color: theme.palette.text.primary }}>
          {overview}
        </Typography>
      )}
    </Box>
  );
};

export default AiOverview;