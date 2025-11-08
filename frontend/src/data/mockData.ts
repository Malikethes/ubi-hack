import type { SensorData } from './sensorData.types'; // <-- FIX: import type

// --- MASTER TIME SETUP ---
const DATA_DURATION_S = 3600; // 1 hour of data
const DATA_INTERVAL_S = 5; // Data point every 5 seconds
const DATA_POINTS_COUNT = DATA_DURATION_S / DATA_INTERVAL_S + 1; // 721 points

/**
 * Generates a smooth random walk for data.
 */
const generateRandomWalk = (
  count: number,
  min: number,
  max: number,
  initialValue?: number,
): number[] => {
  let val = initialValue !== undefined ? initialValue : (min + max) / 2;
  const data: number[] = [];
  for (let i = 0; i < count; i++) {
    val += (Math.random() - 0.5) * (max - min) * 0.05; // Small random steps
    val = Math.max(min, Math.min(max, val)); // Clamp within min/max
    data.push(Math.round(val * 10) / 10); // Push rounded value
  }
  return data;
};

// Generate time axis (0, 5, 10, ... 3600)
const timeAxis = Array.from(
  { length: DATA_POINTS_COUNT },
  (_, i) => i * DATA_INTERVAL_S,
);

// This is our database of *individual parameters*
const allParameters: Record<string, SensorData> = {
  'heart-rate': {
    id: 'heart-rate',
    name: 'Heart Rate',
    currentValue: '...', // This value is calculated in StatusPanel
    visualizationType: 'line',
    payload: {
      series: [
        {
          data: generateRandomWalk(DATA_POINTS_COUNT, 60, 90, 70),
          label: 'BPM',
          showMark: false,
          area: true,
          color: '#ef4444',
        },
      ],
      xAxis: [{ data: timeAxis, scaleType: 'linear' }],
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
          data: generateRandomWalk(DATA_POINTS_COUNT, 36.5, 37.2, 36.8),
          label: '°C',
          showMark: false,
          area: true,
          color: '#f59e0b',
        },
      ],
      xAxis: [{ data: timeAxis, scaleType: 'linear' }],
      yAxis: [{ min: 36, max: 38 }],
    },
  },
  'blood-pressure': {
    id: 'blood-pressure',
    name: 'Blood Pressure',
    currentValue: '...',
    visualizationType: 'bar', // This is a CATEGORICAL chart
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
          scaleType: 'band', // <-- This is a 'band' (categorical) scale
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
          data: generateRandomWalk(DATA_POINTS_COUNT, 0.5, 5, 1.2),
          label: 'μS',
          showMark: false,
          area: true,
          color: '#10b981',
        },
      ],
      xAxis: [{ data: timeAxis, scaleType: 'linear' }],
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
          data: generateRandomWalk(DATA_POINTS_COUNT, 12, 18, 15),
          label: 'br/min',
          showMark: false,
          area: true,
          color: '#06b6d4',
        },
      ],
      xAxis: [{ data: timeAxis, scaleType: 'linear' }],
    },
  },
  'stress': {
    id: 'stress',
    name: 'Stress Score',
    currentValue: '...',
    visualizationType: 'line', // <-- CHANGED from 'bar' to 'line'
    payload: {
      series: [
        {
          data: generateRandomWalk(DATA_POINTS_COUNT, 1, 8, 3), // Numerical score 1-10
          label: 'Score (1-10)',
          showMark: false,
          area: true,
          color: '#8b5cf6',
        },
      ],
      xAxis: [{ data: timeAxis, scaleType: 'linear' }], // <-- Now a linear time axis
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
          data: generateRandomWalk(DATA_POINTS_COUNT, 0, 5, 1),
          label: 'Movement',
          showMark: false,
          area: true,
          color: '#f97316',
        },
      ],
      xAxis: [{ data: timeAxis, scaleType: 'linear' }],
    },
  },
};

// This is the new structure that our app will use
export interface SensorPointData {
  pointId: string; // 'chest' or 'hand'
  pointName: string; // 'Chest Sensors' or 'Hand Sensor'
  parameters: SensorData[]; // A list of all available parameters for that point
}

// This is our new mock database, grouped by sensor point
const mockSensorPointDatabase: Record<string, SensorPointData> = {
  'chest': {
    pointId: 'chest',
    pointName: 'Chest Sensors',
    parameters: [
      allParameters['heart-rate'],
      allParameters['temperature'],
      allParameters['breathing-rate'],
      allParameters['blood-pressure'], // This is the categorical chart
      allParameters['activity'],
    ],
  },
  'hand': {
    pointId: 'hand',
    pointName: 'Hand Sensor',
    parameters: [allParameters['eda'], allParameters['stress']],
  },
};

/**
 * NEW Function: Fetches the *group* of sensors for a specific body point.
 *
 * @param sensorPointId The ID of the point clicked (e.g., "chest", "hand")
 * @param persona The selected dataset (e.g., "S2")
 * @returns A Promise that resolves to the SensorPointData
 */
export const getMockDataForSensorPoint = (
  sensorPointId: string,
  persona: string,
): Promise<SensorPointData> => {
  console.log(
    `Fetching MOCK data for: ${sensorPointId} for dataset: ${persona}`,
  );

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const data = mockSensorPointDatabase[sensorPointId];
      if (data) {
        // In a real app, you would use `persona` (e.g., 'S2') to fetch
        // different data from the backend. Here we just return the same mock.
        resolve(data);
      } else {
        reject(
          new Error(`No mock data found for sensor point: ${sensorPointId}`),
        );
      }
    }, 300); // Simulate network delay
  });
};

/**
 * MOCK AI: Generates an overall status emoji and insight.
 * --- THIS IS THE FIX ---
 * The signature is now (SensorData[], number[]) to match App.tsx
 */
export const getOverallStatusAI = async (
  allData: SensorData[],
  timeRange: number[],
): Promise<{ emoji: string; insight: string }> => {
  // Simulate AI thinking
  await new Promise((res) => setTimeout(res, 250));

  // Find the 'stress' and 'heart-rate' params to make a decision
  const stressParam = allData.find((p) => p.id === 'stress');
  const hrParam = allData.find((p) => p.id === 'heart-rate');
  const [startTime, endTime] = timeRange;

  let avgStress = 5; // Default
  let avgHr = 75; // Default

  // Simple (and crude) calculation for demo
  if (stressParam) {
    const data = stressParam.payload.series[0].data;
    avgStress = data[Math.floor(data.length / 2)] || 5;
  }
  if (hrParam) {
    const data = hrParam.payload.series[0].data;
    avgHr = data[Math.floor(data.length / 2)] || 75;
  }

  const timeString = `around ${Math.floor(startTime / 60)}m-${Math.floor(
    endTime / 60,
  )}m`;

  if (avgStress > 7 && avgHr > 85) {
    return {
      emoji: '😟',
      insight: `AI Insight: High stress (avg. ${avgStress.toFixed(
        1,
      )}) and high heart rate (avg. ${avgHr.toFixed(
        0,
      )} bpm) detected in the selected period (${timeString}). Consider taking a short break.`,
    };
  }
  if (avgStress > 7) {
    return {
      emoji: '🤔',
      insight: `AI Insight: Stress levels appear elevated (avg. ${avgStress.toFixed(
        1,
      )}) ${timeString}, but heart rate is normal.`,
    };
  }
  return {
    emoji: '🙂',
    insight: `AI Insight: All parameters appear stable and within normal ranges for the selected period (${timeString}).`,
  };
};