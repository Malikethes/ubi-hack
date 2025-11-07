import React from 'react';
import {
  Modal,
  Box,
  Typography,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { LineChart } from '@mui/x-charts/LineChart';
import CloseIcon from '@mui/icons-material/Close';
import AiOverview from './AiOverview';
import type { SensorData } from '../data/mockData';
import { useTheme } from '@mui/material/styles';
import FlashOnIcon from '@mui/icons-material/FlashOn';

// Styles for the modal box, adjusted for Figma's look
const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: { xs: '95%', sm: '80%', md: '60%', lg: '50%' }, // Responsive width
  maxWidth: '600px', // Max width for larger screens
  bgcolor: 'background.paper',
  borderRadius: '16px', // Rounded corners like Figma
  boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.15)', // More pronounced shadow
  p: 0, // No default padding, we'll add inside
  overflow: 'hidden', // Ensures rounded corners clip content
};

interface SensorModalProps {
  open: boolean;
  onClose: () => void;
  sensor: SensorData | null;
  isLoading: boolean;
}

const SensorModal: React.FC<SensorModalProps> = ({
  open,
  onClose,
  sensor,
  isLoading,
}) => {
  const theme = useTheme();

  const chartData = sensor?.data || [];
  // Ensure data is sorted by time for accurate charts if it's not guaranteed by backend
  const sortedChartData = [...chartData].sort((a, b) => a.time - b.time);
  const xAxisData = sortedChartData.map((d) => new Date(d.time));
  const yAxisData = sortedChartData.map((d) => d.value);

  // Determine a color for the chart area based on the sensor (if possible)
  // For now, let's use a default and potentially integrate with SENSOR_POINTS colors
  const chartAreaColor = theme.palette.warning.main; // Using warning.main for the orange area

  // Display value for the modal title (e.g., 36.8°C)
  const latestValue = yAxisData.length > 0 ? yAxisData[yAxisData.length - 1].toFixed(1) : 'N/A';
  const unit = sensor?.name === 'Skin Temperature' ? '°C' : ''; // Example unit

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={style}>
        {/* Modal Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            p: 2,
            pb: 1, // Less padding bottom
            borderBottom: '1px solid #eee',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: '50%',
                bgcolor: chartAreaColor, // Dot color
                mr: 1,
              }}
            />
            <Typography variant="h6" component="h3" sx={{ fontWeight: 600 }}>
              {sensor?.name || 'Loading Data...'}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Typography variant="body1" sx={{ mr: 1, fontWeight: 500, color: theme.palette.text.secondary }}>
              {latestValue}{unit}
            </Typography>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Modal Content */}
        <Box sx={{ p: 3 }}>
          {isLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
              <CircularProgress />
            </Box>
          ) : sensor ? (
            <>
              {/* The Chart */}
              <Box sx={{ height: 250, width: '100%', mt: 2 }}>
                <LineChart
                  xAxis={[
                    {
                      data: xAxisData,
                      scaleType: 'time',
                      valueFormatter: (date) =>
                        date.toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        }), // 00:00, 04:00, etc.
                    },
                  ]}
                  yAxis={[
                    {
                      label: `${sensor.name} (${unit})`, // Label with unit
                    },
                  ]}
                  series={[
                    {
                      data: yAxisData,
                      label: sensor.name,
                      showMark: false, // Don't show individual dots on the line
                      area: true, // Fill the area below the line
                      color: chartAreaColor, // Area color
                    },
                  ]}
                  grid={{ vertical: true, horizontal: true }} // Add grids like Figma
                  margin={{ top: 20, right: 30, left: 60, bottom: 30 }}
                />
              </Box>

              {/* The AI Overview - Styled to match Figma's box */}
              <Box sx={{
                mt: 3,
                p: 2,
                backgroundColor: theme.palette.primary.light, // Light blue background
                borderRadius: '12px', // Rounded corners
                border: `1px solid ${theme.palette.primary.main}`, // Blue border
                boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.05)',
                display: 'flex',
                alignItems: 'flex-start',
              }}>
                <FlashOnIcon sx={{ color: theme.palette.primary.main, mr: 1.5, fontSize: '1.5rem' }} />
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600, color: theme.palette.primary.main, mb: 0.5 }}>
                    AI-Powered Analysis
                  </Typography>
                  <AiOverview sensorName={sensor.name} data={sensor.data} />
                </Box>
              </Box>
            </>
          ) : (
            <Typography variant="h6" color="text.secondary" sx={{ my: 4 }}>
              No data available for this sensor.
            </Typography>
          )}
        </Box>
      </Box>
    </Modal>
  );
};

export default SensorModal;