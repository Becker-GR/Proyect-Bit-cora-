// Listas Desplegables
const allDropdown = document.querySelectorAll<HTMLDetailsElement>('.custom-dropdown');

allDropdown.forEach((dropdown) => {
	const label = dropdown.querySelector('.dropdown-label');
	const options = dropdown?.querySelectorAll('.dropdown-option');

	options?.forEach((btn) => {
		btn.addEventListener('click', () => {
			const valor = btn.getAttribute('data-value') || btn.textContent?.trim() || '';
			dropdown.dataset.value = valor;

			if (label && btn.textContent) {
				label.textContent = btn.textContent.trim();
				label.classList.remove('text-slate-300', 'text-slate-400', 'font-medium');
				label.classList.add('text-teal-300', 'font-medium');
			}
			dropdown.removeAttribute('open');
		});
	});
});

document.addEventListener('click', (e) => {
	if (e.target instanceof Node) {
		allDropdown.forEach((dropdown) => {
			if (!dropdown.contains(e.target as Node)) {
				dropdown.removeAttribute('open');
			}
		});
	}
});

// Control de Notificaciones Snackbar
const mostrarSnackbar = (mensaje: string, tipo: 'exito' | 'editado' | 'error' = 'exito') => {
	window.dispatchEvent(
		new CustomEvent('mostrar-snackbar', {
			detail: { mensaje, tipo },
		})
	);
};

// Control de Confirmación de Eliminación
const confirmarBorrado = document.getElementById('confirmar-borrado');
const confirmarBorradoContenido = document.getElementById('confirmar-borrado-contenido');
const btnCancelarBorrado = document.getElementById('btn-cancelar-borrado');
const btnConfirmarBorrado = document.getElementById('btn-confirmar-borrado');
let tarjetaAEliminar: HTMLElement | null = null;

const abrirConfirmacionBorrado = (tarjeta: HTMLElement) => {
	tarjetaAEliminar?.classList.remove('ring-2', 'ring-rose-400/70');
	tarjetaAEliminar = tarjeta;
	tarjetaAEliminar.classList.add('ring-2', 'ring-rose-400/70');

	confirmarBorrado?.classList.remove('opacity-0', 'pointer-events-none');
	confirmarBorrado?.classList.add('opacity-100');
	confirmarBorradoContenido?.classList.remove('scale-95');
	confirmarBorradoContenido?.classList.add('scale-100');
};

const cerrarConfirmacionBorrado = () => {
	tarjetaAEliminar?.classList.remove('ring-2', 'ring-rose-400/70');
	tarjetaAEliminar = null;

	confirmarBorrado?.classList.remove('opacity-100');
	confirmarBorrado?.classList.add('opacity-0', 'pointer-events-none');
	confirmarBorradoContenido?.classList.remove('scale-100');
	confirmarBorradoContenido?.classList.add('scale-95');
};

confirmarBorrado?.addEventListener('click', (e) => {
	if (e.target === confirmarBorrado) cerrarConfirmacionBorrado();
});

btnCancelarBorrado?.addEventListener('click', cerrarConfirmacionBorrado);

btnConfirmarBorrado?.addEventListener('click', async () => {
	if (!tarjetaAEliminar) return;

	const id = tarjetaAEliminar.dataset.id;
	if (id) {
		try {
			btnConfirmarBorrado.textContent = 'Eliminando...';
			const res = await fetch('/api/bitacora', {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id }),
			});
			if (!res.ok) {
				const err = await res.json();
				throw new Error(err.error || 'Error al eliminar');
			}
		} catch (err: any) {
			mostrarSnackbar(`Error: ${err.message}`, 'error');
			btnConfirmarBorrado.textContent = 'Eliminar';
			return;
		} finally {
			btnConfirmarBorrado.textContent = 'Eliminar';
		}
	}

	if (tarjetaAEliminar === tarjetaEnEdicion) {
		cerrarModal();
	}

	tarjetaAEliminar.remove();
	cerrarConfirmacionBorrado();
	window.dispatchEvent(new CustomEvent('actualizar-metricas'));
	mostrarSnackbar('Tarjeta eliminada correctamente.', 'exito');
});

// Control del Modal
const modalOverlay = document.getElementById('modal-overlay');
const modalContenido = document.getElementById('modal-contenido');
const modalTitulo = document.getElementById('modal-titulo');
const btnCancelarModal = document.getElementById('btn-cancelar-modal');
const formEditor = document.getElementById('form-editor') as HTMLFormElement | null;

const btnNuevo = document.getElementById('btn-nuevo');
const btnConfirmar = document.getElementById('btn-confirmar');
const contenedor = document.getElementById('contenedor-registros');
let tarjetaEnEdicion: HTMLElement | null = null;

// Control de Evidencia Fotográfica
const inputFoto = document.getElementById('input-foto') as HTMLInputElement | null;
const previewFotoBox = document.getElementById('preview-foto-box');
const imgPreview = document.getElementById('img-preview') as HTMLImageElement | null;
const nombreFoto = document.getElementById('nombre-foto');
const btnQuitarFoto = document.getElementById('btn-quitar-foto');
let fotoActualDataUrl: string = '';

const limpiarFoto = () => {
	fotoActualDataUrl = '';
	if (inputFoto) inputFoto.value = '';
	if (imgPreview) imgPreview.src = '';
	if (nombreFoto) nombreFoto.textContent = '';
	previewFotoBox?.classList.remove('flex');
	previewFotoBox?.classList.add('hidden');
};

inputFoto?.addEventListener('change', () => {
	const file = inputFoto.files?.[0];
	if (!file) return;

	const reader = new FileReader();
	reader.onload = (e) => {
		fotoActualDataUrl = (e.target?.result as string) || '';
		if (imgPreview) imgPreview.src = fotoActualDataUrl;
		if (nombreFoto) nombreFoto.textContent = file.name;
		previewFotoBox?.classList.remove('hidden');
		previewFotoBox?.classList.add('flex');
	};
	reader.readAsDataURL(file);
});

btnQuitarFoto?.addEventListener('click', (e) => {
	e.preventDefault();
	limpiarFoto();
});

const abrirModal = (titulo = 'Registro de Mantenimiento') => {
	if (modalTitulo) modalTitulo.textContent = titulo;
	modalOverlay?.classList.remove('opacity-0', 'pointer-events-none');
	modalOverlay?.classList.add('opacity-100');
	modalContenido?.classList.remove('scale-95');
	modalContenido?.classList.add('scale-100');

	const primerInput = formEditor?.querySelector('input');
	setTimeout(() => primerInput?.focus(), 150);
};

const cerrarModal = () => {
	modalOverlay?.classList.remove('opacity-100');
	modalOverlay?.classList.add('opacity-0', 'pointer-events-none');
	modalContenido?.classList.remove('scale-100');
	modalContenido?.classList.add('scale-95');
	resetEditor();
};

const resetEditor = () => {
	tarjetaEnEdicion = null;
	limpiarFoto();

	formEditor?.querySelectorAll('input').forEach((input) => (input.value = ''));

	allDropdown.forEach((dd) => {
		delete dd.dataset.value;
		dd.removeAttribute('open');
		const label = dd.querySelector('.dropdown-label');
		if (label && dd.dataset.placeholder) {
			label.textContent = dd.dataset.placeholder;
			label.classList.remove('text-teal-300', 'font-medium');
			label.classList.add('text-slate-300');
		}
	});
};

// Helper para asignar valor a dropdowns personalizados
const setDropdownVal = (field: string, valor: string) => {
	const dd = document.querySelector<HTMLDetailsElement>(`.custom-dropdown[data-field="${field}"]`);
	if (!dd) return;
	dd.dataset.value = valor;
	const label = dd.querySelector('.dropdown-label');
	if (label) {
		label.textContent = valor;
		label.classList.remove('text-slate-300', 'text-slate-400');
		label.classList.add('text-teal-300', 'font-medium');
	}
};

// Eventos de apertura / cierre
btnNuevo?.addEventListener('click', () => {
	resetEditor();
	abrirModal('Nuevo Registro');
});

btnCancelarModal?.addEventListener('click', cerrarModal);

// Cerrar al hacer clic en el fondo borroso (fuera de la tarjeta modal)
modalOverlay?.addEventListener('click', (e) => {
	if (e.target === modalOverlay) {
		cerrarModal();
	}
});

// Delegación de eventos en las tarjetas: Editar y Borrar directos
contenedor?.addEventListener('click', (e) => {
	const target = e.target as HTMLElement;

	// 1. Botón Editar de la tarjeta (icono lápiz)
	const btnEdit = target.closest<HTMLElement>('.btn-editar-tarjeta');
	if (btnEdit) {
		const tarjeta = btnEdit.closest<HTMLElement>('.tarjeta-registro');
		if (!tarjeta) return;

		tarjetaEnEdicion = tarjeta;

		const getSlot = (slot: string) =>
			tarjetaEnEdicion?.querySelector(`[data-slot="${slot}"]`)?.textContent?.trim() || '';

		const fechaTexto = getSlot('fecha');
		const fechaInput = document.querySelector<HTMLInputElement>('input[name="fecha"]');
		if (fechaInput && fechaTexto) {
			fechaInput.value = fechaTexto.split('/').reverse().join('-');
		}

		const inputPersona = document.getElementById('input-persona') as HTMLInputElement | null;
		const inputModelo = document.getElementById('input-modelo') as HTMLInputElement | null;
		const inputSerie = document.getElementById('input-serie') as HTMLInputElement | null;

		if (inputPersona) inputPersona.value = getSlot('persona');
		if (inputModelo) inputModelo.value = getSlot('marcaModelo');
		if (inputSerie) inputSerie.value = getSlot('serie');

		setDropdownVal('sucursal', getSlot('sucursal'));
		setDropdownVal('area', getSlot('area'));
		setDropdownVal('tipoEquipo', getSlot('tipoEquipo'));
		setDropdownVal('tipoServicio', getSlot('tipoServicio'));
		setDropdownVal('estatus', getSlot('estatusTexto'));

		// Cargar foto si la tarjeta tiene una
		const imgExistente = tarjetaEnEdicion?.querySelector<HTMLImageElement>('[data-slot="evidencia"] img');
		if (imgExistente && imgExistente.src) {
			fotoActualDataUrl = imgExistente.src;
			if (imgPreview) imgPreview.src = fotoActualDataUrl;
			if (nombreFoto) nombreFoto.textContent = 'Foto adjunta';
			previewFotoBox?.classList.remove('hidden');
			previewFotoBox?.classList.add('flex');
		} else {
			limpiarFoto();
		}

		abrirModal('Editar Registro');
		return;
	}

	// 2. Botón Borrar de la tarjeta (icono bote de basura)
	const btnDel = target.closest<HTMLElement>('.btn-borrar-tarjeta');
	if (btnDel) {
		const tarjeta = btnDel.closest<HTMLElement>('.tarjeta-registro');
		if (!tarjeta) return;

		abrirConfirmacionBorrado(tarjeta);
		return;
	}
});

// Confirmar registro (Nuevo o Editado)
const getDropdownVal = (field: string) =>
	document.querySelector<HTMLElement>(`.custom-dropdown[data-field="${field}"]`)?.dataset.value || '';

btnConfirmar?.addEventListener('click', async () => {
	const fechaRaw = document.querySelector<HTMLInputElement>('input[name="fecha"]')?.value || '';
	const fecha = fechaRaw ? fechaRaw.split('-').reverse().join('/') : '';

	const registro = {
		fecha,
		sucursal: getDropdownVal('sucursal'),
		area: getDropdownVal('area'),
		persona: (document.getElementById('input-persona') as HTMLInputElement | null)?.value.trim() || '',
		tipoEquipo: getDropdownVal('tipoEquipo'),
		marcaModelo: (document.getElementById('input-modelo') as HTMLInputElement | null)?.value.trim() || '',
		serie: (document.getElementById('input-serie') as HTMLInputElement | null)?.value.trim() || '',
		tipoServicio: getDropdownVal('tipoServicio'),
		estatus: getDropdownVal('estatus'),
	};

	if (Object.values(registro).some((valor) => !valor)) {
		mostrarSnackbar('Por favor completa todos los campos antes de confirmar.', 'error');
		return;
	}

	const estilosEstatus: Record<string, { badge: string; dot: string }> = {
		'concluido': {
			badge: 'border-teal-400/40 bg-teal-400/10 text-teal-300',
			dot: 'bg-teal-400'
		},
		'concluidos': {
			badge: 'border-teal-400/40 bg-teal-400/10 text-teal-300',
			dot: 'bg-teal-400'
		},
		'en proceso': {
			badge: 'border-cyan-400/40 bg-cyan-400/10 text-cyan-300',
			dot: 'bg-cyan-400'
		},
		'pendiente': {
			badge: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
			dot: 'bg-amber-400'
		},
		'pendientes': {
			badge: 'border-amber-400/40 bg-amber-400/10 text-amber-300',
			dot: 'bg-amber-400'
		}
	};

	const llenarTarjeta = (objetivo: ParentNode, evidenciaUrl?: string | null) => {
		const setSlot = (slot: string, texto: string) => {
			const el = objetivo.querySelector(`[data-slot="${slot}"]`);
			if (el) el.textContent = texto;
		};

		setSlot('fecha', registro.fecha);
		setSlot('sucursal', registro.sucursal);
		setSlot('area', registro.area);
		setSlot('persona', registro.persona);
		setSlot('tipoEquipo', registro.tipoEquipo);
		setSlot('marcaModelo', registro.marcaModelo);
		setSlot('serie', registro.serie);
		setSlot('tipoServicio', registro.tipoServicio);
		setSlot('estatusTexto', registro.estatus);

		const estatusKey = registro.estatus.toLowerCase().trim();
		const estilo = estilosEstatus[estatusKey] || estilosEstatus['concluido'];

		const badgeEl = objetivo.querySelector<HTMLElement>('[data-slot="estatusBadge"]');
		const dotEl = objetivo.querySelector<HTMLElement>('[data-slot="estatusDot"]');

		if (badgeEl && dotEl) {
			badgeEl.className = `inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] 2xl:text-xs font-medium border ${estilo.badge}`;
			dotEl.className = `w-1.5 h-1.5 rounded-full ${estilo.dot}`;
		}

		// Slot de evidencia fotográfica
		const evidenciaEl = objetivo.querySelector<HTMLElement>('[data-slot="evidencia"]');
		if (evidenciaEl) {
			const urlFinal = evidenciaUrl || fotoActualDataUrl;
			if (urlFinal) {
				evidenciaEl.innerHTML = `<img src="${urlFinal}" alt="Evidencia" class="w-full h-full object-cover" />`;
			} else {
				evidenciaEl.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-teal-300/80"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>`;
			}
		}
	};

	// Preparar datos para enviar al servidor
	const formData = new FormData();
	formData.append('fecha', registro.fecha);
	formData.append('sucursal', registro.sucursal);
	formData.append('area', registro.area);
	formData.append('persona', registro.persona);
	formData.append('tipoEquipo', registro.tipoEquipo);
	formData.append('marcaModelo', registro.marcaModelo);
	formData.append('serie', registro.serie);
	formData.append('tipoServicio', registro.tipoServicio);
	formData.append('estatus', registro.estatus);
	formData.append('perfilTecnico', 'Admin TI');

	const archivoFoto = inputFoto?.files?.[0];
	if (archivoFoto) {
		formData.append('foto', archivoFoto);
	} else if (tarjetaEnEdicion && !fotoActualDataUrl) {
		formData.append('eliminarFoto', 'true');
	}

	const btnTextoOriginal = btnConfirmar.innerHTML;
	btnConfirmar.textContent = 'Guardando...';
	btnConfirmar.style.pointerEvents = 'none';

	try {
		if (tarjetaEnEdicion) {
			const id = tarjetaEnEdicion.dataset.id;
			if (id) formData.append('id', id);

			const res = await fetch('/api/bitacora', {
				method: 'PUT',
				body: formData,
			});
			const resData = await res.json();
			if (!res.ok) throw new Error(resData.error || 'Error al actualizar');

			llenarTarjeta(tarjetaEnEdicion, resData.data?.evidencia_url);
			tarjetaEnEdicion = null;
			mostrarSnackbar('Tarjeta actualizada correctamente.', 'editado');
		} else {
			const res = await fetch('/api/bitacora', {
				method: 'POST',
				body: formData,
			});
			const resData = await res.json();
			if (!res.ok) throw new Error(resData.error || 'Error al guardar');

			const template = document.getElementById('template-registro') as HTMLTemplateElement | null;
			if (template && contenedor) {
				const clone = template.content.cloneNode(true) as DocumentFragment;
				const tarjeta = clone.querySelector<HTMLElement>('.tarjeta-registro');
				if (tarjeta && resData.data?.id) {
					tarjeta.dataset.id = resData.data.id.toString();
				}
				llenarTarjeta(clone, resData.data?.evidencia_url);
				contenedor.prepend(clone);
				mostrarSnackbar('Tarjeta guardada correctamente en Supabase.', 'exito');
			}
		}

		window.dispatchEvent(new CustomEvent('actualizar-metricas'));
		cerrarModal();
	} catch (err: any) {
		mostrarSnackbar(`Error: ${err.message}`, 'error');
	} finally {
		btnConfirmar.innerHTML = btnTextoOriginal;
		btnConfirmar.style.pointerEvents = 'auto';
	}
});
