import { useState } from 'react';
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
import PersonaSelection from './components/PersonaSelection'; // New component!
import { fetchDataForSensor } from './services/dataService';
import type { SensorData } from './data/mockData';

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
    text: {
      primary: '#333',
      secondary: '#666',
    },
    background: {
      default: '#f4f7f6', // Light background for the whole page
    }
  },
  typography: {
    fontFamily: '"Inter", "Helvetica Neue", Arial, sans-serif', // Figma seems to use Inter
    h2: {
      fontWeight: 600,
      fontSize: '2.5rem',
      color: '#333',
    },
    h4: { // For modal titles
      fontWeight: 600,
      fontSize: '1.8rem',
      color: '#333',
    },
    h5: { // For 'Select Dataset'
      fontWeight: 600,
      fontSize: '1.2rem',
      color: '#333',
    },
    h6: {
      fontWeight: 500,
      fontSize: '1.1rem',
    },
    body1: {
      fontSize: '0.95rem',
      lineHeight: 1.6,
    },
    button: {
      textTransform: 'none', // Figma buttons often don't have uppercase
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.08)', // Subtle shadow from Figma
          transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
          '&:hover': {
            boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.12)',
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
          // Blur background when modal is open, similar to Figma
          backdropFilter: 'blur(3px)',
        }
      }
    }
  },
});

function App() {
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedSensor, setSelectedSensor] = useState<SensorData | null>(null);
  const [selectedPersona, setSelectedPersona] = useState<string>('General'); // Default to General

  const handleSensorClick = async (sensorId: string) => {
    setIsLoading(true);
    setSelectedSensor(null);
    setModalOpen(true);

    try {
      // In a real app, you might pass `selectedPersona` to the backend
      const data = await fetchDataForSensor(sensorId, selectedPersona);
      setSelectedSensor(data);
    } catch (error) {
      console.error('Failed to fetch sensor data:', error);
      setSelectedSensor(null);
      // You might want to show an error message in the modal here
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedSensor(null);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: '100vh', backgroundColor: theme.palette.background.default, py: 4 }}>
        <Container maxWidth="lg"> {/* Changed to lg for more width */}
          <Box sx={{ my: 4 }}>
            {/* Persona Selection */}
            <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
              Select Dataset
            </Typography>
            <PersonaSelection
              selectedPersona={selectedPersona}
              onSelectPersona={setSelectedPersona}
            />

            {/* Main content area */}
            <Box sx={{
              mt: 4,
              p: 4,
              backgroundColor: 'white',
              borderRadius: '12px',
              boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.05)', // Card shadow
              textAlign: 'center',
            }}>
              <Typography variant="h6" component="p" gutterBottom sx={{ mt: 2 }}>
                Interactive Health Monitoring
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
                Click on any metric point to view detailed analysis
              </Typography>

              {/* The main interactive component */}
              <HumanVisualization onSensorClick={handleSensorClick} />
            </Box>
          </Box>

          {/* The modal that pops up */}
          <SensorModal
            open={modalOpen}
            onClose={handleCloseModal}
            sensor={selectedSensor}
            isLoading={isLoading}
          />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App;