import type { SensorData, SensorPointData } from './sensorData.types';

// --- MASTER TIME SETUP ---
const DATA_DURATION_S = 3600; // 1 hour of data
const DATA_INTERVAL_S = 5; // Data point every 5 seconds
const DATA_POINTS_COUNT = DATA_DURATION_S / DATA_INTERVAL_S + 1; // 721 points

/**
 * Generates a smooth random walk for data.
 */
const generateRandomWalk = (
  count: number,
  base: number,
  step: number,
  noise: number,
  min: number,
  max: number,
) => {
  let lastVal = base;
  const data = [];
  for (let i = 0; i < count; i++) {
    let change = (Math.random() - 0.5) * step; // General trend
    let noiseVal = (Math.random() - 0.5) * noise; // Small noise
    let newVal = lastVal + change + noiseVal;

    // Clamp values to min/max
    if (newVal > max) newVal = max - Math.abs(change);
    if (newVal < min) newVal = min + Math.abs(change);

    lastVal = newVal;
    data.push(Math.round(lastVal * 10) / 10);
  }
  return data;
};

// Generate one single timeline for all charts
const MASTER_X_AXIS_DATA = Array.from(
  { length: DATA_POINTS_COUNT },
  (_, i) => i * DATA_INTERVAL_S,
);

// This is our database of *individual parameters*
const allParameters: Record<string, SensorData> = {
  'heart-rate': {
    id: 'heart-rate',
    name: 'Heart Rate',
    currentValue: '...',
    visualizationType: 'line',
    payload: {
      series: [
        {
          data: generateRandomWalk(DATA_POINTS_COUNT, 75, 0.5, 0.2, 60, 100), // BPM
          label: 'BPM',
          showMark: false,
          area: true,
          color: '#ef4444',
        },
      ],
      xAxis: [{ data: MASTER_X_AXIS_DATA, scaleType: 'linear' }],
    },
  },
  'breathing-rate': {
    id: 'breathing-rate',
    name: 'Breathing Rate',
    currentValue: '...',
    visualizationType: 'line',
    payload: {
      series: [
        {
          data: generateRandomWalk(DATA_POINTS_COUNT, 16, 0.1, 0.1, 12, 20), // br/min
          label: 'br/min',
          showMark: false,
          area: true,
          color: '#3b82f6',
        },
      ],
      xAxis: [{ data: MASTER_X_AXIS_DATA, scaleType: 'linear' }],
    },
  },
  'temperature': {
    id: 'temperature',
    name: 'Body Temperature',
    currentValue: '...',
    visualizationType: 'area',
    payload: {
      series: [
        {
          data: generateRandomWalk(DATA_POINTS_COUNT, 36.8, 0.01, 0.05, 36.5, 37.5), // Temp
          label: '°C',
          showMark: false,
          area: true,
          color: '#f59e0b',
        },
      ],
      xAxis: [{ data: MASTER_X_AXIS_DATA, scaleType: 'linear' }],
      yAxis: [{ min: 36, max: 38 }],
    },
  },
  'activity': {
    id: 'activity',
    name: 'Activity',
    currentValue: '...',
    visualizationType: 'line',
    payload: {
      series: [
        {
          data: generateRandomWalk(DATA_POINTS_COUNT, 1.5, 0.1, 0.2, 1, 8), // MET
          label: 'MET',
          showMark: false,
          area: true,
          color: '#8b5cf6',
        },
      ],
      xAxis: [{ data: MASTER_X_AXIS_DATA, scaleType: 'linear' }],
      yAxis: [{ min: 0 }],
    },
  },
  'stress': {
    id: 'stress',
    name: 'Stress Level', // Changed from 'Stress Level'
    currentValue: '...',
    // --- THIS IS THE CRASH FIX ---
    // Changed from 'bar' to 'line'.
    visualizationType: 'line',
    payload: {
      series: [
        {
          // Data is now numerical (0-10) instead of categorical
          data: generateRandomWalk(DATA_POINTS_COUNT, 3, 0.1, 0.2, 0, 10),
          label: 'Score (0-10)',
          showMark: false,
          area: true,
          color: '#d946ef',
        },
      ],
      xAxis: [{ data: MASTER_X_AXIS_DATA, scaleType: 'linear' }],
      yAxis: [{ min: 0, max: 10 }],
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
          data: generateRandomWalk(DATA_POINTS_COUNT, 1.5, 0.01, 0.05, 0.5, 3.0), // EDA
          label: 'μS',
          showMark: false,
          area: true,
          color: '#10b981',
        },
      ],
      xAxis: [{ data: MASTER_X_AXIS_DATA, scaleType: 'linear' }],
    },
  },
};

// This is our new mock database, grouped by sensor point
const mockSensorPointDatabase: Record<string, SensorPointData> = {
  'chest': {
    pointId: 'chest',
    pointName: 'Chest Sensors',
    parameters: [
      allParameters['heart-rate'],
      allParameters['breathing-rate'],
      allParameters['temperature'],
      allParameters['activity'],
      allParameters['stress'],
    ],
  },
  'hand': {
    pointId: 'hand',
    pointName: 'Hand Sensor',
    parameters: [allParameters['eda']],
  },
};

/**
 * Fetches the *group* of sensors for a specific body point.
 */
export const getMockDataForSensorPoint = (
  sensorPointId: string,
  persona: string,
): Promise<SensorPointData> => {
  console.log(
    `Fetching MOCK data for: ${sensorPointId} for persona: ${persona}`,
  );

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const data = mockSensorPointDatabase[sensorPointId];
      if (data) {
        resolve(data);
      } else {
        reject(
          new Error(`No mock data found for sensor point: ${sensorPointId}`),
        );
      }
    }, 300);
  });
};

/**
 * NEW MOCK FUNCTION
 * Simulates an AI call to get an overall status update.
 */
export const getOverallStatusAI = (
  summaryData: any, // We'd pass the calculated summaries
  persona: string,
): Promise<{ emoji: string; insight: string }> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let emoji = '😌';
      let insight =
        'Overall, your metrics appear stable and within a healthy range for the selected period.';

      if (summaryData.stress > 7) {
        emoji = '😥';
        insight =
          'Your stress levels appear high. Your heart rate is also elevated. Other vitals are stable.';
      } else if (summaryData.heartRate > 90) {
        emoji = '😟';
        insight =
          'Your heart rate is higher than usual, but your stress and activity levels seem normal. Stay hydrated.';
      } else if (summaryData.activity > 3) {
        emoji = '🏃';
        insight =
          'You are currently active! Your heart rate and breathing are elevated, which is a normal response to exercise.';
      }

      resolve({ emoji, insight });
    }, 400); // Simulate AI network delay
  });
};