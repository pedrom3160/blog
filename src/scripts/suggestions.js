// Suggestions form — pure helpers plus browser wiring.
//
// The site is static (GitHub Pages). By default the form prepares a public
// GitHub issue; nothing is sent by this page and no success is reported until
// the visitor confirms the issue on GitHub. If `data-endpoint` is configured,
// the form posts JSON to that endpoint and only reports success on a 2xx reply.
//
// The exported helpers are covered by tests/suggestions.test.js.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSuggestion(input) {
  const errors = {};
  const title = String(input.title || '').trim();
  const description = String(input.description || '').trim();
  const name = String(input.name || '').trim();
  const email = String(input.email || '').trim();

  if (!String(input.category || '').trim()) errors.category = 'Escolha uma categoria.';
  if (title.length < 8) errors.title = 'Escreva um título com pelo menos 8 caracteres.';
  else if (title.length > 120) errors.title = 'O título não pode exceder 120 caracteres.';
  if (description.length < 30) errors.description = 'Descreva a sugestão com pelo menos 30 caracteres.';
  else if (description.length > 2000) errors.description = 'A descrição não pode exceder 2000 caracteres.';
  if (name.length > 80) errors.name = 'O nome ou pseudónimo não pode exceder 80 caracteres.';
  if (email && !EMAIL_PATTERN.test(email)) errors.email = 'Introduza um endereço de email válido.';

  return errors;
}

export function buildIssueUrl(input) {
  const repo = String(input.repo || '').trim();
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) throw new Error('Repositório inválido.');

  const title = String(input.title || '').trim();
  const description = String(input.description || '').trim();
  const category = String(input.category || '').trim() || 'Outra';
  const name = String(input.name || '').trim();

  const body = [
    `## ${title}`,
    '',
    `**Categoria:** ${category}`,
    name ? `**Sugestão de:** ${name}` : null,
    '',
    description,
    '',
    '---',
    '_Sugestão preparada na página de sugestões do GPTCLONE Blog._',
  ]
    .filter((line) => line !== null)
    .join('\n');

  const url = new URL(`https://github.com/${repo}/issues/new`);
  url.searchParams.set('title', `[Sugestão] ${title}`);
  url.searchParams.set('body', body);
  return url.toString();
}

export function formatSuggestionText(input) {
  const title = String(input.title || '').trim();
  const description = String(input.description || '').trim();
  const category = String(input.category || '').trim() || 'Outra';
  const name = String(input.name || '').trim();

  return [
    `Sugestão: ${title}`,
    `Categoria: ${category}`,
    name ? `Nome: ${name}` : null,
    '',
    description,
  ]
    .filter((line) => line !== null)
    .join('\n');
}

function copyToClipboard(text) {
  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
    return navigator.clipboard.writeText(text);
  }
  return new Promise((resolve, reject) => {
    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.top = '-1000px';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand && document.execCommand('copy');
      document.body.removeChild(area);
      if (ok) resolve();
      else reject(new Error('copy failed'));
    } catch (error) {
      reject(error);
    }
  });
}

function initSuggestionForm() {
  const form = document.getElementById('suggestion-form');
  if (!form) return;

  const status = document.getElementById('suggestion-status');
  const submit = form.querySelector('button[type="submit"]');
  const copyButton = document.getElementById('suggestion-copy');
  const endpoint = String(form.dataset.endpoint || '').trim();
  const repo = String(form.dataset.repo || '').trim();
  const submitLabel = submit ? submit.textContent.trim() : '';

  form.noValidate = true;

  function field(name) {
    return form.elements.namedItem(name);
  }

  function values() {
    return {
      category: field('category') ? field('category').value : '',
      title: field('title') ? field('title').value : '',
      description: field('body') ? field('body').value : '',
      name: field('name') ? field('name').value : '',
      email: field('email') ? field('email').value : '',
    };
  }

  function errorKey(name) {
    return name === 'body' ? 'description' : name;
  }

  function fieldForError(name) {
    return field(name === 'description' ? 'body' : name);
  }

  function clearError(name) {
    const key = errorKey(name);
    const error = document.getElementById('error-' + key);
    const input = field(name);
    if (error) {
      error.textContent = '';
      error.hidden = true;
    }
    if (input) input.removeAttribute('aria-invalid');
  }

  function resetErrors() {
    for (const error of form.querySelectorAll('[data-error-for]')) {
      error.textContent = '';
      error.hidden = true;
    }
    for (const input of form.querySelectorAll('[aria-invalid]')) {
      input.removeAttribute('aria-invalid');
    }
  }

  function showErrors(errors) {
    resetErrors();
    let first = null;
    for (const [name, message] of Object.entries(errors)) {
      const error = document.getElementById('error-' + name);
      const input = fieldForError(name);
      if (error) {
        error.textContent = message;
        error.hidden = false;
      }
      if (input) {
        input.setAttribute('aria-invalid', 'true');
        if (!first) first = input;
      }
    }
    if (first) first.focus();
  }

  function setStatus(state, message, link) {
    if (!status) return;
    status.hidden = false;
    status.dataset.state = state;
    status.replaceChildren();

    const text = document.createElement('p');
    text.textContent = message;
    status.appendChild(text);

    if (link) {
      const anchor = document.createElement('a');
      anchor.href = link;
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
      anchor.textContent = 'Abrir a issue no GitHub';
      status.appendChild(anchor);
    }
  }

  function categoryLabel() {
    const select = field('category');
    if (!select || select.selectedIndex < 0) return '';
    const option = select.options[select.selectedIndex];
    return option ? option.textContent.trim() : '';
  }

  for (const input of form.querySelectorAll('input, select, textarea')) {
    const name = input.getAttribute('name');
    if (!name) continue;
    input.addEventListener('input', () => {
      if (input.getAttribute('aria-invalid') === 'true') clearError(name);
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    resetErrors();
    if (status) status.hidden = true;

    const honeypot = field('website');
    if (honeypot && honeypot.value) return;

    const data = values();
    const errors = validateSuggestion(data);
    if (Object.keys(errors).length) {
      showErrors(errors);
      return;
    }

    const label = categoryLabel();
    const payload = {
      category: label || data.category,
      title: data.title.trim(),
      description: data.description.trim(),
      name: data.name.trim(),
    };

    if (endpoint) {
      if (submit) {
        submit.disabled = true;
        submit.textContent = 'A enviar…';
      }
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ ...payload, email: data.email.trim(), _subject: 'Nova sugestão — GPTCLONE Blog' }),
        });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        form.reset();
        resetErrors();
        setStatus('success', 'Sugestão enviada. Obrigado pelo contributo.');
      } catch (error) {
        setStatus('error', 'Não foi possível enviar a sugestão. Tente novamente mais tarde ou copie o texto para não o perder.');
      } finally {
        if (submit) {
          submit.disabled = false;
          submit.textContent = submitLabel;
        }
      }
      return;
    }

    try {
      const url = buildIssueUrl({ ...payload, repo });
      window.open(url, '_blank', 'noopener');
      setStatus(
        'info',
        'Sugestão preparada. Reveja o texto no GitHub e confirme a publicação; nada foi enviado por este site.',
        url
      );
    } catch (error) {
      setStatus('error', 'Não foi possível preparar a issue. Copie o texto da sugestão para não o perder.');
    }
  });

  if (copyButton) {
    copyButton.addEventListener('click', () => {
      resetErrors();
      const data = values();
      const errors = validateSuggestion(data);
      if (Object.keys(errors).length) {
        showErrors(errors);
        setStatus('error', 'Corrija os campos indicados antes de copiar a sugestão.');
        return;
      }
      const text = formatSuggestionText({
        category: categoryLabel() || data.category,
        title: data.title.trim(),
        description: data.description.trim(),
        name: data.name.trim(),
      });
      copyToClipboard(text)
        .then(() => setStatus('success', 'Sugestão copiada para a área de transferência.'))
        .catch(() => setStatus('error', 'Não foi possível copiar automaticamente. Selecione o texto do formulário e copie-o manualmente.'));
    });
  }
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSuggestionForm);
  } else {
    initSuggestionForm();
  }
}
