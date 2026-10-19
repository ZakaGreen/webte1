// ===== schedule.html: semester dates =====================================================

const SEMESTER_START = new Date('2026-09-14T00:00:00'); // Stores the first day of the semester.
const SEMESTER_END = new Date('2026-12-13T23:59:59'); // Stores the last day used for semester progress.
const SCHEDULE_END = new Date('2026-12-20T23:59:59'); // Stores the last day when lessons can be shown.

// ===== Shared mobile navigation ==========================================================

// Enable the mobile menu; links remain visible if JavaScript is disabled.
const navigation = document.querySelector('.site-nav'); // Finds the navigation by its class.
const menuButton = document.querySelector('.menu-toggle'); // Finds the menu button by its class.
const navList = document.querySelector('#nav-list'); // Finds the navigation list by its ID.

navigation.classList.add('menu-ready'); // Adds a class that enables the mobile menu styles.
menuButton.hidden = false; // Shows the menu button when JavaScript is available.

// Opens or closes the mobile navigation after a button click.
menuButton.addEventListener('click', () => { // Runs this function when the button is clicked.
  navList.classList.toggle('is-open'); // Adds or removes the class that opens the menu.
});

// ===== schedule.html =====================================================================

const schedule = document.querySelector('#schedule'); // Finds the schedule table by its ID.

if (schedule) { // Runs schedule code only on the page that contains the table.
  const lessons = schedule.querySelectorAll('td[data-start]'); // Finds cells that contain lesson start times.
  const cells = schedule.querySelectorAll('td'); // Finds all cells in the schedule table.
  const filters = document.querySelectorAll('[data-filter]'); // Finds all schedule filter buttons.
  const status = document.querySelector('#schedule-status'); // Finds the current or next lesson message.
  const progress = document.querySelector('#semester-progress'); // Finds the semester progress bar.
  const progressText = document.querySelector('#semester-status'); // Finds the semester progress text.
  const filterMessage = document.querySelector('#filter-message'); // Finds the empty filter message.

  // 0 means no classes; other values select a weekday from the table.
  const dayChanges = { // Stores holidays and replacement weekdays by date.
    '2026-10-15': 0, // No classes on this date.
    '2026-10-27': 0,
    '2026-11-17': 0,
    '2026-11-18': 2, // Uses the Tuesday schedule on this date.
    '2026-12-07': 2,
    '2026-12-08': 3, // Uses the Wednesday schedule on this date.
    '2026-12-09': 4 // Uses the Thursday schedule on this date.
  };

  document.querySelector('#schedule-filters').hidden = false; // Shows filters when JavaScript is available.
  progress.hidden = false; // Shows the semester progress bar.

  // Adds a click handler to every schedule filter button.
  filters.forEach(button => { // Processes each filter button.
    // Filters schedule cells after this button is clicked.
    button.addEventListener('click', () => { // Runs after a filter button click.
      const filter = button.dataset.filter; // Reads the selected filter from data-filter.
      let visibleCount = 0; // Counts cells that remain visible.

      // Shows matching cells and hides the other cells.
      cells.forEach(cell => { // Processes each table cell.
        const visible = filter === 'all' || cell.dataset.type === filter; // Checks whether this cell matches.
        cell.classList.toggle('is-filtered', !visible); // Adds the hidden style to nonmatching cells.
        if (visible) visibleCount++; // Increases the count for a visible cell.
      });

      // Marks only the selected filter button as pressed.
      filters.forEach(item => { // Processes every filter button.
        item.setAttribute('aria-pressed', item === button); // Updates the button's pressed state.
      });
      document.querySelector('#schedule-scroll').hidden = visibleCount === 0; // Hides the table when no cells match.
      filterMessage.hidden = visibleCount > 0; // Shows the empty message only when nothing matches.
    });
  });

  // Returns the weekday schedule that should be used for a date.
  function getSchoolDay(date) {
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; // Creates a YYYY-MM-DD key.
    if (key in dayChanges) return dayChanges[key]; // Returns a replacement day when one is defined.
    return date.getDay(); // Otherwise returns the normal weekday number.
  }

  // Updates the current lesson, next lesson, and semester progress.
  function updateSchedule() {
    const now = new Date(); // Reads the current date and time.
    const minutes = now.getHours() * 60 + now.getMinutes(); // Converts the current time to minutes.
    let currentLesson = null; // Starts without a detected current lesson.

    // Checks every lesson to find the one happening now.
    lessons.forEach(lesson => { // Processes each lesson cell.
      const current = now >= SEMESTER_START && now <= SCHEDULE_END && // Checks whether the schedule is active.
        Number(lesson.parentElement.dataset.day) === getSchoolDay(now) && // Checks whether the lesson is on this school day.
        minutes >= Number(lesson.dataset.start) && minutes < Number(lesson.dataset.end); // Checks date, day, and time.
      lesson.classList.toggle('is-current', current); // Highlights only a lesson that is happening now.
      if (current) currentLesson = lesson; // Stores the current lesson when found.
    });

    if (currentLesson) { // Uses this branch when a lesson is happening now.
      status.textContent = `Práve prebieha: ${currentLesson.querySelector('strong').textContent}.`; // Shows the current lesson name.
    } else { // Searches for the next lesson when none is happening now.
      let nextLesson = null; // Starts without a detected next lesson.
      let nextTime = null; // Starts without a detected next lesson time.
      const day = new Date(Math.max(now.getTime(), SEMESTER_START.getTime())); // Starts searching today or at semester start.
      day.setHours(0, 0, 0, 0); // Moves the search date to the start of its day.

      // Search calendar days, including holidays and replacement days.
      while (day <= SCHEDULE_END && !nextLesson) { // Continues until the next lesson or schedule end.
        // Checks every lesson against the calendar day being searched.
        lessons.forEach(lesson => { // Processes each lesson cell.
          if (Number(lesson.parentElement.dataset.day) !== getSchoolDay(day)) return; // Skips lessons from another weekday.
          const start = new Date(day); // Copies the calendar day for this lesson.
          start.setMinutes(Number(lesson.dataset.start)); // Adds the lesson start time to the date.
          if (start > now && (!nextTime || start < nextTime)) { // Keeps the closest future lesson.
            nextLesson = lesson; // Stores the next lesson cell.
            nextTime = start; // Stores the next lesson date and time.
          }
        });
        day.setDate(day.getDate() + 1); // Moves the search to the next calendar day.
      }

      if (nextLesson) { // Uses this branch when a future lesson was found.
        const date = nextTime.toLocaleDateString('sk-SK', { weekday: 'long', day: 'numeric', month: 'numeric' }); // Formats its Slovak date.
        const time = nextTime.toLocaleTimeString('sk-SK', { hour: '2-digit', minute: '2-digit' }); // Formats its Slovak time.
        status.textContent = `Teraz nemám vyučovanie. Najbližšie: ${nextLesson.querySelector('strong').textContent}, ${date} o ${time}.`; // Shows the next lesson details.
      } else { // Uses this branch when no future lesson was found.
        status.textContent = 'Teraz nemám vyučovanie. Do konca platnosti rozvrhu už nemám ďalšiu hodinu.'; // Explains that no future lesson remains.
      }
    }

    const percent = Math.max(0, Math.min(100, (now - SEMESTER_START) / (SEMESTER_END - SEMESTER_START) * 100)); // Calculates progress from 0 to 100.
    progress.value = percent; // Updates the progress bar value.
    progressText.textContent = `${Math.floor(percent)} % obdobia od 14. 9. do 13. 12. 2026 uplynulo.`; // Shows the rounded progress percentage.
  }

  updateSchedule(); // Updates the schedule immediately after the page loads.
  setInterval(updateSchedule, 60000); // Updates the schedule again every minute.
}

// ===== map.html ==========================================================================

const mapElement = document.querySelector('#map'); // Finds the map container by its ID.

if (mapElement && typeof L !== 'undefined') { // Runs map code only when the map and Leaflet exist.
  const pointSelect = document.querySelector('#map-point'); // Finds the starting point selector.
  const targetSelect = document.querySelector('#map-target'); // Finds the destination selector.
  const message = document.querySelector('#map-message'); // Finds the map status message.
  const distanceText = document.querySelector('#map-distance'); // Finds the distance output.
  const pointForm = document.querySelector('#map-add'); // Finds the form for adding a point.
  const pointName = document.querySelector('#map-name'); // Finds the new point name input.
  const storageKey = 'webte1-map-points'; // Stores the localStorage key used for saved points.
  const destinations = [ // Stores the two fixed map destinations.
    { name: 'Škola — FEI STU', coords: [48.151965, 17.072995] }, // Stores the school name and coordinates.
    { name: 'Domov — ŠD Mladosť', coords: [48.1589409, 17.0640966] } // Stores the home name and coordinates.
  ];
  let points = []; // Stores user-created map points.
  const markers = []; // Stores all Leaflet marker objects.
  let addingPoint = false; // Tracks when the next map click should add a point.

  // Map setup follows the example from practice.
  const map = L.map('map').setView([48.151965, 17.072995], 15); // Creates the map with its initial center and zoom.
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { // Creates the OpenStreetMap tile layer.
    maxZoom: 19, // Sets the greatest allowed map zoom.
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' // Shows the required map source credit.
  }).addTo(map); // Adds the tile layer to the map.
  const line = L.polyline([], { className: 'map-line' }).addTo(map); // Creates an empty line for the measured distance.

  // Creates markers and selector options for the fixed destinations.
  destinations.forEach((destination, index) => { // Processes each fixed destination.
    destination.marker = L.marker(destination.coords, { alt: destination.name }) // Creates its accessible marker.
      .addTo(map).bindPopup(popupText(destination.name)); // Adds the marker and its popup to the map.
    markers.push(destination.marker); // Stores the marker for later updates.
    pointSelect.add(new Option(destination.name, index)); // Adds it to the starting point selector.
    targetSelect.add(new Option(destination.name, index)); // Adds it to the destination selector.
  });
  // Fits the map around the coordinates of all fixed destinations.
  map.fitBounds(destinations.map(destination => destination.coords), { padding: [35, 35], maxZoom: 15 }); // Shows both fixed destinations.
  targetSelect.disabled = false; // Enables the destination selector.
  pointSelect.disabled = false; // Enables the starting point selector.
  message.hidden = true; // Hides the loading message after setup.

  // Names are text, not HTML.
  // Creates safe text content for a map popup.
  function popupText(text) {
    const content = document.createElement('span'); // Creates a span for the popup content.
    content.textContent = text; // Inserts the value as plain text.
    return content; // Returns the safe popup element.
  }

  // Adds a user-created point to the map and starting point selector.
  function addPoint(point, index) {
    markers.push(L.marker(point.coords, { alt: point.name }).addTo(map).bindPopup(popupText(point.name))); // Creates and stores its marker.
    pointSelect.add(new Option(point.name, index + destinations.length)); // Adds it after the fixed destinations.
  }

  // Haversine: coordinates are [latitude, longitude]; the result is in kilometres.
  // Calculates the direct distance between two geographic coordinates.
  function getDistance(start, end) {
    const radians = Math.PI / 180; // Creates the degree-to-radian conversion value.
    const lat1 = start[0] * radians; // Converts the starting latitude to radians.
    const lat2 = end[0] * radians; // Converts the ending latitude to radians.
    const deltaLat = (end[0] - start[0]) * radians; // Calculates the latitude difference.
    const deltaLng = (end[1] - start[1]) * radians; // Calculates the longitude difference.
    const a = Math.sin(deltaLat / 2) ** 2 + // Starts the Haversine value with latitude.
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(deltaLng / 2) ** 2; // Calculates the Haversine value.
    return 2 * 6371 * Math.asin(Math.sqrt(Math.min(1, a))); // Returns the distance in kilometres.
  }

  // Updates the line, map view, popups, and text for the selected points.
  function updateDistance() {
    if (pointSelect.value === '') { // Handles the state with no selected starting point.
      line.setLatLngs([]); // Removes the distance line from the map.
      distanceText.hidden = true; // Hides the distance text.
      // Restores the normal popup text for every point.
      destinations.concat(points).forEach((point, index) => { // Processes fixed and saved points.
        markers[index].closePopup().setPopupContent(popupText(point.name)); // Closes and resets its popup.
      });
      return; // Stops the function because no distance can be calculated.
    }
    const point = destinations.concat(points)[pointSelect.value]; // Gets the selected starting point.
    const target = destinations[targetSelect.value]; // Gets the selected fixed destination.
    const distance = getDistance(point.coords, target.coords).toFixed(2); // Calculates and rounds the distance.
    const description = `${point.name} → ${target.name}: ${distance} km vzdušnou čiarou.`; // Builds the Slovak result text.
    distanceText.textContent = description; // Places the result on the page.
    distanceText.hidden = false; // Shows the distance result.
    line.setLatLngs([point.coords, target.coords]); // Draws a line between the selected points.
    map.fitBounds(line.getBounds(), { padding: [40, 40], maxZoom: 15, animate: false }); // Fits the line inside the map view.
    // Updates popup content for the fixed destinations.
    destinations.forEach(destination => { // Processes each fixed destination.
      destination.marker.setPopupContent(popupText(destination === target ? description : destination.name)); // Shows the result on the target popup.
    });
    markers[pointSelect.value].setPopupContent(popupText(description)).openPopup(); // Shows the result on the starting marker.
  }

  try { // Attempts to load user-created points from the browser.
    const saved = JSON.parse(localStorage.getItem(storageKey)) || []; // Reads saved JSON or uses an empty array.
    // Keeps only saved points with a valid name and two numeric coordinates.
    points = saved.filter(point => point && typeof point.name === 'string' && // Checks the point object and its name.
      Array.isArray(point.coords) && point.coords.length === 2 && point.coords.every(Number.isFinite)); // Validates each saved point.
  } catch { // Handles invalid or unavailable saved data.
    message.textContent = 'Uložené body sa nepodarilo načítať.'; // Shows an error when saved data cannot be read.
    message.hidden = false; // Makes the loading error visible.
  }
  points.forEach(addPoint); // Adds every valid saved point to the map.

  // Prepares the map to add a named point after the form is submitted.
  pointForm.addEventListener('submit', event => { // Runs when the add-point form is submitted.
    event.preventDefault(); // Stops the form from reloading the page.
    if (!pointName.value.trim()) return; // Stops when the point name is empty.
    addingPoint = true; // Makes the next map click create a point.
    message.textContent = 'Teraz kliknite na miesto na mape.'; // Asks the user to choose a map position.
    message.hidden = false; // Shows the instruction message.
  });

  // Creates and saves a point when the map is clicked in add-point mode.
  map.on('click', event => { // Runs after a click on the map.
    if (!addingPoint) return; // Ignores clicks when point creation is inactive.
    const name = pointName.value.trim(); // Reads and trims the entered point name.
    if (!name) return; // Stops when the name is empty.
    const position = event.latlng.wrap(); // Reads normalized coordinates from the click.
    const point = { name: name, coords: [position.lat, position.lng] }; // Creates the new point object.
    points.push(point); // Adds the point to the saved point array.
    addPoint(point, points.length - 1); // Adds the point marker and selector option.
    addingPoint = false; // Ends add-point mode.
    pointForm.reset(); // Clears the form input.
    try { // Attempts to save the updated point array.
      localStorage.setItem(storageKey, JSON.stringify(points)); // Saves points as JSON in the browser.
      message.hidden = true; // Hides the instruction after a successful save.
    } catch { // Handles browsers that block localStorage saving.
      message.textContent = 'Bod je na mape, ale prehliadač nepovolil uloženie. Po obnovení stránky sa nemusí zachovať.'; // Explains that saving failed.
      message.hidden = false; // Shows the saving error.
    }
  });

  // Removes saved points and reloads the map after a reset click.
  document.querySelector('#map-reset').addEventListener('click', () => { // Runs when the reset button is clicked.
    localStorage.removeItem(storageKey); // Deletes saved map points from the browser.
    window.location.reload(); // Reloads the page to reset the map.
  });

  pointSelect.addEventListener('change', updateDistance); // Recalculates after the starting point changes.
  targetSelect.addEventListener('change', updateDistance); // Recalculates after the destination changes.
}
