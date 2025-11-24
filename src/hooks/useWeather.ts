'use client'

import { useState, useEffect } from 'react'

interface WeatherData {
  temp: number
  description: string
  icon: string
  city: string
}

interface UseWeatherResult {
  weather: WeatherData | null
  loading: boolean
  error: string | null
}

// Map OpenWeatherMap icon codes to emojis
const weatherEmojis: Record<string, string> = {
  '01d': '☀️', // clear sky day
  '01n': '🌙', // clear sky night
  '02d': '⛅', // few clouds day
  '02n': '☁️', // few clouds night
  '03d': '☁️', // scattered clouds
  '03n': '☁️',
  '04d': '☁️', // broken clouds
  '04n': '☁️',
  '09d': '🌧️', // shower rain
  '09n': '🌧️',
  '10d': '🌦️', // rain day
  '10n': '🌧️', // rain night
  '11d': '⛈️', // thunderstorm
  '11n': '⛈️',
  '13d': '🌨️', // snow
  '13n': '🌨️',
  '50d': '🌫️', // mist
  '50n': '🌫️',
}

// County seats for fallback when city is not provided
const countySeats: Record<string, string> = {
  // North Texas
  'collin': 'McKinney',
  'dallas': 'Dallas',
  'denton': 'Denton',
  'grayson': 'Sherman',
  'hunt': 'Greenville',
  'jack': 'Jacksboro',
  'kaufman': 'Kaufman',
  'parker': 'Weatherford',
  'rockwall': 'Rockwall',
  'tarrant': 'Fort Worth',
  'wise': 'Decatur',
  // Central Texas
  'bastrop': 'Bastrop',
  'blanco': 'Johnson City',
  'burnet': 'Burnet',
  'caldwell': 'Lockhart',
  'hays': 'San Marcos',
  'lee': 'Giddings',
  'travis': 'Austin',
  'williamson': 'Georgetown',
  // San Antonio Area
  'atascosa': 'Jourdanton',
  'bandera': 'Bandera',
  'bexar': 'San Antonio',
  'comal': 'New Braunfels',
  'guadalupe': 'Seguin',
  'kendall': 'Boerne',
  'medina': 'Hondo',
  'wilson': 'Floresville',
  // Houston Area
  'austin-county': 'Bellville',
  'brazoria': 'Angleton',
  'chambers': 'Anahuac',
  'fort-bend': 'Richmond',
  'galveston': 'Galveston',
  'harris': 'Houston',
  'liberty': 'Liberty',
  'montgomery': 'Conroe',
  'waller': 'Hempstead',
  // Other
  'bell': 'Belton',
  'brazos': 'Bryan',
  'burleson': 'Caldwell',
  'grimes': 'Anderson',
  'mclennan': 'Waco',
}

export function useWeather(city?: string, county?: string): UseWeatherResult {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchWeather = async () => {
      const apiKey = process.env.NEXT_PUBLIC_OPENWEATHER_API_KEY

      if (!apiKey) {
        setError('Weather API key not configured')
        setLoading(false)
        return
      }

      // Determine location: use city if provided, otherwise fall back to county seat
      let location = city?.trim()
      if (!location && county) {
        location = countySeats[county.toLowerCase()]
      }
      if (!location) {
        location = 'Dallas' // Ultimate fallback
      }

      try {
        const response = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(location)},TX,US&units=imperial&appid=${apiKey}`
        )

        if (!response.ok) {
          throw new Error('Weather data unavailable')
        }

        const data = await response.json()

        setWeather({
          temp: Math.round(data.main.temp),
          description: data.weather[0].main,
          icon: weatherEmojis[data.weather[0].icon] || '🌡️',
          city: data.name,
        })
        setError(null)
      } catch (err) {
        console.error('Weather fetch error:', err)
        setError('Could not load weather')
      } finally {
        setLoading(false)
      }
    }

    fetchWeather()

    // Refresh weather every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000)
    return () => clearInterval(interval)
  }, [city, county])

  return { weather, loading, error }
}
