import Chart from 'chart.js/auto';

// - - - - - - - - - - Graficos - - - - - - - - - - -

const glowPlugin = {
	id: 'glow',
	beforeDatasetDraw(chart: any, _args: any, options: any) {
		if (options?.enabled === false) return;
		const { ctx } = chart;
		ctx.save();
		ctx.shadowColor = options?.color || 'rgba(45, 212, 191, 0.7)';
		ctx.shadowBlur = options?.blur ?? 14;
		ctx.shadowOffsetX = 0;
		ctx.shadowOffsetY = 0;
	},
	afterDatasetDraw(chart: any, _args: any, options: any) {
		if (options?.enabled === false) return;
		chart.ctx.restore();
	}
};

let chartEstatus: any = null;
let chartEquipos: any = null;
let chartTendencia: any = null;

const mesesSemestre1 = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
const mesesSemestre2 = ['Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// Semestre por defecto según la fecha actual (mes 0 a 11)
const mesActual = new Date().getMonth();
let semestreActual: 1 | 2 = mesActual < 6 ? 1 : 2;

const ctxEstatus = document.getElementById('charEstatus') as HTMLCanvasElement;
if (ctxEstatus) {
	chartEstatus = new Chart(ctxEstatus, {
		type: 'doughnut',
		data: {
			labels: ['Sin datos'],
			datasets: [{
				data: [1],
				backgroundColor: ['rgba(255, 255, 255, 0.08)'],
				borderWidth: 0,
			}]
		},
		plugins: [glowPlugin],
		options: {
			responsive: true,
			maintainAspectRatio: false,
			layout: { padding: 10 },
			plugins: {
				legend: {
					position: 'right',
					labels: {
						color: '#94a3b8',
						font: { size: 11 },
						boxWidth: 10 
					}
				},
				tooltip: {
					enabled: false
				},
				glow: {
					enabled: false,
					color: 'rgba(45, 212, 191, 0.55)',
					blur: 14
				}
			} as any,
			cutout: '60%'
		}
	});
}

const ctxEquipos = document.getElementById('charEquipos') as HTMLCanvasElement;
if (ctxEquipos) {
	chartEquipos = new Chart(ctxEquipos, {
		type: 'bar',
		data: {
			labels: ['Laptop', 'PC', 'Servidor', 'Impresora', 'Otro'],
			datasets: [{
				data: [0, 0, 0, 0, 0],
				backgroundColor: [
					'#a855f7',
					'#22d3ee',
					'#34d399',
					'#2f1095',
					'#f59e0b',
				],
				borderRadius: 5
			}]
		},
		plugins: [glowPlugin],
		options: {
			responsive: true,
			maintainAspectRatio: false,
			layout: { padding: 10 },
			plugins: {
				legend: { display: false },
				glow: {
					color: 'rgba(56, 189, 248, 0.55)',
					blur: 14
				}
			} as any,
			scales: {
				x: {
					ticks: { color: '#94a3b8', font: { size: 9 } },
					grid: { color: 'rgba(255, 255, 255, 0.05)' }
				},
				y: {
					beginAtZero: true,
					ticks: { color: '#94a3b8', font: { size: 9 }, precision: 0 },
					grid: { color: 'rgba(255, 255, 255, 0.05)' }
				}
			}
		}
	});
}

const ctxTendencia = document.getElementById('chartTendencia') as HTMLCanvasElement;
if (ctxTendencia) {
	chartTendencia = new Chart(ctxTendencia, {
		type: 'line',
		data: {
			labels: semestreActual === 1 ? mesesSemestre1 : mesesSemestre2,
			datasets: [{
				data: [0, 0, 0, 0, 0, 0],
				borderColor: '#2dd4bf',
				backgroundColor: 'rgba(45, 212, 191, 0.15)',
				fill: true,
				tension: 0.4,
				pointRadius: 3,
				pointHoverRadius: 5,
				pointBackgroundColor: '#2dd4bf'
			}]
		},
		plugins: [glowPlugin],
		options: {
			responsive: true,
			maintainAspectRatio: false,
			layout: { padding: 10 },
			plugins: {
				legend: { display: false },
				glow: {
					color: 'rgba(45, 212, 191, 0.85)',
					blur: 12
				}
			} as any,
			scales: {
				x: {
					ticks: { color: '#94a3b8', font: { size: 9 } },
					grid: { display: false }
				},
				y: {
					beginAtZero: true,
					ticks: { color: '#94a3b8', font: { size: 9 }, precision: 0 },
					grid: { color: 'rgba(255, 255, 255, 0.05)' }
				}
			}
		}
	});
}

// - - - - - - - - - - Conexión con Bitácora - - - - - - - - - - -

function actualizarMetricas() {
	const tarjetas = document.querySelectorAll('#contenedor-registros > .tarjeta-registro');

	let concluidos = 0;
	let enProceso = 0;
	let pendientes = 0;

	let laptops = 0;
	let pcs = 0;
	let servidores = 0;
	let impresoras = 0;
	let otros = 0;

	const conteoSem1 = [0, 0, 0, 0, 0, 0];
	const conteoSem2 = [0, 0, 0, 0, 0, 0];

	tarjetas.forEach((tarjeta) => {
		const estatus = tarjeta.querySelector('[data-slot="estatusTexto"]')?.textContent?.trim().toLowerCase() || '';
		if (estatus.includes('concluid')) concluidos++;
		else if (estatus.includes('proceso')) enProceso++;
		else if (estatus.includes('pendiente')) pendientes++;

		const equipo = tarjeta.querySelector('[data-slot="tipoEquipo"]')?.textContent?.trim().toLowerCase() || '';
		if (equipo.includes('laptop')) laptops++;
		else if (equipo === 'pc' || equipo.includes('pc') || equipo.includes('escritorio')) pcs++;
		else if (equipo.includes('servidor')) servidores++;
		else if (equipo.includes('impresora')) impresoras++;
		else if (equipo) otros++;

		const fechaTexto = tarjeta.querySelector('[data-slot="fecha"]')?.textContent?.trim() || '';
		const partes = fechaTexto.split('/');
		if (partes.length >= 2) {
			const mes = parseInt(partes[1], 10) - 1; // 0 = Ene, 11 = Dic
			if (mes >= 0 && mes <= 5) {
				conteoSem1[mes]++;
			} else if (mes >= 6 && mes <= 11) {
				conteoSem2[mes - 6]++;
			}
		}
	});

	// 1. Actualizar gráfica de Estatus
	const totalEstatus = concluidos + enProceso + pendientes;
	if (chartEstatus) {
		if (totalEstatus === 0) {
			chartEstatus.data.labels = ['Sin datos'];
			chartEstatus.data.datasets[0].data = [1];
			chartEstatus.data.datasets[0].backgroundColor = ['rgba(255, 255, 255, 0.08)'];
			if (chartEstatus.options.plugins?.tooltip) chartEstatus.options.plugins.tooltip.enabled = false;
			if (chartEstatus.options.plugins?.glow) chartEstatus.options.plugins.glow.enabled = false;
		} else {
			chartEstatus.data.labels = ['Concluidos', 'En proceso', 'Pendiente'];
			chartEstatus.data.datasets[0].data = [concluidos, enProceso, pendientes];
			chartEstatus.data.datasets[0].backgroundColor = ['#2dd4bf', '#22d3ee', '#f59e0b'];
			if (chartEstatus.options.plugins?.tooltip) chartEstatus.options.plugins.tooltip.enabled = true;
			if (chartEstatus.options.plugins?.glow) chartEstatus.options.plugins.glow.enabled = true;
		}
		chartEstatus.update();
	}

	// 2. Actualizar gráfica de Equipos
	if (chartEquipos) {
		chartEquipos.data.datasets[0].data = [laptops, pcs, servidores, impresoras, otros];
		chartEquipos.update();
	}

	// 3. Actualizar gráfica de Tendencia (Líneas por Semestre)
	if (chartTendencia) {
		chartTendencia.data.labels = semestreActual === 1 ? mesesSemestre1 : mesesSemestre2;
		chartTendencia.data.datasets[0].data = semestreActual === 1 ? conteoSem1 : conteoSem2;
		chartTendencia.update();
	}
}

// Controles del Selector de Semestres
const btnSem1 = document.getElementById('btn-semestre-1');
const btnSem2 = document.getElementById('btn-semestre-2');
const subtituloTendencia = document.getElementById('subtitulo-tendencia');

function actualizarEstiloBotones() {
	if (semestreActual === 1) {
		btnSem1?.classList.add('bg-teal-400/20', 'text-teal-300', 'font-semibold', 'border', 'border-teal-400/40');
		btnSem1?.classList.remove('text-slate-400');
		btnSem2?.classList.remove('bg-teal-400/20', 'text-teal-300', 'font-semibold', 'border', 'border-teal-400/40');
		btnSem2?.classList.add('text-slate-400');
		if (subtituloTendencia) subtituloTendencia.textContent = '1er Semestre (Ene - Jun)';
	} else {
		btnSem2?.classList.add('bg-teal-400/20', 'text-teal-300', 'font-semibold', 'border', 'border-teal-400/40');
		btnSem2?.classList.remove('text-slate-400');
		btnSem1?.classList.remove('bg-teal-400/20', 'text-teal-300', 'font-semibold', 'border', 'border-teal-400/40');
		btnSem1?.classList.add('text-slate-400');
		if (subtituloTendencia) subtituloTendencia.textContent = '2do Semestre (Jul - Dic)';
	}
}

btnSem1?.addEventListener('click', () => {
	if (semestreActual === 1) return;
	semestreActual = 1;
	actualizarEstiloBotones();
	actualizarMetricas();
});

btnSem2?.addEventListener('click', () => {
	if (semestreActual === 2) return;
	semestreActual = 2;
	actualizarEstiloBotones();
	actualizarMetricas();
});

actualizarEstiloBotones();

// Escuchar evento personalizado
window.addEventListener('actualizar-metricas', actualizarMetricas);

// Observador automático por si se añade/edita/borra una tarjeta en el DOM
const contenedor = document.getElementById('contenedor-registros');
if (contenedor) {
	const observer = new MutationObserver(actualizarMetricas);
	observer.observe(contenedor, { childList: true, subtree: true, characterData: true });
}

actualizarMetricas();
