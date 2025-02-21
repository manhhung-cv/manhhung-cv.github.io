document.addEventListener('DOMContentLoaded', () => {
  const welcomeDiv = document.getElementById('welcome');
  const quoteDiv = document.getElementById('quote');
  const toggleButton = document.getElementById('toggleQuote');
  const quoteSelector = document.getElementById('quoteSelector');
  const refreshBibleButton = document.getElementById('refreshBibleVerse'); // Nút mới

  function updateGreeting() {
    const hours = new Date().getHours();
    const greetings = [
      "Chúc ngủ ngon", // 0 - 4
      "Chào buổi sáng", // 5 - 10
      "Chào buổi trưa", // 11 - 16
      "Chào buổi chiều", // 17 - 20
      "Chào buổi tối"  // 21 - 23
    ];
    welcomeDiv.textContent =
      hours < 5 ? greetings[0] :
      hours < 11 ? greetings[1] :
      hours < 17 ? greetings[2] :
      hours < 21 ? greetings[3] : greetings[4];
  }

  function getCurrentDate() {
    return new Date().toISOString().split('T')[0]; // Lấy ngày hiện tại dưới dạng YYYY-MM-DD
  }

  function fetchBibleVerse(forceUpdate = false) {
  const storedVerse = localStorage.getItem('bibleVerse');
  const storedDate = localStorage.getItem('bibleDate');

  if (storedVerse && storedDate === getCurrentDate() && !forceUpdate) {
    quoteDiv.innerHTML = storedVerse;
    return;
  }

  fetch('https://api.allorigins.win/get?url=https://loichuahomnay.vn')
    .then(response => response.ok ? response.text() : Promise.reject(response.statusText))
    .then(html => {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = html;
      const content = tempDiv.querySelector('span[style*="color:#b30101"]');
      if (content) {
        let cleanText = content.outerHTML
          .replace(/\\r\\n/g, '') // Loại bỏ \r\n
          .replace(/<br>/g, '<br>'); // Đảm bảo ngắt dòng bằng thẻ <br>

        localStorage.setItem('bibleVerse', cleanText);
        localStorage.setItem('bibleDate', getCurrentDate());
        quoteDiv.innerHTML = cleanText;
      } else {
        quoteDiv.textContent = 'Không tìm thấy nội dung mong muốn.';
      }
    })
    .catch(error => {
      console.error('Lỗi khi lấy dữ liệu:', error);
      quoteDiv.textContent = 'Có lỗi xảy ra khi lấy dữ liệu.';
    });
}


  function fetchQuote() {
    fetch('./quote.json')
      .then(response => response.ok ? response.json() : Promise.reject(response.statusText))
      .then(data => {
        if (data.quotes && Array.isArray(data.quotes) && data.quotes.length) {
          const randomQuote = data.quotes[Math.floor(Math.random() * data.quotes.length)];
          quoteDiv.textContent = randomQuote;
        } else {
          throw new Error('Dữ liệu không hợp lệ');
        }
      })
      .catch(error => {
        console.error('Lỗi khi lấy châm ngôn:', error);
        quoteDiv.textContent = 'Có lỗi xảy ra khi lấy châm ngôn.';
      });
  }

  function loadUserPreferences() {
    const savedQuoteType = localStorage.getItem('quoteType') || 'bible';
    const savedDisplayState = localStorage.getItem('quoteDisplay') || 'block';

    quoteSelector.value = savedQuoteType;
    quoteDiv.style.display = savedDisplayState;

    if (savedQuoteType === 'bible') {
      fetchBibleVerse();
    } else {
      fetchQuote();
    }
  }

  toggleButton.addEventListener('click', () => {
    const newState = quoteDiv.style.display === 'none' ? 'block' : 'none';
    quoteDiv.style.display = newState;
    localStorage.setItem('quoteDisplay', newState);
  });

  quoteSelector.addEventListener('change', () => {
    const selectedValue = quoteSelector.value;
    localStorage.setItem('quoteType', selectedValue);
    (selectedValue === 'bible' ? fetchBibleVerse : fetchQuote)();
  });

  refreshBibleButton.addEventListener('click', () => {
    fetchBibleVerse(true); // Gọi hàm với tham số forceUpdate là true
  });

  // Khởi chạy khi tải trang
  updateGreeting();
  loadUserPreferences();
});




// WEATHER
const apiKey = 'KZH7P9GUL9SBMVQ5MV4WDF23L'; // Thay thế bằng API Key của bạn

function getWeatherAuto() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        localStorage.setItem('location', `${lat},${lon}`);
        fetchWeather(lat, lon);
      },
      () => {
        // Nếu không thể lấy vị trí, sử dụng IP để lấy thời tiết
        getWeatherByIP();
      }
    );
  } else {
    // Nếu trình duyệt không hỗ trợ định vị, sử dụng IP để lấy thời tiết
    getWeatherByIP();
  }
}

// Bảng ánh xạ từ hướng gió quốc tế sang thuần Việt
const windDirectionMap = {
  'N': 'Bắc',
  'NNE': 'Bắc Đông Bắc',
  'NE': 'Đông Bắc',
  'ENE': 'Đông Bắc Đông',
  'E': 'Đông',
  'ESE': 'Đông Đông Nam',
  'SE': 'Đông Nam',
  'SSE': 'Nam Đông Nam',
  'S': 'Nam',
  'SSW': 'Nam Tây Nam',
  'SW': 'Tây Nam',
  'WSW': 'Tây Tây Nam',
  'W': 'Tây',
  'WNW': 'Tây Bắc Tây',
  'NW': 'Tây Bắc',
  'NNW': 'Bắc Tây Bắc'
};

// Bảng ánh xạ mã điều kiện thời tiết sang mô tả tiếng Việt
const weatherConditionMap = {
  'clear-day': 'Trời quang đãng',
  'clear-night': 'Trời quang đãng',
  'partly-cloudy-day': 'Có mây',
  'partly-cloudy-night': 'Có mây',
  'cloudy': 'Trời nhiều mây',
  'rain': 'Mưa rào',
  'sleet': 'Mưa tuyết',
  'snow': 'Tuyết rơi',
  'wind': 'Gió',
  'fog': 'Sương mù',
  'hail': 'Mưa đá',
  'thunderstorm': 'Bão tố'
};

async function fetchWeather(latitude, longitude) {
  const response = await fetch(`https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${latitude},${longitude}?unitGroup=metric&key=${apiKey}&contentType=json`);
  const data = await response.json();

  // Xử lý thông tin điều kiện thời tiết
  const currentConditions = data.currentConditions;
  const conditionCode = currentConditions.icon;
  const conditionText = weatherConditionMap[conditionCode] || currentConditions.conditions;
  const conditionIcon = `https://chesino.github.io/DATA/Weather/${conditionCode}.svg`;


  document.getElementById('temperature').innerHTML = `${currentConditions.temp.toFixed(0)}°`;
  document.getElementById('rain_chance').innerHTML = `${currentConditions.precip !== null ? currentConditions.precip.toFixed(1) : 0} mm`;
  document.getElementById('uv_index').innerHTML = `${currentConditions.uvindex}`;

  // Chuyển đổi gió hướng sang định dạng thuần Việt
  const windDir = currentConditions.winddir; // Độ gió
  const windSpeed = currentConditions.windspeed; // Tốc độ gió

  // Hàm xác định tên hướng gió dựa trên độ
  function getWindDirectionName(degree) {
    if (degree >= 337.5 || degree < 22.5) return 'Bắc';
    if (degree >= 22.5 && degree < 67.5) return 'Đông-Bắc';
    if (degree >= 67.5 && degree < 112.5) return 'Đông';
    if (degree >= 112.5 && degree < 157.5) return 'Đông-Nam';
    if (degree >= 157.5 && degree < 202.5) return 'Nam';
    if (degree >= 202.5 && degree < 247.5) return 'Tây-Nam';
    if (degree >= 247.5 && degree < 292.5) return 'Tây';
    if (degree >= 292.5 && degree < 337.5) return 'Tây-Bắc';
    return 'Không xác định';
  }

  const windDirection = getWindDirectionName(windDir); // Tên hướng gió
  document.getElementById('wind_direction').innerHTML = `${windDirection} [${windDir}°]`;
  document.getElementById('wind_speed').innerHTML = `${windSpeed.toFixed(1)} km/h`;

  reverseGeocodeNominatim(latitude, longitude).then(({ address, addressFull }) => {
    // Cập nhật nội dung trên giao diện người dùng
    document.getElementById('location').innerHTML = addressFull;
    document.getElementById('weather').innerHTML = `<p>${address} <i class="fa-solid fa-location-arrow" aria-hidden="true"></i></p>`;
  }).catch(error => {
    console.error('Lỗi khi lấy địa điểm:', error);
  });

  // Hiển thị thông tin điều kiện thời tiết
  document.getElementById('condition').innerHTML = `<h5>${conditionText}</h5>
  `;

  // Hiển thị cảnh báo UV nếu chỉ số UV cao
  const uvIndex = currentConditions.uvindex;
  const uvWarningDiv = document.getElementById('uv_warning');
  let uvWarningMessage = '';
  let uvWarningColor = '';

  if (uvIndex <= 2) {
    uvWarningMessage = 'UV Thấp: Thích hợp tắm nắng';
    uvWarningColor = '#8fc900';
  } else if (uvIndex <= 5) {
    uvWarningMessage = 'UV Trung Bình: Cần che da';
    uvWarningColor = '#fb0';
  } else if (uvIndex <= 7) {
    uvWarningMessage = 'UV Cao: Hạn chế ra ngoài trời';
    uvWarningColor = '#ff8a00';
  } else if (uvIndex <= 10) {
    uvWarningMessage = 'UV Rất cao: Không nên ra ngoài trời';
    uvWarningColor = '#ff3d00';
  } else {
    uvWarningMessage = 'UV Gắt: Rất có hại';
    uvWarningColor = 'purple';
  }

  if (uvWarningMessage) {
    uvWarningDiv.style.display = 'block';
    uvWarningDiv.style.color = uvWarningColor;
    uvWarningDiv.innerHTML = uvWarningMessage;
  } else {
    uvWarningDiv.style.display = 'none';
  }
}

async function reverseGeocodeNominatim(latitude, longitude) {
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
    const data = await response.json();
    // Khởi tạo giá trị mặc định cho address và addressFull
    let address = '';
    let addressFull = '';

    if (data.address) {
      if (data.address.village !== undefined) {
        const originalSuburb = data.address.village || ''; // Đảm bảo có giá trị mặc định
        const formattedSuburb = originalSuburb.replace(/^Xã\s/, 'X.');
        address = formattedSuburb;
      } else if (data.address.quarter !== undefined) {
        address = data.address.quarter;
      } else {
        const originalSuburb = data.address.suburb || ''; // Đảm bảo có giá trị mặc định
        const formattedSuburb = originalSuburb.replace(/^Phường\s/, 'P.');
        address = formattedSuburb;
      }
      addressFull = data.display_name;

    } else {
      throw new Error('Không thể tìm thấy địa điểm.');
    }

    return {
      address: address.trim(),
      addressFull: addressFull.trim()
    };
  } catch (error) {
    console.error('Lỗi khi tìm địa điểm:', error);
    throw error; // Ném lỗi để xử lý ở nơi gọi hàm
  }
}

async function getWeatherByIP() {
  try {
    const ipResponse = await fetch('https://ipinfo.io/json?token=8c35ace05458e6');
    const ipData = await ipResponse.json();

    document.getElementById('ip').innerText = `IP: ${ipData.ip}`;
    document.getElementById('organization').innerText = `Nhà mạng: ${ipData.org}`;

    if (ipData.loc) {
      const [latitude, longitude] = ipData.loc.split(',');
      fetchWeather(latitude, longitude);
    } else {
      console.error('Không tìm thấy thông tin tọa độ từ IP.');
    }
  } catch (error) {
    console.error('Lỗi khi lấy thông tin từ IP:', error);
  }
}

function getWeatherByGeolocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async position => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      fetchWeather(lat, lon);
    }, error => {
      console.error('Lỗi khi lấy thông tin định vị:', error);
    });
  } else {
    alert('Trình duyệt của bạn không hỗ trợ định vị địa lý.');
  }
}

async function geocodeAddress(address) {
  const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`);
  const data = await response.json();

  if (data.length > 0) {
    const location = data[0];
    return {
      latitude: location.lat,
      longitude: location.lon
    };

  } else {
    throw new Error('Không tìm thấy địa điểm.');
  }

}

async function getWeatherByManual() {
  const manualLocation = document.getElementById('manualLocation').value;
  if (manualLocation) {
    try {
      const { latitude, longitude } = await geocodeAddress(manualLocation);
      fetchWeather(latitude, longitude);
    } catch (error) {
      alert(error.message);
    }
  } else {
    Info('Vui lòng nhập địa điểm.');
  }
}