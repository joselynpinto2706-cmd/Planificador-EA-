let currentWeekIndex = 0;
    let editingMappingMode = false;

    window.onload = function() {
      fillRemainingWeeks();
      loadFromLocalStorage();
      renderWeekDropdown();
      detectAndLoadAcademicWeek();
      renderMapeoTable();
      restoreMappingUploadStatus();
      updateFirebaseStatusUI();
    };

    function restoreMappingUploadStatus() {
      try {
        const fileName = localStorage.getItem('eight_mapping_file_2026');
        if (!fileName) return;
        const status = document.getElementById('mapping-upload-status');
        const statusText = document.getElementById('mapping-upload-status-text');
        if (status && statusText) {
          statusText.textContent = `${fileName} · Mapeo activo para este dispositivo`;
          status.classList.remove('hidden');
        }
      } catch(e) {}
    }

    function fillRemainingWeeks() {
      const existing = curriculumDatabase.length;
      if (existing < 40) {
        for (let w = existing + 1; w <= 40; w++) {
          let tri = "TERCER TRIMESTRE";
          if (w <= 13) tri = "PRIMER TRIMESTRE";
          else if (w <= 27) tri = "SEGUNDO TRIMESTRE";

          curriculumDatabase.push({
            sem: w,
            subject: "Lengua",
            trimestre: tri,
            unidad: `U${Math.ceil(w / 7)}`,
            fechas: `Semana ${w} (2026-2027)`,
            per: "6",
            tema: `Contenido Curricular - Semana ${w}`,
            dcd: `LL.2.3.3. Ampliar la comprensión de un texto mediante la identificación de los significados de las palabras.\n\nLL.2.4.7. Aplicar progresivamente las reglas de escritura mediante la reflexión fonológica.`,
            comp: "Competencias Comunicacionales / Digitales",
            activation: '', anticipation: '', construction: '', consolidation: ''
          });
        }
      }
    }

    function switchTab(tabId) {
      document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
      document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('bg-indigo-600', 'text-white', 'shadow-sm');
        btn.classList.add('text-slate-600', 'hover:bg-slate-100');
      });

      document.getElementById(tabId).classList.remove('hidden');
      const activeBtn = document.getElementById(`btn-${tabId}`);
      if (activeBtn) {
        activeBtn.classList.remove('text-slate-600', 'hover:bg-slate-100');
        activeBtn.classList.add('bg-indigo-600', 'text-white', 'shadow-sm');
      }
    }

    function renderWeekDropdown() {
      const select = document.getElementById('week-select');
      select.innerHTML = '';
      curriculumDatabase.forEach((item, idx) => {
        const option = document.createElement('option');
        option.value = idx;
        option.textContent = `Sem ${item.sem}: ${item.tema.substring(0, 24)}... (${item.fechas})`;
        select.appendChild(option);
      });
      select.value = currentWeekIndex;
    }

    function changeWeek() {
      const select = document.getElementById('week-select');
      currentWeekIndex = parseInt(select.value, 10);
      renderCurrentWeekData();
    }

    function getGradeLabel() {
      const grade = document.getElementById('select-grade')?.value || '4';
      return `${grade}.º de EGB`;
    }

    function getSubjectLabel() {
      const select = document.getElementById('select-subject');
      return select?.options[select.selectedIndex]?.text || 'Asignatura';
    }

    function changeGrade() {
      const grade = document.getElementById('select-grade')?.value || '4';
      const badge = document.getElementById('sublevel-badge');
      if (badge) badge.textContent = Number(grade) <= 4 ? 'EGB Elemental' : 'EGB Media';

      const data = curriculumDatabase[currentWeekIndex];
      if (data) {
        data.grade = Number(grade);
        ensureWeeklyActivities(data, true);
      }
      renderCurrentWeekData();
      showModal("Grado Actualizado", `Planificación activa para ${getGradeLabel()}.`);
    }

    function changeSubject() {
      const subject = document.getElementById('select-subject').value;
      const data = curriculumDatabase[currentWeekIndex];
      if (data) {
        data.subject = subject;
        data.grade = Number(document.getElementById('select-grade')?.value || 4);
        ensureWeeklyActivities(data, true);
      }
      showModal("Asignatura Actualizada", `Se ha activado la planificación de ${getSubjectLabel()} para ${getGradeLabel()}.`);
      renderCurrentWeekData();
    }

    function renderCurrentWeekData() {
      const data = curriculumDatabase[currentWeekIndex];
      if (!data) return;

      const gradeSelect = document.getElementById('select-grade');
      const subjectSelect = document.getElementById('select-subject');
      if (data.grade && gradeSelect) gradeSelect.value = String(data.grade);
      if (data.subject && subjectSelect && [...subjectSelect.options].some(o => o.value === data.subject)) {
        subjectSelect.value = data.subject;
      }
      const badge = document.getElementById('sublevel-badge');
      const activeGrade = Number(gradeSelect?.value || data.grade || 4);
      if (badge) badge.textContent = activeGrade <= 4 ? 'EGB Elemental' : 'EGB Media';

      document.getElementById('badge-trimestre').textContent = data.trimestre || "TRIMESTRE";
      document.getElementById('badge-unidad').textContent = data.unidad || "UNIDAD";
      document.getElementById('badge-periods').textContent = `${data.per || 6} Periodos Semanales`;

      document.getElementById('view-week-title').textContent = `Semana ${data.sem}: ${data.tema}`;
      document.getElementById('view-week-dates').innerHTML = `<i class="fa-regular fa-calendar-days text-indigo-500"></i> Fechas Lectivas: ${data.fechas}`;

      const dcdBox = document.getElementById('dcd-container');
      const compBox = document.getElementById('comp-container');
      const themeBox = document.getElementById('theme-container');

      if (!editingMappingMode) {
        dcdBox.innerHTML = data.dcd ? data.dcd : "<em class='text-slate-400'>No se registran DCDs específicas.</em>";
        compBox.innerHTML = data.comp ? data.comp : "Competencias Generales";
        themeBox.innerHTML = data.tema;
      } else {
        dcdBox.innerHTML = `<textarea id="edit-dcd-input" rows="4" class="w-full bg-white border border-slate-300 rounded-lg p-2 text-xs text-slate-800">${data.dcd}</textarea>`;
        compBox.innerHTML = `<input type="text" id="edit-comp-input" value="${data.comp}" class="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs">`;
        themeBox.innerHTML = `<input type="text" id="edit-theme-input" value="${data.tema}" class="w-full bg-white border border-slate-300 rounded-lg p-1.5 text-xs font-bold">`;
      }

      ensureWeeklyActivities(data);
      document.getElementById('erca-activation').value = data.activation || "";
      document.getElementById('erca-anticipation').value = data.anticipation || "";
      document.getElementById('erca-construction').value = data.construction || "";
      document.getElementById('erca-consolidation').value = data.consolidation || "";

      document.getElementById('nee-custom-notes').value = data.neeNotes || "";

      updateTechTips();
      renderNEE();
    }

    function renderNEE() {
      const filter = document.getElementById('nee-filter').value;
      const container = document.getElementById('nee-strategies-container');
      const profileTag = document.getElementById('nee-profile-tag');
      container.innerHTML = '';

      let list = [];
      if (filter === 'ALL' || filter === 'TDAH') {
        list = list.concat(neeDatabase.TDAH.map(item => ({...item, tag: 'TDAH'})));
      }
      if (filter === 'ALL' || filter === 'TDA') {
        list = list.concat(neeDatabase.TDA.map(item => ({...item, tag: 'TDA'})));
      }
      if (filter === 'ALL' || filter === 'DISLEXIA') {
        list = list.concat(neeDatabase.DISLEXIA.map(item => ({...item, tag: 'DISLEXIA'})));
      }

      profileTag.textContent = filter === 'ALL' ? 'Integrado' : filter;

      list.forEach(item => {
        const card = document.createElement('div');
        card.className = "bg-slate-950/60 border border-indigo-900/60 rounded-xl p-3 space-y-1";
        card.innerHTML = `
          <div class="flex items-center justify-between">
            <span class="text-xs font-bold text-purple-200 flex items-center gap-1.5">
              <i class="fa-solid ${item.icono} text-purple-400"></i>
              <span>${item.titulo}</span>
            </span>
            <span class="text-[9px] font-black px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              ${item.tag}
            </span>
          </div>
          <p class="text-[11px] text-slate-300 leading-relaxed">${item.desc}</p>
        `;
        container.appendChild(card);
      });
    }

    function updateTechTips() {
      const tech = document.getElementById('tech-filter').value;
      
      const badgeAct = document.getElementById('tech-badge-act');
      const badgeCons = document.getElementById('tech-badge-cons');
      const badgeConsol = document.getElementById('tech-badge-consol');

      if (tech === 'Teams') {
        badgeAct.innerHTML = `<i class="fa-solid fa-users text-indigo-600"></i><span>Teams: Encuesta de inicio en Canal General</span>`;
        badgeCons.innerHTML = `<i class="fa-solid fa-book-open text-indigo-600"></i><span>Teams: Class Notebook (Bloc de Notas)</span>`;
        badgeConsol.innerHTML = `<i class="fa-solid fa-square-check text-indigo-600"></i><span>Teams: Tarea con Rúbrica Cualitativa</span>`;
      } else if (tech === 'Canvas') {
        badgeAct.innerHTML = `<i class="fa-solid fa-bullhorn text-red-600"></i><span>Canvas LMS: Foro 'Saberes Previos'</span>`;
        badgeCons.innerHTML = `<i class="fa-solid fa-file-powerpoint text-red-600"></i><span>Canvas LMS: Módulo Interactivo con audio</span>`;
        badgeConsol.innerHTML = `<i class="fa-solid fa-graduation-cap text-red-600"></i><span>Canvas LMS: Cuestionario corto con feedback</span>`;
      } else if (tech === 'Gamification') {
        badgeAct.innerHTML = `<i class="fa-solid fa-gamepad text-emerald-600"></i><span>Mentimeter: Nube de palabras de la semana</span>`;
        badgeCons.innerHTML = `<i class="fa-solid fa-puzzle-piece text-emerald-600"></i><span>Educaplay: Crucigrama o mapa interactivo</span>`;
        badgeConsol.innerHTML = `<i class="fa-solid fa-trophy text-emerald-600"></i><span>Quizizz: Evaluación a ritmo del estudiante</span>`;
      } else {
        badgeAct.innerHTML = `<i class="fa-solid fa-laptop text-amber-600"></i><span>Ecosistema Eight: Mentimeter / Teams</span>`;
        badgeCons.innerHTML = `<i class="fa-solid fa-display text-blue-600"></i><span>Ecosistema Eight: Genially / Class Notebook</span>`;
        badgeConsol.innerHTML = `<i class="fa-solid fa-chart-line text-emerald-600"></i><span>Ecosistema Eight: Quizizz / Canvas LMS</span>`;
      }
    }

    let cloudSaveTimer = null;

    function getPlannerCloudPayload() {
      let mappingFileName = '';
      try { mappingFileName = localStorage.getItem('eight_mapping_file_2026') || ''; } catch(e) {}
      return {
        curriculumDatabase,
        currentWeekIndex,
        mappingFileName,
        selectedGrade: document.getElementById('select-grade')?.value || '',
        selectedSubject: document.getElementById('select-subject')?.value || ''
      };
    }

    function scheduleCloudSave() {
      clearTimeout(cloudSaveTimer);
      cloudSaveTimer = setTimeout(async () => {
        if (!window.firebasePlanner?.isConfigured?.() || !window.firebasePlanner?.getCurrentUser?.()) return;
        try {
          await window.firebasePlanner.savePlannerData(getPlannerCloudPayload());
          showSavedIndicator(true);
          const status = document.getElementById('firebase-status');
          if (status) status.innerHTML = '<i class="fa-solid fa-cloud-arrow-up mr-1"></i> Sincronizado con Firestore';
        } catch (error) {
          console.error('Cloud save error:', error);
          const status = document.getElementById('firebase-status');
          if (status) status.innerHTML = '<i class="fa-solid fa-triangle-exclamation mr-1"></i> Pendiente de sincronizar';
        }
      }, 900);
    }

    async function loadPlannerFromCloud() {
      if (!window.firebasePlanner?.getCurrentUser?.()) return;
      try {
        const remote = await window.firebasePlanner.loadPlannerData();
        if (!remote || !Array.isArray(remote.curriculumDatabase) || remote.curriculumDatabase.length === 0) {
          await window.firebasePlanner.savePlannerData(getPlannerCloudPayload());
          return;
        }
        curriculumDatabase = remote.curriculumDatabase;
        currentWeekIndex = Math.max(0, Math.min(Number(remote.currentWeekIndex || 0), curriculumDatabase.length - 1));
        try {
          localStorage.setItem('eight_curriculum_plan_2026', JSON.stringify(curriculumDatabase));
          if (remote.mappingFileName) localStorage.setItem('eight_mapping_file_2026', remote.mappingFileName);
        } catch(e) {}
        renderWeekDropdown();
        document.getElementById('week-select').value = currentWeekIndex;
        renderCurrentWeekData();
        renderMapeoTable();
        restoreMappingUploadStatus();
        showModal('Datos sincronizados', 'Se cargaron tus planificaciones y Mapeo guardados en Firestore.');
      } catch (error) {
        console.error('Cloud load error:', error);
        showModal('No se pudo sincronizar', 'La app seguirá usando el respaldo de este dispositivo. Revisa Firebase y tu conexión a internet.');
      }
    }

    function updateFirebaseStatusUI(user = window.firebasePlanner?.getCurrentUser?.()) {
      const status = document.getElementById('firebase-status');
      const loginBtn = document.getElementById('firebase-login-btn');
      const logoutBtn = document.getElementById('firebase-logout-btn');
      if (!status) return;

      if (!window.firebasePlanner?.isConfigured?.()) {
        status.className = 'text-[10px] font-bold text-amber-300 bg-amber-950/50 border border-amber-800 px-2 py-1 rounded-lg';
        status.innerHTML = '<i class="fa-solid fa-database mr-1"></i> Configura Firebase';
        loginBtn?.classList.remove('hidden');
        logoutBtn?.classList.add('hidden');
        return;
      }

      if (user) {
        status.className = 'text-[10px] font-bold text-emerald-300 bg-emerald-950/50 border border-emerald-800 px-2 py-1 rounded-lg';
        status.innerHTML = `<i class="fa-solid fa-cloud mr-1"></i> ${user.displayName || user.email}`;
        loginBtn?.classList.add('hidden');
        logoutBtn?.classList.remove('hidden');
      } else {
        status.className = 'text-[10px] font-bold text-sky-300 bg-sky-950/50 border border-sky-800 px-2 py-1 rounded-lg';
        status.innerHTML = '<i class="fa-solid fa-cloud mr-1"></i> Nube disponible';
        loginBtn?.classList.remove('hidden');
        logoutBtn?.classList.add('hidden');
      }
    }

    async function loginTeacher() {
      if (!window.firebasePlanner?.isConfigured?.()) {
        showModal('Configura Firebase', 'Abre js/firebase-config.js y pega la configuración Web que te entrega Firebase Console.');
        return;
      }
      try {
        await window.firebasePlanner.loginWithGoogle();
      } catch (error) {
        console.error(error);
        showModal('No se pudo iniciar sesión', error.message || 'Revisa la configuración de Firebase Authentication.');
      }
    }

    async function logoutTeacher() {
      try {
        await window.firebasePlanner?.logout?.();
        showModal('Sesión cerrada', 'Los datos locales siguen disponibles en este dispositivo.');
      } catch (error) {
        console.error(error);
      }
    }

    window.addEventListener('firebase-ready', () => updateFirebaseStatusUI());
    window.addEventListener('firebase-auth-changed', async (event) => {
      const user = event.detail?.user || null;
      updateFirebaseStatusUI(user);
      if (user) await loadPlannerFromCloud();
    });

    function saveCurrentState() {
      const data = curriculumDatabase[currentWeekIndex];
      if (!data) return;

      data.activation = document.getElementById('erca-activation').value;
      data.anticipation = document.getElementById('erca-anticipation').value;
      data.construction = document.getElementById('erca-construction').value;
      data.consolidation = document.getElementById('erca-consolidation').value;
      // Compatibilidad con respaldos anteriores
      data.act = data.anticipation;
      data.cons = data.construction;
      data.consol = data.consolidation;
      data.neeNotes = document.getElementById('nee-custom-notes').value;

      if (editingMappingMode) {
        const editDcd = document.getElementById('edit-dcd-input');
        const editComp = document.getElementById('edit-comp-input');
        const editTheme = document.getElementById('edit-theme-input');

        if (editDcd) data.dcd = editDcd.value;
        if (editComp) data.comp = editComp.value;
        if (editTheme) data.tema = editTheme.value;
      }

      try {
        localStorage.setItem('eight_curriculum_plan_2026', JSON.stringify(curriculumDatabase));
        showSavedIndicator(false);
        scheduleCloudSave();
      } catch(e){}
    }

    function showSavedIndicator(cloud = false) {
      const ind = document.getElementById('saved-indicator');
      if (ind) {
        ind.innerHTML = cloud
          ? '<i class="fa-solid fa-cloud-arrow-up"></i> Guardado en nube'
          : '<i class="fa-solid fa-floppy-disk"></i> Guardado local';
        ind.classList.remove('hidden');
        setTimeout(() => ind.classList.add('hidden'), 2200);
      }
    }

    function loadFromLocalStorage() {
      try {
        const saved = localStorage.getItem('eight_curriculum_plan_2026');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            curriculumDatabase = parsed;
          }
        }
      } catch(e){}
    }

    function resetCurrentWeek() {
      localStorage.removeItem('eight_curriculum_plan_2026');
      localStorage.removeItem('eight_mapping_file_2026');
      location.reload();
    }

    function toggleEditMapping() {
      editingMappingMode = !editingMappingMode;
      const btnText = document.getElementById('edit-btn-text');
      if (editingMappingMode) {
        btnText.textContent = "Guardar Cambios";
      } else {
        saveCurrentState();
        btnText.textContent = "Editar Mapeo";
        renderWeekDropdown();
        renderMapeoTable();
        showModal("Mapeo Actualizado", "Los cambios en la DCD han sido guardados correctamente.");
      }
      renderCurrentWeekData();
    }

    function renderMapeoTable() {
      const tbody = document.getElementById('mapeo-table-body');
      tbody.innerHTML = '';

      curriculumDatabase.forEach((item, idx) => {
        const tr = document.createElement('tr');
        tr.className = "hover:bg-slate-50 transition-colors";
        tr.innerHTML = `
          <td class="p-3 font-extrabold text-indigo-600">${item.sem}</td>
          <td class="p-3">
            <span class="font-bold text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 block w-max">${item.trimestre}</span>
            <span class="text-[10px] font-semibold text-purple-600">${item.unidad}</span>
          </td>
          <td class="p-3 font-medium text-slate-500">${item.fechas}</td>
          <td class="p-3 font-bold text-slate-800">${item.tema}</td>
          <td class="p-3 font-medium text-slate-600 whitespace-pre-line">${item.dcd}</td>
          <td class="p-3">
            <button onclick="selectWeekFromTable(${idx})" class="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg border border-indigo-200 transition-all text-[11px]">
              Ver Plan
            </button>
          </td>
        `;
        tbody.appendChild(tr);
      });
    }

    function filterMapeoTable() {
      const query = document.getElementById('mapeo-search').value.toLowerCase();
      const rows = document.querySelectorAll('#mapeo-table-body tr');
      rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(query) ? '' : 'none';
      });
    }

    function selectWeekFromTable(idx) {
      currentWeekIndex = idx;
      document.getElementById('week-select').value = idx;
      renderCurrentWeekData();
      switchTab('tab-erca');
    }

    async function executeGeminiCall() {
      const promptInput = document.getElementById('ai-prompt-input').value.trim();
      if (!promptInput) {
        showModal("Campo Vacío", "Por favor ingresa una instrucción o selecciona una sugerencia rápida.");
        return;
      }

      const loading = document.getElementById('ai-loading');
      const responseBox = document.getElementById('ai-response-container');
      const responseText = document.getElementById('ai-response-text');

      loading.classList.remove('hidden');
      responseBox.classList.add('hidden');

      const systemPrompt = "Eres un Asistente Pedagógico Experto del modelo Eight Academy en Ecuador. Generas ciclos de aprendizaje con Activación, Anticipación, Construcción y Consolidación y alineadas con el currículo del Ministerio de Educación de Ecuador. Responde con lenguaje profesional, claro, estructurado y listo para ser utilizado por docentes.";
      
      const currentData = curriculumDatabase[currentWeekIndex];
      const fullQuery = `Contexto Actual:\nAsignatura: ${currentData.subject}\nSemana: ${currentData.sem}\nTema: ${currentData.tema}\nDCD: ${currentData.dcd}\n\nInstrucción del Docente: ${promptInput}`;

      const apiKey = "";
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3-flash-preview:generateContent?key=${apiKey}`;

      const payload = {
        contents: [{ parts: [{ text: fullQuery }] }],
        systemInstruction: { parts: [{ text: systemPrompt }] }
      };

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        const result = await response.json();
        const candidateText = result.candidates?.[0]?.content?.parts?.[0]?.text;

        if (candidateText) {
          responseText.textContent = candidateText;
          responseBox.classList.remove('hidden');
        } else {
          responseText.textContent = "No se pudo obtener una respuesta estructurada. Intenta nuevamente.";
          responseBox.classList.remove('hidden');
        }
      } catch (err) {
        responseText.textContent = "Error de conexión al servidor de Inteligencia Artificial Gemini. Revisa la conectividad a internet.";
        responseBox.classList.remove('hidden');
      } finally {
        loading.classList.add('hidden');
      }
    }

    function setPromptTemplate(type) {
      const data = curriculumDatabase[currentWeekIndex];
      const input = document.getElementById('ai-prompt-input');

      if (type === 'erca') {
        input.value = `Diseña un ciclo de aprendizaje detallado para el tema "${data.tema}" con Activación, Anticipación, Construcción y Consolidación. Incluye tiempos y una herramienta tecnológica pertinente.`;
      } else if (type === 'rubric') {
        input.value = `Crea una rúbrica analítica de 4 niveles (Excelente, Bueno, En Proceso, Iniciado) para evaluar el producto de la semana "${data.tema}".`;
      } else if (type === 'nee') {
        input.value = `Propón 3 adaptaciones metodológicas DUA para un estudiante con TDAH durante la Construcción del tema "${data.tema}".`;
      }
    }

    function requestAIGeneration(phase) {
      switchTab('tab-ia');
      const data = curriculumDatabase[currentWeekIndex];
      const input = document.getElementById('ai-prompt-input');

      if (phase === 'act') {
        input.value = `Sugiere 2 actividades innovadoras de Activación o Anticipación para iniciar el tema "${data.tema}".`;
      } else if (phase === 'cons') {
        input.value = `Diseña una actividad de Construcción para el tema "${data.tema}", utilizando un organizador gráfico o recurso manipulativo/digital.`;
      } else if (phase === 'consol') {
        input.value = `Sugiere una actividad de Consolidación para el tema "${data.tema}", con un reto, producto o ticket de salida.`;
      }

      executeGeminiCall();
    }

    function detectAndLoadAcademicWeek() {
      const today = new Date();
      const year = today.getFullYear();
      const banner = document.getElementById('current-week-banner');
      const academicStart = new Date(2026, 8, 7); // 07 Sep 2026

      if (year === 2026 || year === 2027) {
        const diffTime = Math.abs(today - academicStart);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        let estimatedWeek = Math.ceil(diffDays / 7);
        if (estimatedWeek < 1) estimatedWeek = 1;
        if (estimatedWeek > 40) estimatedWeek = 40;

        currentWeekIndex = estimatedWeek - 1;
        banner.innerHTML = `<i class="fa-solid fa-circle-check text-emerald-400 mr-1"></i> Sincronizado: Semana ${estimatedWeek} lectiva (${today.toLocaleDateString()})`;
      } else {
        currentWeekIndex = 0;
        banner.innerHTML = `<i class="fa-solid fa-circle-info text-amber-300 mr-1"></i> Modo Simulación Lectiva 2026-2027 | Semana activa: 1`;
      }

      document.getElementById('week-select').value = currentWeekIndex;
      renderCurrentWeekData();
    }

    function goToCurrentAcademicWeek() {
      detectAndLoadAcademicWeek();
      showModal("Sincronización de Fecha", "Te has desplazado a la semana correspondiente según el calendario lectivo 2026-2027.");
    }

    function normalizeHeader(value) {
      return String(value ?? '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/\n/g, ' ')
        .replace(/[^a-z0-9]+/g, ' ')
        .trim();
    }

    function findHeaderIndex(headers, aliases) {
      const normalized = headers.map(normalizeHeader);
      for (const alias of aliases) {
        const a = normalizeHeader(alias);
        let idx = normalized.findIndex(h => h === a);
        if (idx !== -1) return idx;
        idx = normalized.findIndex(h => h.includes(a) || a.includes(h));
        if (idx !== -1) return idx;
      }
      return -1;
    }

    function detectHeaderRow(rows) {
      const headerWords = ['semana', 'tema', 'dcd', 'destreza', 'unidad', 'trimestre', 'fecha', 'competencia'];
      let bestIndex = 0;
      let bestScore = -1;
      rows.slice(0, 15).forEach((row, idx) => {
        const text = (row || []).map(normalizeHeader).join(' | ');
        const score = headerWords.reduce((sum, word) => sum + (text.includes(word) ? 1 : 0), 0);
        if (score > bestScore) {
          bestScore = score;
          bestIndex = idx;
        }
      });
      return bestIndex;
    }

    function buildAdaptiveERCA(item) {
      const tema = (item.tema || 'el contenido de la semana').trim();
      const subject = (item.subject || document.getElementById('select-subject')?.value || '').toLowerCase();
      const grade = Number(item.grade || document.getElementById('select-grade')?.value || 4);
      const key = tema.toLowerCase();
      const nivel = grade <= 4
        ? 'con instrucciones breves, apoyo visual y ejemplos concretos'
        : 'con retos progresivos, explicación razonada y mayor autonomía';

      let activation, anticipation, construction, consolidation;

      if (subject.includes('mat') || /fracci|decimal|multiplica|divisi|suma|resta|geometr|área|area|perímet|perimet|mcm|mcd|número|numero|secuencia|porcent|medida|estadíst|estadist/.test(key)) {
        activation = `Reto relámpago de 5 minutos sobre “${tema}”: presentar una situación cotidiana o imagen-problema y pedir al grupo que proponga posibles soluciones, ${nivel}.`;
        anticipation = `Recuperar saberes previos de “${tema}” con 3 preguntas graduadas. Los estudiantes comparan estrategias en parejas y registran una predicción o procedimiento inicial.`;
        construction = `Modelar paso a paso “${tema}” con ejemplos visuales, material concreto o pizarra digital. Resolver un ejemplo junto al grupo, verbalizar el procedimiento y continuar con 2 ejercicios guiados, ${nivel}.`;
        consolidation = `Resolver un reto de aplicación sobre “${tema}” de manera individual o en parejas. Cerrar con un ticket de salida de 2 ítems: uno práctico y otro para explicar cómo comprobar la respuesta.`;
      } else if (subject.includes('leng') || /cuento|texto|lectura|escrit|oración|oracion|párrafo|parrafo|opinión|opinion|narr|poes|comunic|vocab|gramát|gramat/.test(key)) {
        activation = `Presentar una imagen, frase, audio breve o situación sorpresa relacionada con “${tema}”. Cada estudiante expresa en una palabra qué cree que descubrirá durante la clase.`;
        anticipation = `Aplicar una rutina breve como “Veo – Pienso – Me pregunto” o una lluvia de ideas sobre “${tema}”, recuperando vocabulario, experiencias y conocimientos previos.`;
        construction = `Trabajar un ejemplo modelo de “${tema}” mediante lectura, análisis, conversación o escritura guiada. Identificar elementos principales, construir un organizador visual y desarrollar una producción breve, ${nivel}.`;
        consolidation = `Aplicar lo aprendido en una producción corta relacionada con “${tema}”: escribir, ordenar, explicar, dramatizar o responder. Finalizar con una autoevaluación breve sobre lo comprendido y lo que aún necesita práctica.`;
      } else if (subject.includes('natur') || /animal|planta|cuerpo|ecosistema|materia|energ|agua|tierra|ciencia|salud|ambiente|seres vivos/.test(key)) {
        activation = `Mostrar un fenómeno, objeto, fotografía o demostración breve relacionada con “${tema}” y formular una pregunta provocadora para despertar curiosidad.`;
        anticipation = `Registrar ideas iniciales sobre “${tema}” en una tabla “Lo que sé / lo que creo / lo que quiero comprobar” y seleccionar una pregunta para explorar.`;
        construction = `Explorar “${tema}” mediante observación, explicación guiada, clasificación, modelo o mini-experimento seguro. Organizar los hallazgos en un esquema y contrastar las ideas iniciales, ${nivel}.`;
        consolidation = `Resolver una situación de aplicación de “${tema}” y elaborar una conclusión breve con evidencia. Cerrar explicando dónde puede observarse este aprendizaje en la vida cotidiana.`;
      } else if (subject.includes('social') || /historia|comunidad|ecuador|provincia|mapa|derecho|cultura|sociedad|geograf|ciudadan/.test(key)) {
        activation = `Proyectar una imagen, mapa, objeto o fuente visual vinculada con “${tema}” y pedir al grupo que identifique pistas sobre lugar, época, actores o contexto.`;
        anticipation = `Construir colectivamente un mapa de ideas sobre “${tema}”: qué sabemos, qué lugares o personajes reconocemos y qué preguntas queremos responder.`;
        construction = `Analizar “${tema}” mediante mapas, líneas de tiempo, imágenes, testimonios o una lectura breve. Comparar información y completar un organizador visual, ${nivel}.`;
        consolidation = `Realizar un reto de interpretación sobre “${tema}”: ubicar, ordenar, comparar, relacionar causas y consecuencias o explicar una situación con evidencia.`;
      } else if (subject.includes('ingles')) {
        activation = `Iniciar con imágenes, gestos, audio o un mini juego oral relacionado con “${tema}” para activar vocabulario de manera rápida y significativa.`;
        anticipation = `Recuperar vocabulario previo sobre “${tema}” mediante flashcards, preguntas cortas, clasificación de imágenes o una dinámica de “What do you remember?”.`;
        construction = `Modelar vocabulario y estructuras de “${tema}” con ejemplos orales y visuales. Practicar primero en grupo, luego en parejas y finalmente realizar una tarea breve de comprensión o producción, ${nivel}.`;
        consolidation = `Completar un reto comunicativo sobre “${tema}”: diálogo corto, matching, mini quiz, descripción oral o exit ticket con vocabulario clave de la semana.`;
      } else if (subject === 'eca') {
        activation = `Presentar una obra, imagen, ritmo, objeto artístico o estímulo visual relacionado con “${tema}” y recoger reacciones espontáneas del grupo.`;
        anticipation = `Conversar sobre experiencias previas vinculadas con “${tema}” e identificar colores, formas, sonidos, movimientos, materiales o emociones que puedan utilizarse.`;
        construction = `Explorar “${tema}” mediante demostración docente y creación guiada. Los estudiantes experimentan con materiales o recursos digitales y desarrollan una producción propia, ${nivel}.`;
        consolidation = `Realizar una mini galería o presentación de los productos de “${tema}”. Cada estudiante explica una decisión creativa y registra una breve reflexión sobre su proceso.`;
      } else if (subject.includes('educacionfisica')) {
        activation = `Realizar una activación corporal breve vinculada con “${tema}”, usando movimientos simples y seguros que preparen al grupo para la actividad principal.`;
        anticipation = `Explorar qué conoce el grupo sobre “${tema}” mediante preguntas rápidas, demostraciones corporales y reconocimiento de reglas o movimientos básicos.`;
        construction = `Practicar “${tema}” mediante estaciones o secuencias progresivas: demostración, ensayo guiado, práctica en parejas o equipos y retroalimentación inmediata, ${nivel}.`;
        consolidation = `Cerrar con un reto motor breve relacionado con “${tema}”, seguido de una reflexión sobre estrategia, cooperación, autocuidado y mejora personal.`;
      } else {
        activation = `Iniciar con una dinámica breve, imagen o pregunta sorpresa relacionada directamente con “${tema}” para despertar curiosidad y conectar el contenido con una situación cercana.`;
        anticipation = `Explorar conocimientos previos sobre “${tema}” mediante preguntas, predicciones y una lluvia de ideas. Registrar qué sabe el grupo y qué necesita descubrir.`;
        construction = `Desarrollar “${tema}” con explicación guiada, ejemplo modelado, participación del grupo y práctica acompañada, ${nivel}.`;
        consolidation = `Aplicar “${tema}” en un reto o producto breve y comprobar el aprendizaje mediante una evidencia concreta: respuesta razonada, ejercicio, organizador, demostración o ticket de salida.`;
      }

      return { activation, anticipation, construction, consolidation, act: anticipation, cons: construction, consol: consolidation };
    }

    function ensureWeeklyActivities(item, force = false) {
      const generated = buildAdaptiveERCA(item);
      if (force || !item.activation) item.activation = generated.activation;
      if (force || !item.anticipation) item.anticipation = (!force && item.act) ? item.act : generated.anticipation;
      if (force || !item.construction) item.construction = (!force && item.cons) ? item.cons : generated.construction;
      if (force || !item.consolidation) item.consolidation = (!force && item.consol) ? item.consol : generated.consolidation;
      item.act = item.anticipation;
      item.cons = item.construction;
      item.consol = item.consolidation;
    }

    function generatePhaseActivity(phase) {
      const data = curriculumDatabase[currentWeekIndex];
      if (!data) return;

      data.grade = Number(document.getElementById('select-grade')?.value || data.grade || 4);
      data.subject = document.getElementById('select-subject')?.value || data.subject || 'Lengua';

      const base = buildAdaptiveERCA(data);
      const tema = (data.tema || 'el tema semanal').trim();
      const grade = data.grade;
      const subject = getSubjectLabel();

      const extras = {
        construction: [
          `${base.construction}\n\nProducto guiado: elaborar una evidencia breve sobre “${tema}” que pueda revisarse durante la clase. Materiales sugeridos: cuaderno, pizarra digital, tarjetas o recurso manipulativo disponible.`,
          `${base.construction}\n\nOrganización sugerida: 5 min de modelado docente + 10 min de práctica acompañada + 8 min de trabajo en parejas + 2 min de retroalimentación rápida.`,
          `${base.construction}\n\nReto de construcción para ${grade}.º EGB (${subject}): presentar un ejemplo resuelto parcialmente para que el grupo complete, explique y compare diferentes formas de llegar a la respuesta.`
        ],
        consolidation: [
          `${base.consolidation}\n\nEvidencia: cada estudiante entrega una respuesta o producto breve que demuestre lo aprendido sobre “${tema}”.`,
          `${base.consolidation}\n\nCierre gamificado: realizar 4 preguntas rápidas, asignar un punto por justificación correcta y terminar con la frase “Hoy descubrí que…”.`,
          `${base.consolidation}\n\nTransferencia: plantear una situación nueva relacionada con “${tema}” para que el estudiante aplique lo aprendido sin repetir exactamente el ejemplo trabajado.`
        ]
      };

      const options = extras[phase];
      if (!options) return;
      const text = options[Math.floor(Math.random() * options.length)];

      if (phase === 'construction') {
        data.construction = text;
        data.cons = text;
        document.getElementById('erca-construction').value = text;
      } else {
        data.consolidation = text;
        data.consol = text;
        document.getElementById('erca-consolidation').value = text;
      }

      saveCurrentState();
      showModal("Actividad generada", `Se creó una nueva actividad de ${phase === 'construction' ? 'Construcción' : 'Consolidación'} para “${tema}”, considerando ${getGradeLabel()} y ${subject}.`);
    }

    function mappingRowsToCurriculum(rows, fileName) {
      if (!Array.isArray(rows) || rows.length === 0) return [];

      const headerRowIndex = detectHeaderRow(rows);
      const headers = rows[headerRowIndex] || [];

      const col = {
        sem: findHeaderIndex(headers, ['semana', 'sem', 'n semana', 'numero de semana']),
        subject: findHeaderIndex(headers, ['asignatura', 'materia', 'area']),
        trimestre: findHeaderIndex(headers, ['trimestre', 'periodo', 'quimestre']),
        unidad: findHeaderIndex(headers, ['unidad', 'unidad didactica']),
        fechas: findHeaderIndex(headers, ['fechas lectivas', 'fecha', 'fechas', 'rango de fechas']),
        per: findHeaderIndex(headers, ['periodos', 'periodos semanales', 'horas', 'carga horaria']),
        tema: findHeaderIndex(headers, ['tema principal', 'tema', 'contenido', 'contenidos', 'contenido esencial']),
        grade: findHeaderIndex(headers, ['grado', 'curso', 'año', 'ano', 'nivel']),
        dcd: findHeaderIndex(headers, ['dcd', 'destreza con criterio de desempeno', 'destrezas con criterios de desempeno', 'destreza', 'destrezas']),
        comp: findHeaderIndex(headers, ['competencias', 'competencia', 'competencias afectadas', 'criterio de evaluacion']),
        activation: findHeaderIndex(headers, ['activacion', 'activación', 'inicio', 'enganche']),
        anticipation: findHeaderIndex(headers, ['anticipacion', 'anticipación', 'experiencia', 'saberes previos', 'erca experiencia']),
        construction: findHeaderIndex(headers, ['construccion', 'construcción', 'conceptualizacion', 'conceptualización', 'desarrollo', 'erca conceptualizacion']),
        consolidation: findHeaderIndex(headers, ['consolidacion', 'consolidación', 'aplicacion', 'aplicación', 'transferencia', 'erca aplicacion'])
      };

      // Si no se reconoce ningún encabezado curricular clave, mantenemos compatibilidad
      // con el formato anterior: Semana=A, Tema=D, DCD=E.
      if (col.sem === -1 && col.tema === -1 && col.dcd === -1) {
        col.sem = 0;
        col.tema = 3;
        col.dcd = 4;
      }

      const imported = [];
      let autoWeek = 1;
      for (let r = headerRowIndex + 1; r < rows.length; r++) {
        const row = rows[r] || [];
        if (!row.some(v => String(v ?? '').trim())) continue;

        let sem = col.sem >= 0 ? parseInt(row[col.sem], 10) : autoWeek;
        if (isNaN(sem)) sem = autoWeek;

        const tema = col.tema >= 0 ? String(row[col.tema] ?? '').trim() : '';
        const dcd = col.dcd >= 0 ? String(row[col.dcd] ?? '').trim() : '';
        if (!tema && !dcd) continue;

        const item = {
          sem,
          subject: col.subject >= 0 && row[col.subject] ? String(row[col.subject]).trim() : document.getElementById('select-subject').value,
          trimestre: col.trimestre >= 0 && row[col.trimestre] ? String(row[col.trimestre]).trim() : (sem <= 13 ? 'PRIMER TRIMESTRE' : sem <= 27 ? 'SEGUNDO TRIMESTRE' : 'TERCER TRIMESTRE'),
          unidad: col.unidad >= 0 && row[col.unidad] ? String(row[col.unidad]).trim() : `U${Math.ceil(sem / 7)}`,
          fechas: col.fechas >= 0 && row[col.fechas] ? String(row[col.fechas]).trim() : `Semana ${sem} (2026-2027)`,
          per: col.per >= 0 && row[col.per] ? String(row[col.per]).trim() : '6',
          tema: tema || `Contenido curricular - Semana ${sem}`,
          grade: col.grade >= 0 ? (parseInt(String(row[col.grade] ?? '').match(/\d+/)?.[0] || '4', 10)) : Number(document.getElementById('select-grade')?.value || 4),
          dcd: dcd || 'Destreza no especificada en el archivo importado.',
          comp: col.comp >= 0 && row[col.comp] ? String(row[col.comp]).trim() : 'Competencias alineadas al mapeo del docente',
          sourceMapping: fileName
        };

        const adaptive = buildAdaptiveERCA(item);
        item.activation = col.activation >= 0 && row[col.activation] ? String(row[col.activation]).trim() : adaptive.activation;
        item.anticipation = col.anticipation >= 0 && row[col.anticipation] ? String(row[col.anticipation]).trim() : adaptive.anticipation;
        item.construction = col.construction >= 0 && row[col.construction] ? String(row[col.construction]).trim() : adaptive.construction;
        item.consolidation = col.consolidation >= 0 && row[col.consolidation] ? String(row[col.consolidation]).trim() : adaptive.consolidation;
        item.act = item.anticipation;
        item.cons = item.construction;
        item.consol = item.consolidation;

        imported.push(item);
        autoWeek = Math.max(autoWeek + 1, sem + 1);
      }

      imported.sort((a, b) => a.sem - b.sem);
      return imported;
    }

    function applyImportedMapping(imported, fileName) {
      if (!Array.isArray(imported) || imported.length === 0) {
        showModal('Mapeo no reconocido', 'No encontré filas con Tema o DCD/Destreza. Revisa los encabezados del archivo.');
        return;
      }

      curriculumDatabase = imported;
      currentWeekIndex = 0;
      try {
        localStorage.setItem('eight_curriculum_plan_2026', JSON.stringify(curriculumDatabase));
        localStorage.setItem('eight_mapping_file_2026', fileName);
      } catch(e) {}

      if (window.firebasePlanner?.getCurrentUser?.()) {
        window.firebasePlanner.saveMappingSnapshot(fileName, imported).catch(console.error);
        scheduleCloudSave();
      }

      renderWeekDropdown();
      document.getElementById('week-select').value = 0;
      renderCurrentWeekData();
      renderMapeoTable();

      const status = document.getElementById('mapping-upload-status');
      const statusText = document.getElementById('mapping-upload-status-text');
      if (status && statusText) {
        statusText.textContent = `${fileName} · ${imported.length} semanas/contenidos cargados`;
        status.classList.remove('hidden');
      }

      showModal('Mapeo aplicado correctamente', `La aplicación se adaptó a ${imported.length} registros de “${fileName}”. Los temas, DCD, unidades, fechas, competencias y actividades ERCA disponibles ahora se basan en este Mapeo.`);
    }


    function openMappingFilePicker() {
      const input = document.getElementById('excel-file-input');
      if (!input) {
        showModal('Selector no disponible', 'No se encontró el control para seleccionar el archivo.');
        return;
      }
      // Permite volver a seleccionar el mismo archivo consecutivamente.
      input.value = '';
      try {
        input.click();
      } catch (err) {
        console.error(err);
        showModal('No se pudo abrir Archivos', 'Toca nuevamente el botón o abre esta aplicación desde Safari/Chrome.');
      }
    }

    function handleFileUpload(event) {
      const file = event?.target?.files?.[0];
      if (!file) {
        showModal('Sin archivo seleccionado', 'No se seleccionó ningún archivo. Puedes usar Excel, CSV o JSON.');
        return;
      }

      const extension = (file.name.split('.').pop() || '').toLowerCase();
      const allowed = ['xlsx', 'xls', 'csv', 'json'];
      if (!allowed.includes(extension)) {
        showModal('Formato no compatible', 'Selecciona un archivo Excel (.xlsx o .xls), CSV (.csv) o JSON (.json).');
        event.target.value = '';
        return;
      }

      const status = document.getElementById('mapping-upload-status');
      const statusText = document.getElementById('mapping-upload-status-text');
      if (status && statusText) {
        statusText.textContent = `Leyendo ${file.name}...`;
        status.classList.remove('hidden');
      }

      if (extension === 'json') {
        const reader = new FileReader();
        reader.onload = function(e) {
          try {
            const data = JSON.parse(e.target.result);
            let imported = [];
            if (Array.isArray(data)) {
              if (data.length && Array.isArray(data[0])) imported = mappingRowsToCurriculum(data, file.name);
              else imported = data.map((item, idx) => {
                const normalized = {
                  sem: Number(item.sem ?? item.semana ?? idx + 1),
                  subject: item.subject ?? item.asignatura ?? document.getElementById('select-subject').value,
                  trimestre: item.trimestre ?? item.periodo ?? 'TRIMESTRE',
                  unidad: item.unidad ?? `U${Math.ceil((idx + 1) / 7)}`,
                  fechas: item.fechas ?? item.fecha ?? `Semana ${idx + 1} (2026-2027)`,
                  per: String(item.per ?? item.periodos ?? 6),
                  tema: item.tema ?? item.contenido ?? '',
                  dcd: item.dcd ?? item.destreza ?? '',
                  comp: item.comp ?? item.competencias ?? 'Competencias alineadas al mapeo del docente',
                  sourceMapping: file.name
                };
                const adaptive = buildAdaptiveERCA(normalized);
                normalized.activation = item.activation ?? item.activacion ?? adaptive.activation;
                normalized.anticipation = item.anticipation ?? item.anticipacion ?? item.experiencia ?? item.act ?? adaptive.anticipation;
                normalized.construction = item.construction ?? item.construccion ?? item.conceptualizacion ?? item.cons ?? adaptive.construction;
                normalized.consolidation = item.consolidation ?? item.consolidacion ?? item.aplicacion ?? item.consol ?? adaptive.consolidation;
                normalized.act = normalized.anticipation;
                normalized.cons = normalized.construction;
                normalized.consol = normalized.consolidation;
                return normalized;
              }).filter(i => i.tema || i.dcd);
            }
            applyImportedMapping(imported, file.name);
          } catch(err) {
            showModal('Error de Formato', 'No se pudo interpretar el JSON como un Mapeo de contenidos compatible.');
          }
        };
        reader.readAsText(file);
        return;
      }

      if (typeof XLSX === 'undefined') {
        showModal('Lector de Excel no disponible', 'No se pudo cargar el componente necesario para leer Excel/CSV. Verifica que el dispositivo tenga conexión a internet y vuelve a abrir la aplicación. Los archivos JSON sí pueden cargarse sin este componente.');
        return;
      }

      const reader = new FileReader();
      reader.onload = function(e) {
        try {
          let workbook;
          if (extension === 'csv') {
            workbook = XLSX.read(e.target.result, { type: 'string' });
          } else {
            const data = new Uint8Array(e.target.result);
            workbook = XLSX.read(data, { type: 'array' });
          }

          let imported = [];
          workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
            const sheetImported = mappingRowsToCurriculum(rows, file.name);
            imported = imported.concat(sheetImported);
          });

          // Evita duplicados cuando un libro contiene hojas auxiliares repetidas.
          const seen = new Set();
          imported = imported.filter(item => {
            const key = `${item.subject}|${item.sem}|${item.tema}|${item.dcd}`;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
          });

          applyImportedMapping(imported, file.name);
        } catch (err) {
          console.error(err);
          showModal('Error al leer el Mapeo', 'No se pudo interpretar el archivo. Usa Excel (.xlsx/.xls), CSV o JSON y procura incluir columnas como Semana, Tema y DCD/Destreza.');
        }
      };

      if (extension === 'csv') reader.readAsText(file);
      else reader.readAsArrayBuffer(file);
    }

    function exportPlanJSON() {
      saveCurrentState();
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(curriculumDatabase, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", "Planificacion_Curricular_EightAcademy_2026_2027.json");
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      showModal("Plan Exportado", "El respaldo completo en formato JSON se ha descargado exitosamente.");
    }

    function copyAIResponse() {
      const text = document.getElementById('ai-response-text').textContent;
      const dummy = document.createElement("textarea");
      document.body.appendChild(dummy);
      dummy.value = text;
      dummy.select();
      document.execCommand("copy");
      document.body.removeChild(dummy);
      showModal("Texto Copiado", "La propuesta de Gemini ha sido copiada al portapapeles.");
    }

    function showModal(title, body) {
      document.getElementById('modal-title').textContent = title;
      document.getElementById('modal-body').textContent = body;
      document.getElementById('custom-modal').classList.remove('hidden');
    }

    function closeModal() {
      document.getElementById('custom-modal').classList.add('hidden');
    }
