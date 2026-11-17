/* Kapcsolat / Kérdése van? form -> HubSpot Forms API */
    (function () {
      var form = document.getElementById('cf-form');
      if (!form) return;
      var PORTAL = '5181597', FORM = '77a98e87-fcdb-4220-8bb7-2ab7e345d2ad', SUB = 5581684;
      var EN = /^en/i.test(document.documentElement.lang || '');
      var L = EN ? {
        proc: 'I have read and accept the privacy notice.',
        news: 'Inform me about professional educational materials and programmes.',
        legal: 'By pressing the send button, the data you provide will be recorded and processed so that we can respond to your request.',
        req: 'Please fill in the fields marked with an asterisk.',
        consent: 'You must accept the privacy notice.',
        sending: 'Sending…',
        ok: 'Thank you, we have received your message. We will reply within 24 hours.',
        fail: 'Sorry, the message could not be sent. Please try again later.'
      } : {
        proc: 'Megértettem és elfogadom az adatvédelmi tájékoztatót.',
        news: 'Szeretnék szakmai ismeretterjesztő anyagokról és programokról értesülni.',
        legal: 'A küldés gomb megnyomásával megadott adatai rögzítésre és kezelésre kerülnek, hogy a kérését meg tudjuk válaszolni.',
        req: 'Kérjük, töltse ki a csillaggal jelölt mezőket.',
        consent: 'Az adatvédelmi tájékoztató elfogadása szükséges.',
        sending: 'Küldés…',
        ok: 'Köszönjük, üzenetét megkaptuk. 24 órán belül válaszolunk.',
        fail: 'Sajnos nem sikerült elküldeni. Kérjük, próbálja újra később.'
      };
      var T_PROC = L.proc, T_NEWS = L.news, T_LEGAL = L.legal;
      var status = document.getElementById('cf-status');
      var btn = form.querySelector('.cf-submit');
      function say(msg, ok) { status.textContent = msg; status.className = 'cf-status ' + (ok ? 'cf-ok' : 'cf-err'); }
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        if (form.website.value) return; /* honeypot */
        var name = form.firstname.value.trim(), email = form.email.value.trim(), msg = form.message.value.trim();
        var bad = [];
        [form.firstname, form.email, form.message].forEach(function (el) { el.classList.remove('cf-invalid'); });
        if (!name) { form.firstname.classList.add('cf-invalid'); bad.push(1); }
        if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) { form.email.classList.add('cf-invalid'); bad.push(1); }
        if (!msg) { form.message.classList.add('cf-invalid'); bad.push(1); }
        if (bad.length) { say(L.req, false); return; }
        if (!document.getElementById('cf-consent').checked) { say(L.consent, false); return; }
        var fields = [{ objectTypeId: '0-1', name: 'firstname', value: name }, { objectTypeId: '0-1', name: 'email', value: email }, { objectTypeId: '0-1', name: 'message', value: msg }];
        if (form.phone.value.trim()) fields.push({ objectTypeId: '0-1', name: 'phone', value: form.phone.value.trim() });
        var m = document.cookie.match(/(?:^|; )hubspotutk=([^;]+)/);
        var payload = {
          submittedAt: String(Date.now()), fields: fields,
          context: { pageUri: location.href, pageName: document.title },
          legalConsentOptions: { consent: { consentToProcess: true, text: T_PROC, communications: [{ value: document.getElementById('cf-news').checked, subscriptionTypeId: SUB, text: T_NEWS }] } }
        };
        if (m) payload.context.hutk = m[1];
        btn.disabled = true; say(L.sending, true);
        fetch('https://api.hsforms.com/submissions/v3/integration/submit/' + PORTAL + '/' + FORM, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
          .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
          .then(function () { form.reset(); say(L.ok, true); })
          .catch(function () { say(L.fail, false); })
          .then(function () { btn.disabled = false; });
      });
    })();
