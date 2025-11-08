import React, { useState, useEffect, useMemo } from 'react';
import {
  Container,
  Typography,
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
} from '@mui/material';
import HumanVisualization from './components/HumanVisualization';
import SensorModal from './components/SensorModal';
import PersonaSelection from './components/PersonaSelection';
import TimeRangeSlider from './components/TimeRangeSlider';
import StatusPanel from './components/StatusPanel';
// --- IMPORT CHANGE ---
// We now import from our new 'dataService' controller
import {
  fetchSensorPointData,
  getOverallStatusAI,
} from './data/dataService';
// --- THIS IS THE FIX for Error 3 ---
import { mockSensorPointDatabase } from './data/mockData';
// --- END IMPORT CHANGE ---
import type { SummaryData } from './components/StatusPanel';
import type { SensorData, SensorPointData } from './data/sensorData.types';
import { calculateSummary } from './utils/dataCalculator';

// A simple, reassuring theme
const theme = createTheme({
  palette: {
    mode: 'light',
    background: {
      default: '#f4f7f6', // Light grey page background
      paper: '#ffffff', // White card background
    },
    primary: {
      main: '#007AFF', // Figma-like blue
    },
    text: {
      primary: '#1A1A1A', // Darker text for contrast
      secondary: '#666666', // Lighter grey text
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica", "Arial", sans-serif',
    h2: {
      fontWeight: 600,
      fontSize: '2.5rem',
      color: '#1A1A1A',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.2rem',
      color: '#1A1A1A',
    },
    h6: {
      fontWeight: 600, // Make titles a bit bolder
      fontSize: '1.1rem',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.05)', // Subtle shadow
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
        },
      },
    },
  },
});

// --- TIME CONFIG ---
// We'll use the relative time from our (new) mock data
const MASTER_START_TIME = 0;
const MASTER_END_TIME = 3600; // 1 hour in seconds
// --- END TIME CONFIG ---

function App() {
  const [isAppLoading, setIsAppLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedSensorPointData, setSensorPointData] =
    useState<SensorPointData | null>(null);

  // State for all data (fetched once at load)
  const [allData, setAllData] = useState<SensorData[]>([]);

  // State for the time slider
  const [timeRange, setTimeRange] = useState<number[]>([
    MASTER_START_TIME,
    MASTER_END_TIME,
  ]);

  // State for the dataset selector
  const [selectedDataset, setSelectedDataset] = useState<string>('S2');

  // State for the left panel summaries
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);

  // State for the emoji status
  const [overallStatus, setOverallStatus] = useState<{
    emoji: string;
    insight: string;
  } | null>(null);

  // --- DATA FETCHING ---
  // This effect runs when the selectedDataset changes
  useEffect(() => {
    console.log(`Fetching all data for dataset: ${selectedDataset}`);
    setIsAppLoading(true);

    // Fetch both sensor points at the same time
    const chestPromise = fetchSensorPointData('chest', selectedDataset);
    const handPromise = fetchSensorPointData('hand', selectedDataset);

    Promise.all([chestPromise, handPromise])
      .then(([chestData, handData]) => {
        // Combine all parameters into one big list
        const allParams = [
          ...chestData.parameters,
          ...handData.parameters,
        ];
        setAllData(allParams);
      })
      .catch((err) => {
        console.error('Error fetching initial data:', err);
        setAllData([]); // Set to empty on error
      })
      .finally(() => {
        setIsAppLoading(false);
      });
  }, [selectedDataset]); // Re-run when dataset changes

  // --- SUMMARY CALCULATION ---
  // This runs when the time slider or data changes
  // --- THIS IS THE FIX for Error 1 & 2 ---
  useMemo(() => {
    if (!allData || allData.length === 0) {
      setSummaryData(null);
      return;
    }

    // Build the summary object for the left panel
    const newSummary: SummaryData = {
      'heart-rate': calculateSummary(
        allData.find((p) => p.id === 'heart-rate')!,
        timeRange,
      ),
      'breathing-rate': calculateSummary(
        allData.find((p) => p.id === 'breathing-rate')!,
        timeRange,
      ),
      'stress': calculateSummary(
        allData.find((p) => p.id === 'stress')!,
        timeRange,
      ),
      'activity': calculateSummary(
        allData.find((p) => p.id === 'activity')!,
        timeRange,
      ),
      'temperature': calculateSummary(
        allData.find((p) => p.id === 'temperature')!,
        timeRange,
      ),
    };
    setSummaryData(newSummary);
    // --- END OF FIX ---

    // Calculate the overall AI status emoji
    getOverallStatusAI(allData, timeRange).then((status) => {
      setOverallStatus(status);
    });
  }, [allData, timeRange]);

  // --- EVENT HANDLERS ---
  const handleSensorClick = async (sensorPointId: string) => {
    setModalLoading(true);
    setSensorPointData(null);
    setModalOpen(true);

    // We don't need to re-fetch! We already have all the data.
    // We just filter what we need for the modal.
    const pointTemplate = mockSensorPointDatabase[sensorPointId];
    if (!pointTemplate) {
      console.error(`No template found for point: ${sensorPointId}`);
      setModalLoading(false);
      return;
    }

    const pointParams = pointTemplate.parameters.map((p) =>
      allData.find((d) => d.id === p.id),
    );

    const dataForModal: SensorPointData = {
      pointId: sensorPointId,
      pointName: pointTemplate.pointName,
      parameters: pointParams.filter(Boolean) as SensorData[],
    };

    setSensorPointData(dataForModal);
    setModalLoading(false);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSensorPointData(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
          py: { xs: 2, md: 4 },
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              backgroundColor: theme.palette.background.paper,
              borderRadius: '16px',
              boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.05)',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              minHeight: '80vh',
            }}
          >
            {/* Top Bar: Dataset Selector */}
            <Box
              sx={{
                p: 2,
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              <PersonaSelection
                selectedDataset={selectedDataset}
                onSelectDataset={setSelectedDataset}
              />
            </Box>

            {/* Main Content Area */}
            <Box
              sx={{
                display: 'flex',
                flexGrow: 1,
                flexDirection: { xs: 'column', md: 'row' }, // Stack on mobile
              }}
            >
              {/* Left Column (Status Panel) */}
              <Box
                sx={{
                  width: { xs: '100%', md: '35%', lg: '30%' },
                  p: 3,
                  borderRight: { xs: 'none', md: `1px solid ${theme.palette.divider}` },
                  borderBottom: { xs: `1px solid ${theme.palette.divider}`, md: 'none' },
                  flexShrink: 0,
                }}
              >
                <StatusPanel summary={summaryData} isLoading={isAppLoading} />
              </Box>

              {/* Right Column (Human + Slider) */}
              <Box
                sx={{
                  flexGrow: 1,
                  p: 3,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '400px', // Ensure it has height
                }}
              >
                <Typography variant="h6" component="h3">
                  Interactive Health Monitoring
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Click a sensor point to explore.
                </Typography>

                <Box
                  sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <HumanVisualization
                    onSensorClick={handleSensorClick}
                    overallStatus={overallStatus}
                  />
                </Box>

                <TimeRangeSlider
                  masterStart={MASTER_START_TIME}
                  masterEnd={MASTER_END_TIME}
                  value={timeRange}
                  onChange={setTimeRange}
                />
              </Box>
            </Box>
          </Box>
        </Container>

        {/* Modal (sits outside the layout) */}
        <SensorModal
          open={modalOpen}
          onClose={handleCloseModal}
          sensorPointData={selectedSensorPointData}
          isLoading={modalLoading}
          timeRange={timeRange} // Pass the timeRange to the modal
        />
      </Box>
    </ThemeProvider>
  );
}

export default App;