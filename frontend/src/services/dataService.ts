import type { SensorData } from '../data/mockData';

const PYTHON_BACKEND_URL =
  import.meta.env.VITE_PYTHON_BACKEND_URL || 'http://localhost:8000/api';

export const fetchDataForSensor = async (
  sensorId: string,
  persona: string, // <-- Added persona parameter
): Promise<SensorData> => {
  console.log(`Fetching REAL data for: ${sensorId} for persona: ${persona}`);

  // Now, the endpoint can include the persona
  // Example: http://localhost:8000/api/sensor/heartRate?persona=General
  const endpoint = `${PYTHON_BACKEND_URL}/sensor/${sensorId}?persona=${persona}`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Network error: ${response.status} ${response.statusText}`);
    }

    const data: SensorData = await response.json();

    if (!data || !data.id || !data.data) {
      console.error('Received invalid data format from backend:', data);
      throw new Error('Received invalid data format from backend.');
    }

    const processedData = {
      ...data,
      data: data.data.map((point) => ({
        value: Number(point.value),
        time: new Date(point.time).getTime(),
      })),
    };

    return processedData;
  } catch (error) {
    console.error(`Failed to fetch sensor data for "${sensorId}":`, error);
    throw error;
  }
};