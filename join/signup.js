(() => {
  const endpoint = 'https://pslubgyrsmaenmpnnxqs.supabase.co/rest/v1/rpc/cts_register_week13';
  const publishableKey = 'sb_publishable_g1WL92h0nkOo5na0VBqy_g_s_k8kwGO';
  const closesAt = Date.parse('2026-12-07T20:15:00-05:00');
  const form = document.getElementById('registration');
  const button = document.getElementById('submit');
  const problem = document.getElementById('problem');
  const {team, email, straight, spread, website} = form.elements;
  let posting = false;

  // Only the request nonce survives a refresh. The contact details stay in the form.
  let requestId = crypto.randomUUID();
  try {
    const stored = sessionStorage.getItem('cts-week13-request');
    if (stored && /^[0-9a-f-]{36}$/i.test(stored)) requestId = stored;
    sessionStorage.setItem('cts-week13-request', requestId);
  } catch { /* Submissions also work with browser storage disabled. */ }

  function showProblem(message) {
    problem.hidden = false;
    problem.textContent = message;
  }

  function updateChoice() {
    const count = Number(straight.checked) + Number(spread.checked);
    document.getElementById('choice-total').textContent =
      'Selected contest fees: $' + (12 * count) + ' · Charged on this form: $0';
  }

  function closeRegistration() {
    button.disabled = true;
    button.textContent = 'Week 13 registration closed';
    showProblem('All Week 13 games have reached kickoff. Registration has closed.');
  }

  function confirmRegistration(receipt, choices) {
    document.getElementById('signup').hidden = true;
    document.getElementById('receipt-details').textContent = 'Your Week 13 registration is saved for ' + choices.join(' and ') + '.';
    document.getElementById('receipt-number').textContent = receipt;
    const confirmed = document.getElementById('confirmed');
    confirmed.hidden = false;
    confirmed.focus();
  }

  form.addEventListener('change', updateChoice);
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (posting || website.value) return;
    if (Date.now() >= closesAt) { closeRegistration(); return; }
    if (!form.reportValidity()) return;
    if (team.value.trim().length < 2) {
      showProblem('Please enter a team name with at least two characters.');
      team.focus();
      return;
    }
    const choices = [];
    if (straight.checked) choices.push('The Weekly');
    if (spread.checked) choices.push('Beat the Spread');
    if (!choices.length) {
      showProblem('Choose at least one contest.');
      straight.focus();
      return;
    }
    problem.hidden = true;
    posting = true;
    button.disabled = true;
    button.textContent = 'Saving your entry…';
    const payload = {
      p_team: team.value.trim(), p_email: email.value.trim(),
      p_straight: straight.checked, p_spread: spread.checked, p_request: requestId
    };
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    let closed = false;
    try {
      const response = await fetch(endpoint, {
        method: 'POST', headers: {apikey: publishableKey, 'Content-Type': 'application/json'},
        body: JSON.stringify(payload), signal: controller.signal
      });
      if (!response.ok) throw Error('save failed');
      const result = await response.json();
      if (result.status === 'registered' && /^W13-[0-9A-F]{12}$/.test(result.receipt)) {
        confirmRegistration(result.receipt, choices);
      } else if (result.status === 'already_registered') {
        showProblem('This email already has a Week 13 registration. Your original registration and confirmation remain valid.');
      } else if (result.status === 'closed') {
        closed = true;
        closeRegistration();
      } else if (result.status === 'invalid') {
        showProblem('Check your team name, email and contest choices, then try again.');
      } else {
        throw Error('unconfirmed response');
      }
    } catch {
      showProblem('We couldn’t confirm your entry. Keep the form as it is and try again.');
    } finally {
      clearTimeout(timeout);
      posting = false;
      if (!closed) { button.disabled = false; button.textContent = 'Register for Week 13'; }
    }
  });
  updateChoice();
  if (Date.now() < closesAt) button.disabled = false;
  else closeRegistration();
})();
