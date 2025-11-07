// Import the types we need (if you don't have them, you can skip this)
// You might need to run: npm install -D @types/node
// Import the types we need (if you don't have them, you can skip this)
// You might need to run: npm install -D @types/node
import type { SensorData } from '../data/mockData'; // Assuming this type is still valid
 // Assuming this type is still valid

// 1. Get variables from Vite's import.meta.env
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const OPENAI_API_URL = import.meta.env.VITE_OPENAI_API_URL;

// Simple check to make sure you've set them
if (!OPENAI_API_KEY || !OPENAI_API_URL) {
  throw new Error(
    'Missing OpenAI environment variables. Please check your .env.local file.',
  );
}

/**
 * Generates a simple, patient-friendly overview of sensor data.
 */
export const getAiOverview = async (
  sensorName: string,
  data: SensorData['data'], // Use the data property from the SensorData type
): Promise<string> => {
  const simplifiedData = data
    .slice(0, 5)
    .map((d) => Math.round(d.value))
    .join(', ');

  const systemPrompt =
    'You are a friendly medical assistant. You explain complex data to patients in simple, reassuring, and non-alarming terms. Do not provide a diagnosis. Focus on what the data *measures*, not what it *means*.';
  const userPrompt = `My doctor is showing me a chart for "${sensorName}". The first few readings are: [${simplifiedData}]. Can you explain in one or two simple sentences what this chart is showing me?`;

  try {
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.5,
        max_tokens: 60,
      }),
    });

    if (!response.ok) {
      // Read the error message from OpenAI for better debugging
      const errorBody = await response.json();
      console.error('OpenAI API error:', errorBody);
      throw new Error(
        `OpenAI API error (${response.status}): ${
          errorBody.error?.message || response.statusText
        }`,
      );
    }

    const json = await response.json();
    const overview = json.choices[0]?.message?.content;

    return overview || 'Could not get an explanation at this time.';
  } catch (error) {
    console.error('Error fetching AI overview:', error);
    return 'We had trouble getting a simple explanation. We can discuss the chart together instead.';
  }
};