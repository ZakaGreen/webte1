<script setup>
import { computed, ref } from 'vue';

const props = defineProps({ tasks: Array, busy: Boolean });
const emit = defineEmits(['open', 'create']);
const view = ref('month');
const currentDate = ref(new Date());

// Build the days of the selected month, week or day using local dates.
const days = computed(() => {
  const start = new Date(currentDate.value);
  start.setHours(0, 0, 0, 0);
  let count = 1;
  if (view.value === 'month') {
    start.setDate(1);
    const offset = (start.getDay() + 6) % 7;
    const monthDays = new Date(start.getFullYear(), start.getMonth() + 1, 0).getDate();
    count = Math.ceil((offset + monthDays) / 7) * 7;
    start.setDate(start.getDate() - offset);
  } else if (view.value === 'week') {
    start.setDate(start.getDate() - (start.getDay() + 6) % 7);
    count = 7;
  }
  const result = [];
  for (let i = 0; i < count; i++) {
    const day = new Date(start);
    day.setDate(start.getDate() + i);
    result.push(day);
  }
  return result;
});

// Describe the period currently displayed above the calendar.
const periodTitle = computed(() => {
  if (view.value === 'month') {
    return currentDate.value.toLocaleDateString('sk-SK', { month: 'long', year: 'numeric' });
  }
  if (view.value === 'week') {
    return days.value[0].toLocaleDateString('sk-SK') + ' – ' + days.value[6].toLocaleDateString('sk-SK');
  }
  return currentDate.value.toLocaleDateString('sk-SK', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
});

// Move backward or forward by one month, week or day.
function movePeriod(direction) {
  const date = new Date(currentDate.value);
  if (view.value === 'month') {
    date.setDate(1);
    date.setMonth(date.getMonth() + direction);
  } else {
    date.setDate(date.getDate() + direction * (view.value === 'week' ? 7 : 1));
  }
  currentDate.value = date;
}

// Return to the current date without changing the selected view.
function today() {
  currentDate.value = new Date();
}

// Select tasks whose time interval overlaps this day, including zero-length tasks.
function tasksForDay(day) {
  const nextDay = new Date(day);
  nextDay.setDate(nextDay.getDate() + 1);
  return props.tasks.filter(
    // The end at midnight belongs to the preceding day, unless start and end are equal.
    (task) => {
      const from = new Date(task.date_from);
      const to = new Date(task.date_to);
      return from < nextDay && (to > day || (from.getTime() === to.getTime() && from >= day));
    },
  ).sort(
    // Show earlier tasks before later tasks within the day.
    (a, b) => new Date(a.date_from) - new Date(b.date_from),
  );
}

// Show only the part of a task's time interval that falls within this day.
function taskTime(task, day) {
  const from = new Date(task.date_from);
  const to = new Date(task.date_to);
  const nextDay = new Date(day);
  nextDay.setDate(nextDay.getDate() + 1);
  const format = { hour: '2-digit', minute: '2-digit' };
  const start = from < day ? '00:00' : from.toLocaleTimeString('sk-SK', format);
  const end = to >= nextDay ? '24:00' : to.toLocaleTimeString('sk-SK', format);
  return start + ' – ' + end;
}

// Open the shared form with 09:00–10:00 on the selected date.
function select(day) {
  if (props.busy) return;
  const from = new Date(day);
  const to = new Date(day);
  from.setHours(9, 0, 0, 0);
  to.setHours(10, 0, 0, 0);
  emit('create', { date_from: from.toISOString(), date_to: to.toISOString() });
}
</script>

<template>
  <section class="panel calendar-panel">
    <h2>Kalendár úloh</h2>
    <p class="muted">Kliknutím na úlohu otvoríte podrobnosti. Kliknutím na dátum pridáte novú úlohu.</p>
    <div class="calendar-toolbar">
      <div class="actions">
        <button @click="movePeriod(-1)">Späť</button>
        <button @click="today">Dnes</button>
        <button @click="movePeriod(1)">Ďalej</button>
      </div>
      <h3>{{ periodTitle }}</h3>
      <div class="actions">
        <button :class="{ primary: view === 'month' }" @click="view = 'month'">Mesiac</button>
        <button :class="{ primary: view === 'week' }" @click="view = 'week'">Týždeň</button>
        <button :class="{ primary: view === 'day' }" @click="view = 'day'">Deň</button>
      </div>
    </div>
    <div class="calendar-grid" :class="view">
      <article v-for="day in days" :key="day.getTime()" class="calendar-day" :class="{ outside: view === 'month' && day.getMonth() !== currentDate.getMonth(), today: day.toDateString() === new Date().toDateString() }">
        <button class="day-label" :disabled="busy" @click="select(day)">{{ day.toLocaleDateString('sk-SK', { weekday: 'short', day: 'numeric', month: 'numeric' }) }}</button>
        <button v-for="task in tasksForDay(day)" :key="task.id" class="calendar-event" :class="{ finished: task.is_finished }" :disabled="busy" @click="emit('open', task.id)">
          <span>{{ task.is_finished ? '✓' : '○' }} {{ task.title }}</span>
          <small>{{ taskTime(task, day) }}</small>
        </button>
      </article>
    </div>
    <p class="muted calendar-note">○ Nedokončená · ✓ Dokončená. Viacdňová úloha je uvedená v každom dni, do ktorého zasahuje.</p>
  </section>
</template>
