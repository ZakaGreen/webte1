<script setup>
import { computed, nextTick, onMounted, ref } from 'vue';
import * as api from './api';
import { formatDate } from './dates';
import TaskForm from './components/TaskForm.vue';
import TaskList from './components/TaskList.vue';
import TaskCalendar from './components/TaskCalendar.vue';

const name = ref('xliubotin');
const activeName = ref('');
const tasks = ref([]);
const busy = ref(false);
const error = ref('');
const message = ref('');
const view = ref('list');
const editing = ref(null);
const detail = ref(null);
const formKey = ref(0);
// Count finished tasks whenever the shared list changes.
const finishedCount = computed(() => tasks.value.filter(
  // Keep only tasks marked as finished.
  (task) => task.is_finished,
).length);

// Load the student list and handle connection errors.
async function connect() {
  if (busy.value) return;
  if (!name.value.trim() || name.value.trim().length > 100) {
    error.value = 'Zadajte identifikátor (1 až 100 znakov).';
    return;
  }
  busy.value = true;
  error.value = '';
  message.value = '';
  try {
    const data = await api.getTasks(name.value.trim());
    tasks.value = data.todos;
    activeName.value = name.value.trim();
    editing.value = null;
    detail.value = null;
    message.value = 'Úlohy boli načítané.';
  } catch (err) { error.value = err.message; }
  finally { busy.value = false; }
}

// Open a fresh form copy and focus the title field.
async function showForm(task) {
  detail.value = null;
  editing.value = task;
  formKey.value++;
  await nextTick();
  document.getElementById('title').focus();
}

// Prepare a new task with a one-hour interval or the selected date.
function newTask(interval) {
  if (tasks.value.length >= 50) {
    error.value = 'Dosiahli ste limit 50 úloh. Pred pridaním ďalšej jednu odstráňte.';
    return;
  }
  const from = new Date();
  from.setSeconds(0, 0);
  showForm({ title: '', description: '', is_finished: false,
    date_from: from.toISOString(), date_to: new Date(from.getTime() + 3600000).toISOString(), ...interval });
}

// After the server accepts a change, fetch the shared list again.
async function change(action, success, closeForm = false) {
  if (busy.value) return;
  busy.value = true;
  error.value = '';
  message.value = '';
  try {
    await action();
    if (closeForm) editing.value = null;
    detail.value = null;
    message.value = success;
    try { tasks.value = (await api.getTasks(activeName.value)).todos; }
    catch { error.value = 'Zmena bola uložená, ale zoznam sa nepodarilo obnoviť. Stlačte Obnoviť zoznam.'; }
  } catch (err) { error.value = err.message; }
  finally { busy.value = false; }
}

// Create or replace a task using all form fields.
function save(task) {
  const id = editing.value.id;
  if (!id && tasks.value.length >= 50) { error.value = 'Dosiahli ste limit 50 úloh.'; return; }
  change(
    // Choose POST for a new task or PUT for an existing task.
    () => id ? api.updateTask(activeName.value, id, task) : api.createTask(activeName.value, task), 'Úloha bola uložená.', true);
}

// Ask for confirmation before deleting a task.
function remove(task) {
  if (window.confirm(`Naozaj chcete odstrániť úlohu „${task.title}“?`)) {
    change(
      // Delete the selected task on the server.
      () => api.deleteTask(activeName.value, task.id), 'Úloha bola odstránená.');
  }
}

// Mark a task as finished or reopen it.
function toggle(task) {
  change(
    // Send the opposite completion state to the server.
    () => api.setFinished(activeName.value, task.id, !task.is_finished), task.is_finished ? 'Úloha bola znovu otvorená.' : 'Úloha bola dokončená.');
}

// Confirm replacing the current list with sample tasks.
function reset() {
  if (window.confirm('Všetky vaše aktuálne úlohy sa odstránia a nahradia piatimi ukážkovými úlohami. Pokračovať?')) {
    change(
      // Replace the server list with the five sample tasks.
      () => api.resetTasks(activeName.value), 'Ukážkové úlohy boli obnovené.', true);
  }
}

// Load one task from the server and show its details.
async function openDetail(id) {
  busy.value = true;
  error.value = '';
  try { detail.value = await api.getTask(activeName.value, id); }
  catch (err) { error.value = err.message; }
  finally { busy.value = false; }
  await nextTick();
  document.getElementById('detail-title')?.focus();
}

// Reload the shared task list without closing the form.
async function refresh() {
  busy.value = true;
  error.value = '';
  try { tasks.value = (await api.getTasks(activeName.value)).todos; message.value = 'Zoznam bol obnovený.'; }
  catch (err) { error.value = err.message; }
  finally { busy.value = false; }
}

onMounted(connect);
</script>

<template>
  <header class="site-header">
    <a class="brand" href="#"><span class="brand-icon">✓</span> Môj TODO List</a>
    <div class="header-actions">
      <span class="course-label">WEBTE1 · ZADANIE 3</span>
      <button :disabled="!!editing || busy" :class="{ active: view === 'about' }" @click="view = 'about'">O projekte</button>
    </div>
  </header>
  <main>
    <div class="intro"><p class="eyebrow">PRIESTOR PRE VAŠE PLÁNY</p><h1>Jeden deň<br>Menej chaosu</h1></div>
    <form class="connection panel" @submit.prevent="connect">
      <label for="student">Identifikátor študenta<input id="student" v-model="name" maxlength="100" :disabled="busy || !!editing" required></label>
      <button type="submit" :disabled="busy || !!editing">Načítať úlohy</button>
      <p v-if="activeName" class="muted">Zoznam: <strong>{{ activeName }}</strong></p>
    </form>
    <div class="feedback"><p v-if="busy">Pracujem…</p><p v-else-if="message" class="success">{{ message }}</p></div>
    <p v-if="error" class="error">{{ error }}</p>
    <nav class="navigation">
      <button :disabled="!!editing || busy" :class="{ active: view === 'list' }" @click="view = 'list'">Zoznam</button>
      <button :disabled="!!editing || busy" :class="{ active: view === 'calendar' }" @click="view = 'calendar'">Kalendár</button>
    </nav>
    <template v-if="activeName && view !== 'about'">
      <div class="workspace-heading"><div><h2>Vaše úlohy</h2><p class="muted">{{ tasks.length - finishedCount }} nedokončených · {{ finishedCount }} dokončených</p></div><div class="actions"><button :disabled="busy" @click="refresh">Obnoviť zoznam</button><button class="primary" :disabled="busy || !!editing || tasks.length >= 50" @click="newTask()">+ Nová úloha</button></div></div>
      <p v-if="tasks.length >= 50" class="error">Limit 50 úloh je naplnený. Novú môžete pridať po odstránení existujúcej.</p>
      <TaskForm v-if="editing" :key="formKey" :task="editing" :busy="busy" @save="save" @cancel="editing = null" />
      <section v-if="detail" class="panel detail-panel">
        <div class="section-heading"><h2 id="detail-title" tabindex="-1">{{ detail.title }}</h2><button @click="detail = null">Zavrieť podrobnosti</button></div>
        <p class="task-description">{{ detail.description || 'Bez popisu.' }}</p><p>{{ formatDate(detail.date_from) }} – {{ formatDate(detail.date_to) }}</p><p>{{ detail.is_finished ? 'Dokončená' : 'Nedokončená' }}</p>
        <div class="actions"><button :disabled="busy" @click="showForm(detail)">Upraviť</button><button :disabled="busy" @click="toggle(detail)">{{ detail.is_finished ? 'Znovu otvoriť' : 'Dokončiť' }}</button><button class="danger" :disabled="busy" @click="remove(detail)">Odstrániť</button></div>
      </section>
      <TaskList v-if="view === 'list'" :tasks="tasks" :busy="busy || !!editing" @edit="showForm" @remove="remove" @toggle="toggle" />
      <TaskCalendar v-if="view === 'calendar'" :tasks="tasks" :busy="busy || !!editing" @open="openDetail" @create="newTask" />
      <div class="reset-row"><span class="muted">Potrebujete začať odznova?</span><button class="quiet danger" :disabled="busy || !!editing" @click="reset">Obnoviť ukážkové údaje</button></div>
    </template>
    <p v-else-if="view !== 'about'" class="empty panel">Zadajte svoj povolený identifikátor a načítajte úlohy.</p>
    <section v-if="view === 'about'" class="panel about"><p class="eyebrow">O PROJEKTE</p><h2>Malý plánovač pre každý deň.</h2><p>Môj TODO List je školský projekt na správu osobných úloh. Zoznam aj kalendár používajú rovnaké údaje zo školského REST API.</p><p>Autor: Ilia Liubotin · WEBTE1, FEI STU · 2026/2027</p><p>Použité technológie: Vue 3, Vite, Fetch API, HTML a CSS. Kalendár je vytvorený vlastným JavaScriptom a Vue. Vue a Vite používajú licenciu MIT.</p><p><a href="https://vuejs.org/">Vue</a> · <a href="https://vite.dev/">Vite</a> · <a href="https://wt1zadanie.iolab.sk/docs">Dokumentácia API</a></p></section>
  </main>
  <footer><span>Môj TODO List</span><span>Ilia Liubotin · WEBTE1 · 2026</span></footer>
</template>
