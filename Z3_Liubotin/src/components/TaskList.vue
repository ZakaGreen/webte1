<script setup>
import { computed, ref } from 'vue';
import { formatDate, isOverdue } from '../dates';

const props = defineProps({ tasks: Array, busy: Boolean });
defineEmits(['edit', 'remove', 'toggle']);
const status = ref('all');
const search = ref('');
const sort = ref('date_from');
// Recalculate the visible list after a filter or task changes.
const filteredTasks = computed(() => props.tasks.filter(
  // Match the selected status and the search text.
  (task) => {
    const matchesStatus = status.value === 'all' || task.is_finished === (status.value === 'done');
    return matchesStatus && task.title.toLocaleLowerCase('sk').includes(search.value.trim().toLocaleLowerCase('sk'));
  },
).sort(
  // Compare the selected start or end dates, earliest first.
  (a, b) => new Date(a[sort.value]) - new Date(b[sort.value]),
));
</script>

<template>
  <section class="panel">
    <div class="section-heading"><h2>Zoznam úloh</h2><span class="muted">{{ filteredTasks.length }} / {{ tasks.length }}</span></div>
    <div class="filters">
      <label>Hľadať podľa názvu<input v-model="search" type="search" placeholder="Napríklad: Projekt…"></label>
      <label>Stav<select v-model="status"><option value="all">Všetky úlohy</option><option value="undone">Nedokončené</option><option value="done">Dokončené</option></select></label>
      <label>Zoradiť podľa<select v-model="sort"><option value="date_from">Začiatku</option><option value="date_to">Konca</option></select></label>
    </div>
    <p v-if="!filteredTasks.length" class="empty">{{ tasks.length ? 'Žiadne úlohy nezodpovedajú vyhľadávaniu.' : 'Zatiaľ tu nie sú žiadne úlohy. Pridajte svoju prvú.' }}</p>
    <ul class="task-list">
      <li v-for="task in filteredTasks" :key="task.id" class="task" :class="{ finished: task.is_finished, overdue: isOverdue(task) }">
        <div class="task-content">
          <span class="badge">{{ task.is_finished ? 'Dokončená' : isOverdue(task) ? 'Po termíne' : 'Nedokončená' }}</span>
          <h3>{{ task.title }}</h3>
          <p class="task-description">{{ task.description || 'Bez popisu.' }}</p>
          <p class="muted">{{ formatDate(task.date_from) }} – {{ formatDate(task.date_to) }}</p>
        </div>
        <div class="actions task-actions">
          <button :disabled="busy" @click="$emit('toggle', task)">{{ task.is_finished ? 'Znovu otvoriť' : 'Dokončiť' }}</button>
          <button :disabled="busy" @click="$emit('edit', task)">Upraviť</button>
          <button class="danger" :disabled="busy" @click="$emit('remove', task)">Odstrániť</button>
        </div>
      </li>
    </ul>
  </section>
</template>
