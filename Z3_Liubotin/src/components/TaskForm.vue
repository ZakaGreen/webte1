<script setup>
import { ref } from 'vue';
import { toInputDate } from '../dates';

const props = defineProps({ task: Object, busy: Boolean });
const emit = defineEmits(['save', 'cancel']);
// Edit a separate copy. Cancelling never changes the displayed task.
const form = ref({
  title: props.task.title || '',
  description: props.task.description || '',
  date_from: toInputDate(props.task.date_from),
  date_to: toInputDate(props.task.date_to),
  is_finished: props.task.is_finished || false,
});
const errors = ref({});

// Validate the fields and send the task to the parent component.
function submit() {
  errors.value = {};
  if (!form.value.title.trim()) errors.value.title = 'Zadajte názov úlohy.';
  else if (form.value.title.length > 200) errors.value.title = 'Najviac 200 znakov.';
  if (form.value.description.length > 1000) errors.value.description = 'Najviac 1000 znakov.';
  const from = new Date(form.value.date_from);
  const to = new Date(form.value.date_to);
  if (!form.value.date_from || Number.isNaN(from.getTime())) errors.value.date_from = 'Zadajte platný začiatok.';
  if (!form.value.date_to || Number.isNaN(to.getTime())) errors.value.date_to = 'Zadajte platný koniec.';
  if (from > to) errors.value.date_to = 'Koniec nesmie byť pred začiatkom.';
  if (Object.keys(errors.value).length) return;
  emit('save', { ...form.value, title: form.value.title.trim(), date_from: from.toISOString(), date_to: to.toISOString() });
}
</script>

<template>
  <section class="panel form-panel">
    <div class="section-heading">
      <h2>{{ task.id ? 'Upraviť úlohu' : 'Nová úloha' }}</h2>
      <button class="quiet" :disabled="busy" @click="emit('cancel')">Zavrieť</button>
    </div>
    <form novalidate @submit.prevent="submit">
      <fieldset :disabled="busy" class="form-fields">
        <label for="title">Názov <span class="muted">(povinný)</span></label>
        <input id="title" v-model="form.title" maxlength="200">
        <span class="field-error">{{ errors.title }}</span>
        <label for="description">Popis <span class="muted">(nepovinný)</span></label>
        <textarea id="description" v-model="form.description" rows="3" maxlength="1000"></textarea>
        <span class="field-error">{{ errors.description }}</span>
        <div class="date-fields">
          <div><label for="date-from">Začiatok (povinný)</label><input id="date-from" v-model="form.date_from" type="datetime-local" step="1"><span class="field-error">{{ errors.date_from }}</span></div>
          <div><label for="date-to">Koniec (povinný)</label><input id="date-to" v-model="form.date_to" type="datetime-local" step="1"><span class="field-error">{{ errors.date_to }}</span></div>
        </div>
        <label class="check"><input v-model="form.is_finished" type="checkbox"> Dokončená úloha</label>
        <p class="muted">Dátumy a časy zadávate vo svojom miestnom čase.</p>
        <div class="actions"><button class="primary" type="submit">{{ busy ? 'Ukladám…' : 'Uložiť úlohu' }}</button><button type="button" @click="emit('cancel')">Zrušiť</button></div>
      </fieldset>
    </form>
  </section>
</template>
