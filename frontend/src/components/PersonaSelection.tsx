import React from 'react';
import {
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Typography, // For a nice title
  Box,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';

// Generate the dataset names from S2 to S17
const datasetNames: string[] = [];
for (let i = 2; i <= 17; i++) {
  datasetNames.push(`S${i}`);
}

interface PersonaSelectionProps {
  selectedDataset: string;
  onSelectDataset: (datasetId: string) => void;
}

const PersonaSelection: React.FC<PersonaSelectionProps> = ({
  selectedDataset,
  onSelectDataset,
}) => {
  const handleChange = (event: SelectChangeEvent) => {
    onSelectDataset(event.target.value as string);
  };

  return (
    // Use a flexbox to align the title and the selector
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        flexWrap: 'wrap', // Allow wrapping on small screens
      }}
    >
      <Typography
        variant="h6"
        sx={{ fontWeight: 600, color: 'text.primary' }}
      >
        WESAD Dataset:
      </Typography>
      <FormControl sx={{ minWidth: 200, m: 0 }}>
        <InputLabel id="dataset-select-label">Select Subject</InputLabel>
        <Select
          labelId="dataset-select-label"
          id="dataset-select"
          value={selectedDataset}
          label="Select Subject"
          onChange={handleChange}
          sx={{
            borderRadius: '8px', // Match theme
            backgroundColor: (theme) => theme.palette.background.default, // Lighter background
            '& .MuiOutlinedInput-notchedOutline': {
              borderColor: 'rgba(0, 0, 0, 0.1)',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'primary.main',
            },
          }}
        >
          {datasetNames.map((name) => (
            <MenuItem key={name} value={name}>
              {/* Add a more descriptive label */}
              {name} (Subject {name.substring(1)})
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

export default PersonaSelection;