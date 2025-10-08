// schedule.js - modal open/close and simple form handling
document.addEventListener("DOMContentLoaded", () => {
  // debug: show whether supabase config loaded (publishableKey/anonKey masked)
  try {
    const _cfg = window.SUPABASE || null;
    if (_cfg) {
      // support both publishableKey and legacy anonKey
      const key = _cfg.publishableKey || _cfg.anonKey || null;
      const masked = key ? "***" + String(key).slice(-8) : null;
      const hasApi = Boolean(_cfg.apiKey);
      console.info("SUPABASE config loaded", {
        url: _cfg.url,
        table: _cfg.table,
        publishableKeyMasked: masked,
      });
      if (hasApi)
        console.warn(
          "Warning: `apiKey` present in client config — do NOT expose server keys in browser."
        );
    } else {
      console.info("No SUPABASE config found on window.SUPABASE");
    }
  } catch (e) {
    console.warn("Error reading SUPABASE config", e);
  }

  const openBtn = document.getElementById("open-schedule");
  const modal = document.getElementById("schedule-modal");
  const backdrop = modal && modal.querySelector(".modal-backdrop");
  const closeBtn = modal && modal.querySelector(".modal-close");
  const cancelBtn = modal && modal.querySelector(".modal-cancel");
  const form = document.getElementById("schedule-form");
  const success = document.getElementById("schedule-success");
  let lastFocused = null;

  function openModal() {
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    const firstInput = form.querySelector("input, textarea, button");
    firstInput && firstInput.focus();
  }
  function closeModal() {
    if (!modal) return;
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    success && success.classList.add("hidden");
    if (lastFocused) lastFocused.focus();
  }

  openBtn &&
    openBtn.addEventListener("click", (e) => {
      e.preventDefault();
      openModal();
    });
  closeBtn && closeBtn.addEventListener("click", closeModal);
  cancelBtn && cancelBtn.addEventListener("click", closeModal);
  backdrop && backdrop.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeModal();
  });
  // form submission: try RPC then fallback to direct table insert
  form &&
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const submitBtn = form.querySelector("button[type=submit]");
      if (submitBtn) submitBtn.disabled = true;

      const data = {
        name: form.name.value || null,
        phone: form.phone.value || null,
        email: form.email.value || null,
        pickup_date: form.date.value || null,
        pickup_time: form.time.value || null,
        address: form.address.value || null,
        notes: form.notes.value || null,
        created_at: new Date().toISOString(),
      };

      const cfg = window.SUPABASE || {};
      const url = (cfg.url || "").replace(/\/$/, "");
      const table = cfg.table || "schedules";
      const supaKey = cfg.publishableKey || cfg.anonKey || null;

      function showSuccess() {
        success && success.classList.remove("hidden");
        form.reset();
        setTimeout(() => {
          closeModal();
        }, 2200);
      }

      function showError(message) {
        console.error(message);
        if (!modal) return;
        let errEl = modal.querySelector(".submit-error");
        if (!errEl) {
          errEl = document.createElement("div");
          errEl.className = "submit-error";
          errEl.setAttribute("role", "alert");
          errEl.style.color = "#b00020";
          errEl.style.marginTop = "12px";
          modal.querySelector(".modal-panel").appendChild(errEl);
        }
        errEl.textContent = message;
      }

      if (url && supaKey) {
        const rpcEndpoint = `${url}/rest/v1/rpc/rpc_insert_schedule`;
        const tableEndpoint = `${url}/rest/v1/${table}`;
        const rpcPayload = {
          p_name: data.name,
          p_phone: data.phone,
          p_email: data.email,
          p_pickup_date: data.pickup_date,
          p_pickup_time: data.pickup_time,
          p_address: data.address,
          p_notes: data.notes,
        };

        try {
          console.info("Submitting schedule (RPC) to", rpcEndpoint);
          console.debug("RPC payload:", rpcPayload);

          const rpcRes = await fetch(rpcEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              apikey: supaKey,
              Authorization: `Bearer ${supaKey}`,
            },
            body: JSON.stringify(rpcPayload),
          });

          const rpcText = await rpcRes.text();
          let rpcBody = rpcText;
          try {
            rpcBody = rpcText ? JSON.parse(rpcText) : rpcText;
          } catch (e) {
            /* ignore */
          }

          console.info("RPC status:", rpcRes.status);
          console.debug("RPC body:", rpcBody);

          if (!rpcRes.ok) {
            // fallback to direct table insert
            console.warn(
              "RPC failed, attempting direct table insert",
              rpcRes.status
            );
            const res = await fetch(tableEndpoint, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                apikey: supaKey,
                Authorization: `Bearer ${supaKey}`,
                Prefer: "return=representation",
              },
              body: JSON.stringify(data),
            });

            const respText = await res.text();
            let respBody = respText;
            try {
              respBody = respText ? JSON.parse(respText) : respText;
            } catch (e) {
              /* ignore */
            }

            console.info("Fallback insert status:", res.status);
            console.debug("Fallback insert body:", respBody);

            if (!res.ok) {
              const msg = `Server returned ${res.status}: ${
                typeof respBody === "string"
                  ? respBody
                  : JSON.stringify(respBody)
              }`;
              showError(msg);
              if (submitBtn) submitBtn.disabled = false;
              return;
            }

            showSuccess();
          } else {
            showSuccess();
          }
        } catch (err) {
          showError("Network or request error — see console for details.");
          console.error("Supabase request error", err);
        } finally {
          if (submitBtn) submitBtn.disabled = false;
        }
      } else {
        console.warn("Supabase not configured — running local demo flow.");
        showSuccess();
        if (submitBtn) submitBtn.disabled = false;
      }
    });
});
