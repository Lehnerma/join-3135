# Copilot Instructions

## Stack
Vanilla HTML, CSS, and JavaScript — no frameworks, no build tools.

## JavaScript

- **Single responsibility**: every function has exactly one purpose.
- **Max 14 lines** of code per function (blank lines excluded).
- **`async/await` with `try/catch`** for all fetch calls — never `.then()`.
- Use **modern JS** (ES2020+): optional chaining `?.`, nullish coalescing `??`, destructuring, template literals, `const`/`let`.
- Prefer **arrow functions** for callbacks and helpers.

```js
// ✅ correct
async function loadTasks() {
  try {
    const response = await fetch(BASE_URL + "/tasks.json");
    const data = await response.json();
    renderTasks(data);
  } catch (error) {
    console.error("Failed to load tasks:", error);
  }
}

// ❌ wrong — .then() chaining
fetch(BASE_URL + "/tasks.json")
  .then(res => res.json())
  .then(renderTasks);
```

## HTML

- **Semantic HTML**: use `<main>`, `<section>`, `<article>`, `<header>`, `<nav>`, `<footer>`, `<aside>`, `<button>`, etc.
- **Classes**: camelCase → `class="taskCard"`
- **IDs**: snake_case → `id="task_list"`
- Avoid `<div>` and `<span>` when a semantic element fits.

```html
<!-- ✅ correct -->
<section id="task_board">
  <article class="taskCard">...</article>
</section>

<!-- ❌ wrong -->
<div id="taskBoard">
  <div class="task-card">...</div>
</div>
```

## Git Commits

After every successful change, create a commit with a conventional prefix:

| Prefix | When to use |
|---|---|
| `feat:` | New feature or behaviour |
| `fix:` | Bug fix |
| `style:` | CSS / visual changes only |
| `refactor:` | Code restructure, no behaviour change |
| `create:` | New file added |
| `delete:` | File or code removed |
| `chore:` | Config, tooling, dependencies |

```
feat: position-aware drag placeholder via dragover
fix: placeholder not removed on drag leave
style: sticky no-task element in overflow column
```

Never push — the developer pushes manually.

## CSS

- Use **CSS custom properties** (`--color-primary`) for theming.
- Keep selectors shallow (max 3 levels deep).
- One file per component/page (matches the existing `styles/` structure).
