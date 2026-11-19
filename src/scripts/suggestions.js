// Suggestions form — pure helpers plus browser wiring.
//
// The site is static (GitHub Pages). With no provider configured, the form
// prepares a public GitHub issue; nothing is sent by this page and no success
// is reported until the visitor confirms the issue on GitHub. When a Web3Forms
// public form key or a generic CORS endpoint is configured, the form posts
// directly and reports success only after a successful provider response.
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

// Web3Forms expects a public access key (a form ID, not a secret). The key is
// visible in the page by design and only routes a submission to its inbox.
export function buildWeb3FormsPayload(input, accessKey, pageUrl = '') {
  const key = String(accessKey || '').trim();
  if (!key) throw new Error('Chave Web3Forms em falta.');

  const title = String(input.title || '').trim();
  const description = String(input.description || '').trim();
  const category = String(input.category || '').trim() || 'Outra';
  const name = String(input.name || '').trim();
  const email = String(input.email || '').trim();

  return {
    access_key: key,
    subject: `[Sugestão] ${title}`,
    from_name: 'GPTCLONE Blog',
    name: name || 'Anónimo',
    ...(email ? { email } : {}),
    category,
    title,
    message: description,
    botcheck: false,
    source: 'GPTCLONE Blog — Sugestões',
    ...(pageUrl ? { page_url: pageUrl } : {}),
  };
}

export function web3formsSucceeded(payload) {
  return Boolean(payload && payload.success === true);
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
  const githubButton = document.getElementById('suggestion-github');
  const mode = String(form.dataset.mode || 'github').trim();
  const endpoint = String(form.dataset.endpoint || '').trim();
  const accessKey = String(form.dataset.accessKey || '').trim();
  const repo = String(form.dataset.repo || '').trim();
  const submitLabel = submit ? submit.textContent.trim() : '';
  const privateConfigured =
    (mode === 'web3forms' && Boolean(accessKey) && Boolean(endpoint)) ||
    (mode === 'endpoint' && Boolean(endpoint));

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

  function setStatus(state, message, link, linkLabel = 'Abrir a issue no GitHub') {
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
      anchor.textContent = linkLabel;
      status.appendChild(anchor);
    }
  }

  function categoryLabel() {
    const select = field('category');
    if (!select || select.selectedIndex < 0) return '';
    const option = select.options[select.selectedIndex];
    return option ? option.textContent.trim() : '';
  }

  function payloadFrom(data) {
    return {
      category: categoryLabel() || data.category,
      title: data.title.trim(),
      description: data.description.trim(),
      name: data.name.trim(),
      email: data.email.trim(),
    };
  }

  function issueUrlFrom(payload) {
    try {
      return buildIssueUrl({ ...payload, repo });
    } catch (error) {
      return '';
    }
  }

  function openIssue(payload) {
    const url = issueUrlFrom(payload);
    if (!url) {
      setStatus('error', 'Não foi possível preparar a issue. Copie o texto da sugestão para não o perder.');
      return;
    }
    window.open(url, '_blank', 'noopener');
    setStatus(
      'info',
      'Sugestão preparada. Reveja o texto no GitHub e confirme a publicação; nada foi enviado por este site.',
      url,
      'Abrir a issue no GitHub'
    );
  }

  function setBusy(busy) {
    if (submit) {
      submit.disabled = busy;
      submit.textContent = busy ? 'A enviar…' : submitLabel;
    }
    if (busy) form.setAttribute('aria-busy', 'true');
    else form.removeAttribute('aria-busy');
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
    const botcheck = field('botcheck');
    if ((honeypot && honeypot.value) || (botcheck && botcheck.checked)) return;

    const data = values();
    const errors = validateSuggestion(data);
    if (Object.keys(errors).length) {
      showErrors(errors);
      return;
    }

    const payload = payloadFrom(data);

    if (mode === 'github') {
      openIssue(payload);
      return;
    }

    if (!privateConfigured) {
      setStatus(
        'error',
        'O serviço de envio não está configurado. Pode publicar a sugestão no GitHub ou copiá-la.',
        issueUrlFrom(payload),
        'Publicar no GitHub'
      );
      return;
    }

    setBusy(true);
    setStatus('info', 'A enviar a sugestão…');

    try {
      if (mode === 'web3forms') {
        const body = buildWeb3FormsPayload(payload, accessKey, window.location.href);
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(body),
        });
        let result = null;
        try {
          result = await response.json();
        } catch (error) {
          result = null;
        }
        if (!response.ok || !web3formsSucceeded(result)) throw new Error('Web3Forms submission failed');
        form.reset();
        resetErrors();
        setStatus('success', 'Sugestão enviada. Obrigado pelo contributo.');
      } else {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({
            ...payload,
            _subject: 'Nova sugestão — GPTCLONE Blog',
            source: 'GPTCLONE Blog — Sugestões',
          }),
        });
        if (!response.ok) throw new Error('HTTP ' + response.status);
        form.reset();
        resetErrors();
        setStatus('success', 'Sugestão enviada. Obrigado pelo contributo.');
      }
    } catch (error) {
      setStatus(
        'error',
        'Não foi possível enviar a sugestão. Tente novamente mais tarde ou publique-a no GitHub; o texto preenchido mantém-se.',
        issueUrlFrom(payload),
        'Publicar no GitHub'
      );
    } finally {
      setBusy(false);
    }
  });

  if (githubButton) {
    githubButton.addEventListener('click', () => {
      resetErrors();
      const data = values();
      const errors = validateSuggestion(data);
      if (Object.keys(errors).length) {
        showErrors(errors);
        setStatus('error', 'Corrija os campos indicados antes de preparar a issue.');
        return;
      }
      const honeypot = field('website');
      const botcheck = field('botcheck');
      if ((honeypot && honeypot.value) || (botcheck && botcheck.checked)) return;
      openIssue(payloadFrom(data));
    });
  }

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
      const text = formatSuggestionText(payloadFrom(data));
      copyToClipboard(text)
        .then(() => setStatus('success', 'Sugestão copiada para a área de transferência.'))
        .catch(() =>
          setStatus('error', 'Não foi possível copiar automaticamente. Selecione o texto do formulário e copie-o manualmente.')
        );
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
