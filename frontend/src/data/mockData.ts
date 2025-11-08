import type { SensorData, SensorPointData } from './sensorData.types'; // <-- FIX: import type

// --- MASTER TIME SETUP ---
const DATA_DURATION_S = 3600; // 1 hour of data
const DATA_INTERVAL_S = 5; // Data point every 5 seconds
const DATA_POINTS_COUNT = DATA_DURATION_S / DATA_INTERVAL_S + 1; // 721 points

/**
 * Generates a smooth random walk for data.
 * @param count Number of data points
 * @param min Minimum value
 * @param max Maximum value
 * @param step Max step size per point
 */
const generateRandomWalk = (
  count: number,
  min: number,
  max: number,
  step: number,
): number[] => {
  const data = [];
  let value = (min + max) / 2;
  for (let i = 0; i < count; i++) {
    value += (Math.random() - 0.5) * 2 * step;
    value = Math.min(Math.max(value, min), max); // Clamp value
    data.push(Math.round(value * 10) / 10); // Round to 1 decimal
  }
  return data;
};

// --- TIME AXIS DATA ---
// Generate a single time axis for all time-series data
const timeAxisData = Array.from(
  { length: DATA_POINTS_COUNT },
  (_, i) => i * DATA_INTERVAL_S,
);

// This is our database of *individual parameters*
// This is where we define *all* parameters the app *could* know about.
const allParameters: Record<string, SensorData> = {
  // --- REAL DATA (will be fetched) ---
  'heart-rate': {
    id: 'heart-rate',
    name: 'Heart Rate',
    currentValue: '...',
    visualizationType: 'line',
    payload: {}, // Will be filled by API
  },
  'breathing-rate': {
    id: 'breathing-rate',
    name: 'Breathing Rate',
    currentValue: '...',
    visualizationType: 'line',
    payload: {}, // Will be filled by API
  },
  'stress': {
    id: 'stress',
    name: 'Stress Level',
    currentValue: '...',
    visualizationType: 'line',
    payload: {}, // Will be filled by API
  },
  'temperature': {
    id: 'temperature',
    name: 'Body Temperature',
    currentValue: '...',
    visualizationType: 'line',
    payload: {}, // Will be filled by API
  },
  'pulse-transit-time': {
    id: 'pulse-transit-time',
    name: 'Pulse Transit Time',
    currentValue: '...',
    visualizationType: 'line',
    payload: {}, // Will be filled by API
  },

  // --- MOCK DATA (will be used as fallback) ---
  'activity': {
    id: 'activity',
    name: 'Activity',
    currentValue: '...',
    visualizationType: 'line',
    payload: {
      series: [
        {
          data: generateRandomWalk(DATA_POINTS_COUNT, 0, 5, 0.2),
          label: 'Movement',
          showMark: false,
          area: true,
          color: '#8b5cf6',
        },
      ],
      xAxis: [{ data: timeAxisData, scaleType: 'linear' }],
    },
  },
  'blood-pressure': {
    id: 'blood-pressure',
    name: 'Blood Pressure',
    currentValue: '120/80',
    visualizationType: 'bar',
    payload: {
      series: [
        {
          data: [120, 118, 122, 117, 119, 116, 118],
          label: 'Systolic',
          color: '#3b82f6',
        },
        {
          data: [78, 76, 80, 75, 77, 74, 76],
          label: 'Diastolic',
          color: '#93c5fd',
        },
      ],
      xAxis: [
        {
          data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
          scaleType: 'band', // This is categorical, not time
        },
      ],
    },
  },
  'eda': {
    id: 'eda',
    name: 'Skin Conductance (EDA)',
    currentValue: '...',
    visualizationType: 'line',
    payload: {
      series: [
        {
          data: generateRandomWalk(DATA_POINTS_COUNT, 0.5, 3, 0.1),
          label: 'μS',
          showMark: false,
          area: true,
          color: '#10b981',
        },
      ],
      xAxis: [{ data: timeAxisData, scaleType: 'linear' }],
    },
  },
};

// This is the new structure that our app will use
// It maps *sensor points* to a *list of parameters*
export const mockSensorPointDatabase: Record<string, SensorPointData> = {
  'chest': {
    pointId: 'chest',
    pointName: 'Chest Sensors',
    parameters: [
      allParameters['heart-rate'],
      allParameters['breathing-rate'],
      allParameters['temperature'],
      allParameters['pulse-transit-time'], // <-- ADDED PTT HERE
      allParameters['activity'],
      allParameters['blood-pressure'], // This is mock, will show up
    ],
  },
  'hand': {
    pointId: 'hand',
    pointName: 'Hand Sensor',
    parameters: [
      allParameters['stress'], // This is real, will be fetched
      allParameters['eda'], // This is mock, will show up
    ],
  },
};

/**
 * MOCK: Gets a single parameter's data.
 * This is used by our hybrid dataService as a fallback.
 */
export const getMockParameterData = (
  paramId: string,
): SensorData | undefined => {
  return allParameters[paramId];
};

// --- Helper function for AI (copied from dataCalculator) ---
const getIndicesForTimeRange = (
  xAxisData: number[],
  startTime: number,
  endTime: number,
): [number, number] => {
  let startIndex = -1;
  let endIndex = -1;

  for (let i = 0; i < xAxisData.length; i++) {
    if (xAxisData[i] >= startTime) {
      startIndex = i;
      break;
    }
  }
  if (startIndex === -1) return [-1, -1];

  for (let i = xAxisData.length - 1; i >= startIndex; i--) {
    if (xAxisData[i] <= endTime) {
      endIndex = i;
      break;
    }
  }
  return [startIndex, endIndex];
};

/**
 * MOCK: Generates an AI summary for the overall status.
 * This function *actually* uses the time range now.
 */
export const getOverallStatusAI = async (
  allData: SensorData[],
  timeRange: number[],
): Promise<{ emoji: string; insight: string }> => {
  // Find the 'heart-rate' and 'stress' parameters
  const hrParam = allData.find((p) => p.id === 'heart-rate');
  const stressParam = allData.find((p) => p.id === 'stress');

  let avgHr = 70;
  let avgStress = 3;

  try {
    // Calculate Heart Rate Average for the time range
    if (
      hrParam &&
      hrParam.payload.xAxis &&
      hrParam.payload.series[0].data.length > 0
    ) {
      const [start, end] = getIndicesForTimeRange(
        hrParam.payload.xAxis[0].data,
        timeRange[0],
        timeRange[1],
      );
      if (start !== -1 && end !== -1) {
        const dataSlice = hrParam.payload.series[0].data.slice(start, end + 1);
        avgHr = dataSlice.reduce((a: any, b: any) => a + b, 0) / dataSlice.length;
      }
    }

    // Calculate Stress Average for the time range
    if (
      stressParam &&
      stressParam.payload.xAxis &&
      stressParam.payload.series[0].data.length > 0
    ) {
      const [start, end] = getIndicesForTimeRange(
        stressParam.payload.xAxis[0].data,
        timeRange[0],
        timeRange[1],
      );
      if (start !== -1 && end !== -1) {
        const dataSlice = stressParam.payload.series[0].data.slice(
          start,
          end + 1,
        );
        avgStress = dataSlice.reduce((a: any, b: any) => a + b, 0) / dataSlice.length;
      }
    }
  } catch (e) {
    console.error('Error calculating AI status:', e);
  }

  // --- NEW MORE SENSITIVE LOGIC ---
  if (avgHr > 95 || avgStress > 70) {
    return {
      emoji: '😥',
      insight:
        'Stress and heart rate seem high in this period. Might be a good time for a short break!',
    };
  }
  if (avgHr > 85 || avgStress > 50) {
    return {
      emoji: '😟',
      insight:
        'Slightly elevated readings. Data suggests a moment of stress or activity.',
    };
  }
  if (avgHr < 55 && avgStress < 20) {
    return {
      emoji: '😴',
      insight: 'Very low activity. Data indicates a period of deep rest or calm.',
    };
  }
  if (avgStress > 4) {
    return {
      emoji: '🤔',
      insight:
        'Data shows some fluctuations. Heart rate is normal, but stress levels are notable.',
    };
  }

  return {
    emoji: '🙂',
    insight: 'All parameters appear stable and within a normal range for this period.',
  };
};