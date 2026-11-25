console.log('Js carregando');

(function () {
    'use strict';

    // variables
    const openForm = document.querySelector('.header-button');
    const form = document.querySelector('.form-help');
    const closeForm = document.querySelector('.form-mask');

    if (!form || !openForm || !closeForm) return;

    const status = form.querySelector('.form-status');
    const submitButton = form.querySelector('.form-reserve-button');
    const phoneInput = form.querySelector('.input-number');

    let closeTimer = null;

    // functions
    function onForm() {
        clearTimeout(closeTimer);

        // Abre form
        form.style.left = "50%";
        form.style.transform = "translateX(-50%)";
        closeForm.style.visibility = "visible";

        form.removeAttribute('inert');

        const firstInput = form.querySelector('select, input, textarea');
        if (firstInput) {
            setTimeout(() => firstInput.focus({ preventScroll: true }), 50);
        }
    }

    function offForm() {
        if (document.activeElement && form.contains(document.activeElement)) {
            document.activeElement.blur();
        }

        if (openForm) {
            openForm.focus({ preventScroll: true });
        }

        // fecha form
        requestAnimationFrame(() => {
            form.setAttribute('inert', '');
            form.style.left = "-350px";
            form.style.transform = "none";
            closeForm.style.visibility = "hidden";

            form.reset();
            setStatus('');
        });
    }

    function setStatus(message, isError = false) {
        if (!status) return;
        status.textContent = message;
        status.classList.toggle('is-error', Boolean(isError));
    }

    // events
    openForm.addEventListener('click', onForm);
    closeForm.addEventListener('click', offForm);

    window.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && closeForm.style.visibility === 'visible') {
            offForm();
        }
    });

    // phone mask
    function maskPhone(value) {
        const d = value.replace(/\D/g, '').slice(0, 11);
        let out = '';

        if (d.length > 0) out = '(' + d.slice(0, 2);
        if (d.length >= 3) out += ') ' + d.slice(2, 3);
        if (d.length >= 4) out += ' ' + d.slice(3, 7);
        if (d.length >= 8) out += '-' + d.slice(7, 11);

        return out;
    }

    if (phoneInput) {
        phoneInput.addEventListener('input', function () {
            phoneInput.value = maskPhone(phoneInput.value);
        });
    }

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        if (!form.reportValidity()) return;

        submitButton.disabled = true;
        setStatus('Enviando...');

        try {
            const response = await fetch(form.action, {
                method: 'POST',
                body: new FormData(form),
                headers: { Accept: 'application/json' }
            });

            if (!response.ok) throw new Error('HTTP ' + response.status);

            setStatus('Reserva enviada! Entraremos em contato.');

            closeTimer = setTimeout(offForm, 2000);
        } catch (error) {
            setStatus('Não foi possível enviar. Tente novamente.', true);
        } finally {
            submitButton.disabled = false;
        }
    });
})();