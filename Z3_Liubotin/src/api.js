const BASE_URL = 'https://wt1zadanie.iolab.sk/api/';

// All HTTP requests share the same error handling.
async function request(name, path = '', method = 'GET', data) {
  const options = { method };
  if (data !== undefined) {
    options.headers = { 'Content-Type': 'application/json' };
    options.body = JSON.stringify(data);
  }
  let response;
  try {
    response = await fetch(BASE_URL + encodeURIComponent(name) + path, options);
  } catch {
    throw new Error('Server je nedostupný. Skontrolujte pripojenie a skúste to znova.');
  }
  if (!response.ok) {
    if (response.status === 403) throw new Error('Tento identifikátor nemá povolený prístup.');
    if (response.status === 404) throw new Error('Úloha sa nenašla. Obnovte zoznam.');
    if (response.status === 422) throw new Error('Server odmietol údaje. Skontrolujte formulár.');
    throw new Error(`Požiadavka zlyhala (HTTP ${response.status}). Skúste to znova.`);
  }
  // DELETE has an empty response body.
  if (response.status === 204) return null;
  return response.json();
}

// Load all tasks belonging to the student.
export function getTasks(name) { return request(name); }
// Load the details of one task.
export function getTask(name, id) { return request(name, `/${id}`); }
// Save a new task on the server.
export function createTask(name, task) { return request(name, '', 'POST', task); }
// Replace all editable fields of an existing task.
export function updateTask(name, id, task) { return request(name, `/${id}`, 'PUT', task); }
// Remove one task from the server.
export function deleteTask(name, id) { return request(name, `/${id}`, 'DELETE'); }
// Use the done or undone endpoint to change task status.
export function setFinished(name, id, finished) {
  return request(name, `/${id}/${finished ? 'done' : 'undone'}`, 'PATCH');
}
// Replace the student list with five sample tasks.
export function resetTasks(name) { return request(name, '/reset', 'POST'); }
