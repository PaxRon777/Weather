let currentWeatherData = null;
lucide.createIcons();

// --- Background Animation Logic ---
const bgAnim = document.getElementById('bgAnimation');
function createCircles() {
    for (let i = 0; i < 15; i++) {
        const circle = document.createElement('div');
        circle.className = 'circle';
        const size = Math.random() * 200 + 100 + 'px';
        circle.style.width = size;
        circle.style.height = size;
        circle.style.left = Math.random() * 100 + '%';
        // Staggered delays: spread out over a 20-second window so they don't all start at once
        circle.style.animationDelay = Math.random() * 20 + 's';
        // Variable speeds: vary between 25 and 40 seconds for organic movement
        circle.style.animationDuration = (Math.random() * 15 + 25) + 's';
        bgAnim.appendChild(circle);
    }
}

function toggleBackground() {
    const isVisible = bgAnim.style.display === 'block';
    const eyeIcon = document.getElementById('eyeIcon');
    
    if (isVisible) {
        bgAnim.style.display = 'none';
        eyeIcon.setAttribute('data-lucide', 'eye-off');
    } else {
        bgAnim.style.display = 'block';
        eyeIcon.setAttribute('data-lucide', 'eye');
        if (bgAnim.children.length === 0) createCircles();
    }
    
    localStorage.setItem('bgEnabled', !isVisible);
    lucide.createIcons(); // Refresh the icon change
}

// --- Mouse Wheel Support ---
const hourlyGrid = document.getElementById('hourlyGrid');
if (hourlyGrid) {
    hourlyGrid.addEventListener('wheel', (evt) => {
        if (evt.deltaY !== 0) {
            evt.preventDefault();
            const cardWidth = hourlyGrid.firstElementChild?.offsetWidth || 110;
            hourlyGrid.scrollLeft += evt.deltaY > 0 ? -(cardWidth + 12) : (cardWidth + 12);
        }
    });
}

async function handleSearch() {
    const city = document.getElementById('cityInput').value;
    if (!city) return;

    showLoading(true);
    try {
        const data = await fetchWeatherData(encodeURIComponent(city));
        currentWeatherData = data;
        displayWeather(data);
        renderSavedTowns();
        updateUI();
    } catch (err) {
        console.error("Fetch Error:", err);
        alert("Could not find that town or the weather service is currently busy.");
    } finally {
        showLoading(false);
    }
}

async function fetchWeatherData(cityName) {
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${cityName}&count=1&language=en&format=json`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
        throw new Error("No results found");
    }

    const { latitude, longitude, name, country } = geoData.results[0];

    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,rain_sum,wind_speed_10m_max,uv_index_max&hourly=temperature_2m,rain,weather_code,wind_speed_10m,uv_index&current=temperature_2m,rain,wind_speed_10m`;
    
    const weatherRes = await fetch(weatherUrl);
    if (!weatherRes.ok) throw new Error("Weather API failed");

    const weatherData = await weatherRes.json();

    return {
        location: { name, country },
        current: {
            temperature_2m: weatherData.current?.temperature_2m ?? 0, 
            rain: weatherData.current?.rain ?? 0,
            windspeed_10m: weatherData.current?.wind_speed_10m ?? 0,
            uv_index: weatherData.daily?.uv_index_max?.[0] ?? "--"
        },
        hourly: {
            time: weatherData.hourly?.time || [],
            temp: weatherData.hourly?.temperature_2m || [],
            rain: weatherData.hourly?.rain || [],
            wind: weatherData.hourly?.wind_speed_10m || [],
            code: weatherData.hourly?.weather_code || []
        },
        daily: { 
            time: weatherData.daily?.time || [], 
            temperature_2m_max: weatherData.daily?.temperature_2m_max || [],
            temperature_2m_min: weatherData.daily?.temperature_2m_min || [],
            sunrise: weatherData.daily?.sunrise || [],
            sunset: weatherData.daily?.sunset || [],
            rain_sum: weatherData.daily?.rain_sum || [],
            weathercode: weatherData.daily?.weathercode || []
        },
        weekly: { 
            time: weatherData.daily?.time || [],
            tempMax: weatherData.daily?.temperature_2m_max || [],
            tempMin: weatherData.daily?.temperature_2m_min || [],
            rainSum: weatherData.daily?.rain_sum || [],
            weathercode: weatherData.daily?.weathercode || []
        }
    };
}

function displayWeather(data) {
    document.getElementById('emptyState').classList.add('hidden');
    document.getElementById('weatherContent').classList.remove('hidden');
    
    document.getElementById('locationName').innerText = data.location?.name ?? "Unknown";
    document.getElementById('countryName').innerHTML = `<i data-lucide="map-pin" size="16"></i> ${data.location?.country ?? "Unknown"}`;
    document.getElementById('currentTemp').innerText = `${Math.round(data.current?.temperature_2m ?? 0)}°C`;
    
    const todayRain = data.daily?.rain_sum?.[0] ?? 0;
    document.getElementById('rainAmount').innerText = Math.round(todayRain);

    document.getElementById('windSpeed').innerText = data.current?.windspeed_10m ?? 0;
    document.getElementById('uvIndex').innerText = data.current?.uv_index ?? "--";
    
    const sunriseTime = (data.daily?.sunrise?.[0]) ? data.daily.sunrise[0].split('T')[1] : "--:--";
    const sunsetTime = (data.daily?.sunset?.[0]) ? data.daily.sunset[0].split('T')[1] : "--:--";
    
    document.getElementById('sunrise').innerText = sunriseTime;
    document.getElementById('sunset').innerText = sunsetTime;

    const todayHigh = Math.round(data.daily?.temperature_2m_max?.[0] ?? 0);
    const todayLow = Math.round(data.daily?.temperature_2m_min?.[0] ?? 0);
    document.getElementById('highTemp').innerText = todayHigh;
    document.getElementById('lowTemp').innerText = todayLow;

    // Render Hourly Forecast
    const hourlyContainer = document.getElementById('hourlyGrid');
    hourlyContainer.innerHTML = '';
    
    if (data.hourly?.time && data.hourly.time.length > 0) {
        data.hourly.time.forEach((timeStr, i) => {
            const time = new Date(timeStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            const temp = Math.round(data.hourly.temp[i] ?? 0);
            const rain = data.hourly.rain[i] ?? 0;
            const wind = data.hourly.wind[i] ?? 0;
            const code = data.hourly.code[i];

            let iconName = 'cloud'; 
            if (code === 0) iconName = 'sun';
            else if (code > 50 && code < 80) iconName = 'cloud-rain';
            else if (code > 80) iconName = 'zap';

            const card = document.createElement('div');
            card.className = "min-w-[110px] bg-zinc-900 p-4 rounded-xl border border-zinc-800 text-center";
            card.innerHTML = `
                <p class="text-[10px] uppercase tracking-widest text-zinc-500">${time}</p>
                <p class="text-[9px] font-bold text-white/60 mb-1">${new Date(timeStr).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}</p>
                <div class="flex justify-center gap-2 my-2">
                    <span class="font-bold">${temp}°</span>
                    <span class="text-zinc-500 text-[10px] /</span>
                    <span class="text-zinc-500 text-[10px]">${rain}mm</span>
                </div>
                <div class="flex justify-center gap-1">
                    <i data-lucide="${iconName}" size="14" class="text-white/80"></i>
                    <span class="text-[10px] text-zinc-500">${wind}km/h</span>
                </div>
            `;
            hourlyContainer.appendChild(card);
        });
    }

    // Render Weekly Forecast
    const weeklyContainer = document.getElementById('weeklyGrid');
    weeklyContainer.innerHTML = '';
    
    if (data.weekly?.time && data.weekly.time.length > 0) {
        data.weekly.time.forEach((date, i) => {
            const dayName = new Date(date).toLocaleDateString('en-ZA', { weekday: 'short' });
            const maxT = Math.round(data.weekly.tempMax[i] ?? 0);
            const minT = Math.round(data.weekly.tempMin[i] ?? 0);
            const rainSum = Math.round(data.weekly.rainSum[i] || 0);
            const code = data.weekly.weathercode[i];
            
            let iconName = 'cloud'; 
            if (code === 0) iconName = 'sun';
            else if (code > 50 && code < 80) iconName = 'cloud-rain';
            else if (code > 80) iconName = 'zap';

            const card = document.createElement('div');
            card.className = "bg-zinc-900 p-3 rounded-xl border border-zinc-800 text-center hover:bg-zinc-800 transition-colors";
            card.innerHTML = `
                <p class="text-[10px] uppercase tracking-widest text-zinc-500">${dayName}</p>
                <div class="flex justify-center gap-2 my-2">
                    <span class="font-bold">${maxT}°</span>
                    <span class="text-zinc-500 text-xs /</span>
                    <span class="text-zinc-500 text-xs">${minT}°</span>
                </div>
                <p class="text-[10px] text-white/60 font-semibold mb-2">Rain: ${rainSum}mm</p>
                <div class="h-1 w-full bg-zinc-800 rounded overflow-hidden mt-2">
                    <div class="h-full bg-white" style="width: ${((maxT + minT) / 40 > 0 ? (maxT + minT) / 40 : 1) * 100}%"></div>
                </div>
            `;
            weeklyContainer.appendChild(card);
        });
    }
    lucide.createIcons();
}

// --- FAVORITE LOGIC ---
function toggleFavorite() {
    if (!currentWeatherData) return;
    let saved = JSON.parse(localStorage.getItem('savedTowns') || '[]');
    const name = currentWeatherData.location?.name;
    const heartIcon = document.getElementById('heartIcon');

    if (saved.includes(name)) {
        saved = saved.filter(t => t !== name);
        heartIcon.classList.remove('text-red-500', 'fill-red-500');
        heartIcon.classList.add('text-zinc-400');
    } else {
        saved.push(name);
        heartIcon.classList.add('text-red-500', 'fill-red-500');
        heartIcon.classList.remove('text-zinc-400');
    }

    localStorage.setItem('savedTowns', JSON.stringify(saved));
    renderSavedTowns();
}

function toggleDefault() {
    if (!currentWeatherData) return;
    const name = currentWeatherData.location?.name;
    const isDefault = localStorage.getItem('defaultTown') === name;
    
    if (isDefault) {
        localStorage.removeItem('defaultTown');
    } else {
        localStorage.setItem('defaultTown', name);
    }
    updateUI();
}

function updateUI() {
    const saved = JSON.parse(localStorage.getItem('savedTowns') || '[]');
    const defaultTown = localStorage.getItem('defaultTown');
    const name = currentWeatherData?.location?.name;
    const heartIcon = document.getElementById('heartIcon');
    const starIcon = document.getElementById('starIcon');
    
    if (name && saved.includes(name)) {
        heartIcon.classList.add('text-red-500', 'fill-red-500');
        heartIcon.classList.remove('text-zinc-400');
    } else {
        heartIcon.classList.remove('text-red-500', 'fill-red-500');
        heartIcon.classList.add('text-zinc-400');
    }

    if (name && name === defaultTown) {
        starIcon.classList.add('text-yellow-400', 'fill-yellow-400');
    } else {
        starIcon.classList.remove('text-yellow-400', 'fill-yellow-400');
    }

    // Background Toggle UI Update
    const bgEnabled = localStorage.getItem('bgEnabled') === 'true';
    document.getElementById('bgAnimation').style.display = bgEnabled ? 'block' : 'none';
    if (bgEnabled) createCircles();
}

function renderSavedTowns() {
    const container = document.getElementById('savedTowns');
    const saved = JSON.parse(localStorage.getItem('savedTowns') || '[]');
    container.innerHTML = '';
    saved.forEach(town => {
        const btn = document.createElement('button');
        btn.className = "bg-zinc-900 px-3 py-1 rounded-full border border-zinc-800 hover:bg-zinc-800 text-sm transition";
        btn.innerText = town;
        btn.onclick = () => {
            document.getElementById('cityInput').value = town;
            handleSearch();
        };
        container.appendChild(btn);
    });
}

function showLoading(isLoading) {
    const loader = document.getElementById('loading');
    const content = document.getElementById('weatherContent');
    if (isLoading) {
        loader.classList.remove('hidden');
        content.classList.add('hidden');
    } else {
        loader.classList.add('hidden');
        content.classList.remove('hidden');
    }
}

renderSavedTowns();

// Auto-load default town on startup
window.onload = () => {
    const defaultTown = localStorage.getItem('defaultTown');
    if (defaultTown) {
        document.getElementById('cityInput').value = defaultTown;
        handleSearch();
    }
    
    // Initialize background state
    const bgEnabled = localStorage.getItem('bgEnabled') === 'true';
    if (bgEnabled) {
        document.getElementById('bgAnimation').style.display = 'block';
        createCircles();
    } else {
        document.getElementById('eyeIcon').setAttribute('data-lucide', 'eye-off');
    }
};
