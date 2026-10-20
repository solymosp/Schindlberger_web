/* Kapcsolat / Kérdése van? form -> HubSpot Forms API */
    (function () {
      var form = document.getElementById('cf-form');
      if (!form) return;
      var PORTAL = '5181597', FORM = '77a98e87-fcdb-4220-8bb7-2ab7e345d2ad', SUB = 5581684;
      var T_PROC = 'Megértettem és elfogadom az adatvédelmi tájékoztatót.';
      var T_NEWS = 'Szeretnék szakmai ismeretterjesztő anyagokról és programokról értesülni.';
      var T_LEGAL = 'A küldés gomb megnyomásával megadott adatai rögzítésre és kezelésre kerülnek, hogy a kérését meg tudjuk válaszolni.';
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
        if (bad.length) { say('Kérjük, töltse ki a csillaggal jelölt mezőket.', false); return; }
        if (!document.getElementById('cf-consent').checked) { say('Az adatvédelmi tájékoztató elfogadása szükséges.', false); return; }
        var fields = [{ objectTypeId: '0-1', name: 'firstname', value: name }, { objectTypeId: '0-1', name: 'email', value: email }, { objectTypeId: '0-1', name: 'message', value: msg }];
        if (form.phone.value.trim()) fields.push({ objectTypeId: '0-1', name: 'phone', value: form.phone.value.trim() });
        var m = document.cookie.match(/(?:^|; )hubspotutk=([^;]+)/);
        var payload = {
          submittedAt: String(Date.now()), fields: fields,
          context: { pageUri: location.href, pageName: document.title },
          legalConsentOptions: { consent: { consentToProcess: true, text: T_PROC, communications: [{ value: document.getElementById('cf-news').checked, subscriptionTypeId: SUB, text: T_NEWS }] } }
        };
        if (m) payload.context.hutk = m[1];
        btn.disabled = true; say('Küldés…', true);
        fetch('https://api.hsforms.com/submissions/v3/integration/submit/' + PORTAL + '/' + FORM, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
          .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
          .then(function () { form.reset(); say('Köszönjük, üzenetét megkaptuk. 24 órán belül válaszolunk.', true); })
          .catch(function () { say('Sajnos nem sikerült elküldeni. Kérjük, próbálja újra később.', false); })
          .then(function () { btn.disabled = false; });
      });
    })();
