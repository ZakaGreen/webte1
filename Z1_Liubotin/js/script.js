const SEMESTER_START = new Date('2026-09-14T00:00:00');
const SEMESTER_END = new Date('2026-12-13T23:59:59');
const SCHEDULE_END = new Date('2026-12-20T23:59:59');

// Enable the mobile menu; links remain visible if JavaScript is disabled.
const navigation = document.querySelector('.site-nav');
const menuButton = document.querySelector('.menu-toggle');
const navList = document.querySelector('#nav-list');

navigation.classList.add('menu-ready');
menuButton.hidden = false;

menuButton.addEventListener('click', () => {
  navList.classList.toggle('is-open');
});

const schedule = document.querySelector('#schedule');

if (schedule) {
  const lessons = schedule.querySelectorAll('td[data-start]');
  const cells = schedule.querySelectorAll('td');
  const filters = document.querySelectorAll('[data-filter]');
  const status = document.querySelector('#schedule-status');
  const progress = document.querySelector('#semester-progress');
  const progressText = document.querySelector('#semester-status');
  const filterMessage = document.querySelector('#filter-message');

  // 0 means no classes; other values select a weekday from the table.
  const dayChanges = {
    '2026-10-15': 0,
    '2026-10-27': 0,
    '2026-11-17': 0,
    '2026-11-18': 2,
    '2026-12-07': 2,
    '2026-12-08': 3,
    '2026-12-09': 4
  };

  document.querySelector('#schedule-filters').hidden = false;
  progress.hidden = false;

  filters.forEach(button => {
    button.addEventListener('click', () => {
      const filter = button.dataset.filter;
      let visibleCount = 0;

      cells.forEach(cell => {
        const visible = filter === 'all' || cell.dataset.type === filter;
        cell.classList.toggle('is-filtered', !visible);
        if (visible) visibleCount++;
      });

      filters.forEach(item => {
        item.setAttribute('aria-pressed', item === button);
      });
      document.querySelector('#schedule-scroll').hidden = visibleCount === 0;
      filterMessage.hidden = visibleCount > 0;
    });
  });

  function getSchoolDay(date) {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    if (key in dayChanges) return dayChanges[key];
    return date.getDay();
  }

  function updateSchedule() {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    let currentLesson = null;

    lessons.forEach(lesson => {
      const current = now >= SEMESTER_START && now <= SCHEDULE_END &&
        Number(lesson.parentElement.dataset.day) === getSchoolDay(now) &&
        minutes >= Number(lesson.dataset.start) && minutes < Number(lesson.dataset.end);
      lesson.classList.toggle('is-current', current);
      if (current) currentLesson = lesson;
    });

    if (currentLesson) {
      status.textContent = `Práve prebieha: ${currentLesson.querySelector('strong').textContent}.`;
    } else {
      let nextLesson = null;
      let nextTime = null;
      const day = new Date(Math.max(now.getTime(), SEMESTER_START.getTime()));
      day.setHours(0, 0, 0, 0);

      // Search calendar days, including holidays and replacement days.
      while (day <= SCHEDULE_END && !nextLesson) {
        lessons.forEach(lesson => {
          if (Number(lesson.parentElement.dataset.day) !== getSchoolDay(day)) return;
          const start = new Date(day);
          start.setMinutes(Number(lesson.dataset.start));
          if (start > now && (!nextTime || start < nextTime)) {
            nextLesson = lesson;
            nextTime = start;
          }
        });
        day.setDate(day.getDate() + 1);
      }

      if (nextLesson) {
        const date = nextTime.toLocaleDateString('sk-SK', { weekday: 'long', day: 'numeric', month: 'numeric' });
        const time = nextTime.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' });
        status.textContent = `Teraz nemám vyučovanie. Najbližšie: ${nextLesson.querySelector('strong').textContent}, ${date} o ${time}.`;
      } else {
        status.textContent = 'Teraz nemám vyučovanie. Do konca platnosti rozvrhu už nemám ďalšiu hodinu.';
      }
    }

    const percent = Math.max(0, Math.min(100, (now - SEMESTER_START) / (SEMESTER_END - SEMESTER_START) * 100));
    progress.value = percent;
    progressText.textContent = `${Math.floor(percent)} % obdobia od 14. 9. do 13. 12. 2026 uplynulo.`;
  }

  updateSchedule();
  setInterval(updateSchedule, 60000);
}

const mapElement = document.querySelector('#map');

if (mapElement && typeof L !== 'undefined') {
  const pointSelect = document.querySelector('#map-point');
  const targetSelect = document.querySelector('#map-target');
  const message = document.querySelector('#map-message');
  const distanceText = document.querySelector('#map-distance');
  const pointForm = document.querySelector('#map-add');
  const pointName = document.querySelector('#map-name');
  const storageKey = 'webte1-map-points';
  const destinations = [
    { name: 'Škola — FEI STU', coords: [48.151965, 17.072995] },
    { name: 'Domov — ŠD Mladosť', coords: [48.1589409, 17.0640966] }
  ];
  let points = [];
  const markers = [];
  let addingPoint = false;

  // Map setup follows the example from practice.
  const map = L.map('map').setView([48.151965, 17.072995], 15);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  const line = L.polyline([], { className: 'map-line' }).addTo(map);

  destinations.forEach((destination, index) => {
    destination.marker = L.marker(destination.coords, { alt: destination.name })
      .addTo(map).bindPopup(popupText(destination.name));
    markers.push(destination.marker);
    pointSelect.add(new Option(destination.name, index));
    targetSelect.add(new Option(destination.name, index));
  });
  map.fitBounds(destinations.map(destination => destination.coords), { padding: [35, 35], maxZoom: 15 });
  targetSelect.disabled = false;
  pointSelect.disabled = false;
  message.hidden = true;

  // Names are text, not HTML.
  function popupText(text) {
    const content = document.createElement('span');
    content.textContent = text;
    return content;
  }

  function addPoint(point, index) {
    markers.push(L.marker(point.coords, { alt: point.name }).addTo(map).bindPopup(popupText(point.name)));
    pointSelect.add(new Option(point.name, index + destinations.length));
  }

  // Haversine: coordinates are [latitude, longitude]; the result is in kilometres.
  function getDistance(start, end) {
    const radians = Math.PI / 180;
    const lat1 = start[0] * radians;
    const lat2 = end[0] * radians;
    const deltaLat = (end[0] - start[0]) * radians;
    const deltaLng = (end[1] - start[1]) * radians;
    const a = Math.sin(deltaLat / 2) ** 2 +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2;
    return 2 * 6371 * Math.asin(Math.sqrt(Math.min(1, a)));
  }

  function updateDistance() {
    if (pointSelect.value === '') {
      line.setLatLngs([]);
      distanceText.hidden = true;
      destinations.concat(points).forEach((point, index) => {
        markers[index].closePopup().setPopupContent(popupText(point.name));
      });
      return;
    }
    const point = destinations.concat(points)[pointSelect.value];
    const target = destinations[targetSelect.value];
    const distance = getDistance(point.coords, target.coords).toFixed(2);
    const description = `${point.name} → ${target.name}: ${distance} km vzdušnou čiarou.`;
    distanceText.textContent = description;
    distanceText.hidden = false;
    line.setLatLngs([point.coords, target.coords]);
    map.fitBounds(line.getBounds(), { padding: [40, 40], maxZoom: 15, animate: false });
    destinations.forEach(destination => {
      destination.marker.setPopupContent(popupText(destination === target ? description : destination.name));
    });
    markers[pointSelect.value].setPopupContent(popupText(description)).openPopup();
  }

  try {
    const saved = JSON.parse(localStorage.getItem(storageKey)) || [];
    points = saved.filter(point => point && typeof point.name === 'string' &&
      Array.isArray(point.coords) && point.coords.length === 2 && point.coords.every(Number.isFinite));
  } catch {
    message.textContent = 'Uložené body sa nepodarilo načítať.';
    message.hidden = false;
  }
  points.forEach(addPoint);

  pointForm.addEventListener('submit', event => {
    event.preventDefault();
    if (!pointName.value.trim()) return;
    addingPoint = true;
    message.textContent = 'Teraz kliknite na miesto na mape.';
    message.hidden = false;
  });

  map.on('click', event => {
    if (!addingPoint) return;
    const name = pointName.value.trim();
    if (!name) return;
    const position = event.latlng.wrap();
    const point = { name: name, coords: [position.lat, position.lng] };
    points.push(point);
    addPoint(point, points.length - 1);
    addingPoint = false;
    pointForm.reset();
    try {
      localStorage.setItem(storageKey, JSON.stringify(points));
      message.hidden = true;
    } catch {
      message.textContent = 'Bod je na mape, ale prehliadač nepovolil uloženie. Po obnovení stránky sa nemusí zachovať.';
      message.hidden = false;
    }
  });

  document.querySelector('#map-reset').addEventListener('click', () => {
    localStorage.removeItem(storageKey);
    window.location.reload();
  });

  pointSelect.addEventListener('change', updateDistance);
  targetSelect.addEventListener('change', updateDistance);
}
