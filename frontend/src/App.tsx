import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Divider, // <-- Import Divider
} from '@mui/material';
import HumanVisualization from './components/HumanVisualization';
import SensorModal from './components/SensorModal';
import PersonaSelection from './components/PersonaSelection';
import TimeRangeSlider from './components/TimeRangeSlider';
import StatusPanel, { type SummaryData } from './components/StatusPanel';
import {
  getMockDataForSensorPoint,
  getOverallStatusAI,
} from './data/mockData';
import type { SensorData, SensorPointData } from './data/sensorData.types';
import { calculateSummary } from './utils/dataCalculator';

// --- AESTHETIC UPDATE: Refined Theme ---
const theme = createTheme({
  palette: {
    primary: {
      main: '#007AFF', // Clean blue
      light: '#e6f2ff', // Lighter, softer blue for backgrounds
    },
    background: {
      default: '#f4f7f9', // Light grey for the page background
      paper: '#ffffff', // White for cards
    },
    text: {
      primary: '#1a202c', // Darker text for high contrast
      secondary: '#5a6978', // Softer grey for subtext
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
    h2: {
      fontWeight: 700,
      fontSize: '2.5rem',
    },
    h4: {
      fontWeight: 700,
      fontSize: '1.75rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem', // Cleaned up for hierarchy
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.1rem',
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.9rem',
    },
    button: {
      textTransform: 'none',
      fontWeight: 600,
      borderRadius: '8px',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px', // Softer radius
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)', // Softer shadow
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0px 6px 16px rgba(0, 0, 0, 0.08)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
        },
      },
    },
    MuiModal: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(3px)',
        },
      },
    },
  },
});
// --- END OF THEME UPDATE ---

// --- MASTER TIME SETUP ---
// This is the total duration of our mock data in seconds
const MASTER_DATA_DURATION = 3600; // 1 hour

function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAppLoading, setIsAppLoading] = useState(true); // For initial data load
  const [selectedSensorPointData, setSelectedSensorPointData] =
    useState<SensorPointData | null>(null);

  const [selectedDataset, setSelectedDataset] = useState<string>('S2');

  // State for the master time range slider
  const [timeRange, setTimeRange] = useState<number[]>([
    0,
    MASTER_DATA_DURATION,
  ]);

  // This state holds *all* data for the panels
  const [allChestData, setAllChestData] = useState<SensorData[] | null>(null);
  const [allHandData, setAllHandData] = useState<SensorData[] | null>(null);

  // This state holds the calculated summary data for the panel
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [overallStatus, setOverallStatus] = useState<{
    emoji: string;
    insight: string;
  } | null>(null);

  // Memoize the summary calculation
  const calculatedSummary = useMemo(() => {
    if (!allChestData || !allHandData) return null;

    const allData = [...allChestData, ...allHandData];
    // Create the object that StatusPanel expects
    const summary: SummaryData = {
      'heart-rate': null,
      'breathing-rate': null,
      'stress': null,
      'activity': null,
      'temperature': null,
    };

    // Find each parameter and calculate its summary
    for (const param of allData) {
      if (param.id in summary) {
        summary[param.id as keyof SummaryData] = calculateSummary(
          param,
          timeRange,
        );
      }
    }
    return summary;
  }, [allChestData, allHandData, timeRange]);

  // Memoize the overall status AI calculation
  const calculatedStatus = useMemo(() => {
    if (!allChestData || !allHandData) return null;

    // This call now matches the new signature in mockData.ts
    const allData = [...allChestData, ...allHandData];
    return getOverallStatusAI(allData, timeRange);
    //
  }, [allChestData, allHandData, timeRange]);

  // Effect to update summary data when calculation changes
  useEffect(() => {
    setSummaryData(calculatedSummary);
  }, [calculatedSummary]);

  // Effect to update overall status when calculation changes
  useEffect(() => {
    // This is async, so we handle the promise
    calculatedStatus?.then((status) => {
      setOverallStatus(status);
    });
  }, [calculatedStatus]);

  // Effect to load *all* panel data on component mount or dataset change
  useEffect(() => {
    const loadAllData = async () => {
      setIsAppLoading(true);
      try {
        // Fetch data for both points
        const chestData = await getMockDataForSensorPoint(
          'chest',
          selectedDataset,
        );
        const handData = await getMockDataForSensorPoint(
          'hand',
          selectedDataset,
        );

        setAllChestData(chestData.parameters);
        setAllHandData(handData.parameters);
      } catch (error) {
        console.error('Failed to load initial panel data:', error);
        setAllChestData(null);
        setAllHandData(null);
      } finally {
        setIsAppLoading(false);
      }
    };

    loadAllData();
  }, [selectedDataset]);

  // This function is for the modal, not the panel
  const handleSensorClick = async (sensorPointId: string) => {
    setIsLoading(true);
    setSelectedSensorPointData(null);
    setModalOpen(true);

    try {
      // Fetch data for the specific point *again* for the modal
      // This is fast because it's mock data
      const data = await getMockDataForSensorPoint(
        sensorPointId,
        selectedDataset,
      );
      setSelectedSensorPointData(data);
    } catch (error) {
      console.error('Failed to fetch sensor point data:', error);
      setSelectedSensorPointData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedSensorPointData(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default, // Use the new theme background
          py: { xs: 2, sm: 4 }, // Add padding
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ my: 4 }}>
            {/* --- AESTHETIC UPDATE: Main Content Card --- */}
            <Box
              sx={{
                mt: 2, // Reduced margin-top
                p: { xs: 2, sm: 3, md: 4 }, // Responsive padding
                backgroundColor: theme.palette.background.paper, // White card
                borderRadius: '16px', // Softer border radius
                boxShadow: '0px 4px 20px rgba(0, 0, 0, 0.06)', // Figma-like shadow
              }}
            >
              {/* --- NEW PLACEMENT --- */}
              <PersonaSelection
                selectedDataset={selectedDataset}
                onSelectDataset={setSelectedDataset}
              />
              <Divider sx={{ my: 3 }} />
              {/* --- END NEW PLACEMENT --- */}

              {/* --- New 2-Column Layout (No Grid) --- */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' },
                  gap: { xs: 4, md: 3 }, // Gap between columns
                }}
              >
                {/* Left Column */}
                <Box
                  sx={{
                    flex: '1 1 40%', // Takes up 40% of the width
                    minWidth: 0,
                    backgroundColor: '#f9fafb', // Light bg for the panel itself
                    borderRadius: '12px',
                    p: { xs: 2, sm: 3 },
                  }}
                >
                  <StatusPanel
                    summary={summaryData}
                    isLoading={isAppLoading}
                  />
                </Box>

                {/* Right Column */}
                <Box
                  sx={{
                    flex: '1 1 60%', // Takes up 60%
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    minWidth: 0,
                  }}
                >
                  <Typography
                    variant="h5" // Bigger title
                    component="p"
                    gutterBottom
                    sx={{
                      mt: { xs: 0, md: 2 },
                      textAlign: 'center',
                      fontWeight: 600,
                      color: 'text.primary',
                    }}
                  >
                    Interactive Health Monitoring
                  </Typography>
                  <Typography
                    variant="body1" // Slightly bigger subtext
                    color="text.secondary"
                    sx={{ mb: { xs: 2, md: 4 }, textAlign: 'center' }}
                  >
                    Click a sensor point to view detailed analysis.
                  </Typography>

                  <HumanVisualization
                    onSensorClick={handleSensorClick}
                    overallStatus={overallStatus}
                  />
                </Box>
              </Box>
              {/* --- End of 2-Column Layout --- */}

              {/* Time Range Slider (at the bottom) */}
              <TimeRangeSlider
                masterStart={0}
                masterEnd={MASTER_DATA_DURATION}
                value={timeRange}
                onChange={setTimeRange}
              />
            </Box>
          </Box>

          <SensorModal
            open={modalOpen}
            onClose={handleCloseModal}
            sensorPointData={selectedSensorPointData}
            isLoading={isLoading}
            timeRange={timeRange} // Pass the time range to the modal
          />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;