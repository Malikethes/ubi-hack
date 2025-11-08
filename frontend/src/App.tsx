import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  // Grid, // <-- REMOVED
} from '@mui/material';
import HumanVisualization from './components/HumanVisualization';
import SensorModal from './components/SensorModal';
import PersonaSelection from './components/PersonaSelection';
import TimeRangeSlider from './components/TimeRangeSlider';
import StatusPanel, { type SummaryData } from './components/StatusPanel'; // Import new panel
import {
  getMockDataForSensorPoint,
  getOverallStatusAI, // Import new AI function
} from './data/mockData';
import type { SensorData, SensorPointData } from './data/sensorData.types';
import { calculateSummary } from './utils/dataCalculator'; // Import new calculator

// A simple, reassuring theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#007AFF', // Figma-like blue
      light: '#e0f0ff', // A lighter shade for backgrounds
    },
    secondary: {
      main: '#8E24AA', // Figma professional purple
    },
    success: {
      main: '#4CAF50', // Figma senior green
    },
    warning: {
      main: '#FFA726', // Figma general orange
    },
    error: {
      main: '#D32F2F',
    },
    text: {
      primary: '#333',
      secondary: '#666',
    },
    background: {
      default: '#f4f7f6', // Light background for the whole page
    },
  },
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif',
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-2px)',
          },
        },
      },
    },
  },
});

// --- RELATIVE TIME STATE ---
const MASTER_DATA_DURATION_S = 3600;

function App() {
  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIsLoading, setModalIsLoading] = useState(false);
  const [
    selectedSensorPointData,
    setSelectedSensorPointData,
  ] = useState<SensorPointData | null>(null);

  // Global State
  const [selectedPersona, setSelectedPersona] = useState<string>('General');
  const [timeRange, setTimeRange] = useState<number[]>([
    0,
    MASTER_DATA_DURATION_S,
  ]);

  // --- NEW DASHBOARD STATE ---
  const [allParams, setAllParams] = useState<Record<string, SensorData>>({});
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [overallStatus, setOverallStatus] = useState<{
    emoji: string;
    insight: string;
  } | null>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(true);
  // ---

  // 1. (EFFECT) Fetch all data for the dashboard when persona changes
  useEffect(() => {
    const fetchAllData = async () => {
      setIsSummaryLoading(true);
      // Fetch data from both sensor points
      const [chestData, handData] = await Promise.all([
        getMockDataForSensorPoint('chest', selectedPersona),
        getMockDataForSensorPoint('hand', selectedPersona),
      ]);

      // Combine into one master list of all parameters
      const combinedParams = [
        ...chestData.parameters,
        ...handData.parameters,
      ];

      // Store them in a Record (like a dictionary) for easy access
      const paramsRecord = combinedParams.reduce((acc, param) => {
        acc[param.id] = param;
        return acc;
      }, {} as Record<string, SensorData>);

      setAllParams(paramsRecord);
    };

    fetchAllData();
  }, [selectedPersona]);

  // 2. (EFFECT) Recalculate summaries when time or data changes
  useEffect(() => {
    if (Object.keys(allParams).length === 0) {
      return; // No data loaded yet
    }

    setIsSummaryLoading(true);

    // Calculate the summary for each panel item
    const newSummary: SummaryData = {
      'heart-rate': calculateSummary(allParams['heart-rate'], timeRange),
      'breathing-rate': calculateSummary(
        allParams['breathing-rate'],
        timeRange,
      ),
      'stress': calculateSummary(allParams['stress'], timeRange),
      'activity': calculateSummary(allParams['activity'], timeRange),
      'temperature': calculateSummary(allParams['temperature'], timeRange),
    };

    setSummaryData(newSummary);

    // Get the Overall AI Status
    getOverallStatusAI(newSummary, selectedPersona).then((status) => {
      setOverallStatus(status);
    });

    setIsSummaryLoading(false);
  }, [timeRange, allParams, selectedPersona]);

  // --- MODAL FUNCTIONS ---
  const handleSensorClick = async (sensorPointId: string) => {
    setModalIsLoading(true);
    setSelectedSensorPointData(null);
    setModalOpen(true);

    try {
      // Just fetch the data for the point that was clicked
      const data = await getMockDataForSensorPoint(
        sensorPointId,
        selectedPersona,
      );
      setSelectedSensorPointData(data);
    } catch (error) {
      console.error('Failed to fetch sensor point data:', error);
      setSelectedSensorPointData(null);
    } finally {
      setModalIsLoading(false);
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
          backgroundColor: theme.palette.background.default,
          py: 4,
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ my: 4 }}>
            <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
              Select Dataset
            </Typography>
            <PersonaSelection
              selectedPersona={selectedPersona}
              onSelectPersona={setSelectedPersona}
            />

            {/* --- NEW 2-COLUMN LAYOUT (USING FLEXBOX) --- */}
            <Box
              sx={{
                mt: 4,
                backgroundColor: 'white',
                borderRadius: '12px',
                boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)',
                overflow: 'hidden', // To contain the panel borders
              }}
            >
              {/* Flex container for the two columns */}
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: { xs: 'column', md: 'row' }, // Stack on mobile
                }}
              >
                {/* --- LEFT PANEL --- */}
                <Box
                  sx={{
                    width: { xs: '100%', md: '40%' }, // 40% width
                    flexShrink: 0,
                  }}
                >
                  <StatusPanel
                    summary={summaryData}
                    isLoading={isSummaryLoading}
                  />
                </Box>

                {/* --- RIGHT PANEL (HUMAN) --- */}
                <Box
                  sx={{
                    width: { xs: '100%', md: '60%' }, // 60% width
                    flexGrow: 1,
                    textAlign: 'center',
                    p: { xs: 2, md: 4 },
                    minHeight: '400px',
                  }}
                >
                  <Typography
                    variant="h6"
                    component="p"
                    gutterBottom
                    sx={{ mt: 2 }}
                  >
                    Interactive Health Monitoring
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 4 }}
                  >
                    Click on any sensor point to view detailed analysis
                  </Typography>

                  <HumanVisualization
                    onSensorClick={handleSensorClick}
                    overallStatus={overallStatus}
                  />
                </Box>
              </Box>

              {/* --- SLIDER (BOTTOM) --- */}
              <Box
                sx={{
                  borderTop: '1px solid #eee',
                  pt: 2,
                  pb: 3,
                  backgroundColor: '#fafafa',
                }}
              >
                <TimeRangeSlider
                  masterStart={0}
                  masterEnd={MASTER_DATA_DURATION_S}
                  value={timeRange}
                  onChange={setTimeRange}
                />
              </Box>
            </Box>
          </Box>

          {/* Modal remains unchanged, it will just be triggered */}
          <SensorModal
            open={modalOpen}
            onClose={handleCloseModal}
            sensorPointData={selectedSensorPointData}
            isLoading={modalIsLoading}
            timeRange={timeRange}
          />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;