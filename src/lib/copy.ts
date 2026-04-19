export type ConditionKey = 'sunny' | 'cloudy' | 'rain' | 'storm' | 'snow';
export type Personality = 'witty' | 'warm' | 'data';

const COPY_WITTY = {
  sunny: { day: "Sun's showing off. You should too.", night: "Clear skies. Go look up for once." },
  cloudy: { day: "Clouds doing their best to be interesting.", night: "Cloudy. The stars are taking the night off." },
  rain: { day: "It's raining. Bring a jacket or don't.", night: "Raining. Perfect weather to stay in and lie about why." },
  storm: { day: "Sky's throwing a tantrum. Stay in.", night: "Thunder tonight. Dramatic, but fine." },
  snow: { day: "Snow. The weather's trying its best.", night: "Snowing. Quiet. Finally." },
};

const COPY_WARM = {
  sunny: { day: "Perfect walk weather. Get out there.", night: "Clear night ahead — good stargazing." },
  cloudy: { day: "Gentle clouds. Nice and mild.", night: "Soft cloudy evening. Cozy up." },
  rain: { day: "A little rain. Grab an umbrella.", night: "Rainy night. Cozy vibes only." },
  storm: { day: "Big storm coming. Stay safe and dry.", night: "Stormy tonight. Curl up inside." },
  snow: { day: "Snow day magic. Bundle up.", night: "Snowy night. Pure magic." },
};

const COPY_DATA = {
  sunny: { day: "Clear. UV high. Excellent visibility.", night: "Clear. Visibility 10mi." },
  cloudy: { day: "Partly cloudy. Mild winds.", night: "Cloud cover 60%+. Calm overnight." },
  rain: { day: "Light rain. 60–80% chance.", night: "Light rain. Low visibility possible." },
  storm: { day: "Thunderstorm. 95% chance. Stay inside.", night: "Storm warning active. Hail possible." },
  snow: { day: "Light snow. Accumulation likely.", night: "Snow overnight. Roads may be slick." },
};

const COPY_MAP = { witty: COPY_WITTY, warm: COPY_WARM, data: COPY_DATA };

export function getCopy(personality: Personality, condition: ConditionKey, night: boolean): string {
  return COPY_MAP[personality][condition][night ? 'night' : 'day'];
}

export function weatherCodeToCondition(code: number): ConditionKey {
  if (code === 0 || code === 1) return 'sunny';
  if (code === 2 || code === 3 || code === 45 || code === 48) return 'cloudy';
  if (code >= 51 && code <= 67) return 'rain';
  if (code >= 71 && code <= 86) return 'snow';
  if (code >= 95) return 'storm';
  return 'cloudy';
}

export const CONDITION_LABELS: Record<ConditionKey, string> = {
  sunny: 'Mostly Sunny',
  cloudy: 'Partly Cloudy',
  rain: 'Light Rain',
  storm: 'Thunderstorm',
  snow: 'Light Snow',
};
