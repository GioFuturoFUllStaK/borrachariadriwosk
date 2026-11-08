// ============================================================
// PRESTAÇÃO DE CONTAS - BORRACHARIA DRIWOSK
// JavaScript - Esqueleto Vista Superior (Top-Down)
// ============================================================

let tipoVeiculoAtual = 'carro_passeio';
let posicaoSelecionada = null;
let servicosSelecionados = {};

// ---------- Armazenamento local (navegador) ----------
const CHAVE_STORAGE = 'driwosk_atendimentos_v1';
function lerAtendimentos() {
    try { return JSON.parse(localStorage.getItem(CHAVE_STORAGE) || '[]'); } catch (e) { return []; }
}
function salvarLocal(d) {
    const lista = lerAtendimentos();
    const id = lista.reduce((m, a) => Math.max(m, a.id), 0) + 1;
    lista.push({
        id, placa: d.placa, cidade: d.cidade, estado: d.estado, data_hora: d.dataHora,
        borracheiro: d.borracheiro, tipo_veiculo: d.tipoVeiculo, created_at: new Date().toISOString(),
        servicos: d.servicos.map(s => ({
            posicao_pneu: s.posicao, tipo_servico: s.tipoServico, tipo_conserto: s.tipoConcerto,
            numeracao: s.numeracao, observacao: s.observacao
        }))
    });
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(lista));
    return id;
}
const ROTULO_SERVICO = { calibragem: 'Calibragem', conserto: 'Conserto', rodizio: 'Rodízio', alinhamento: 'Alinhamento', balanceamento: 'Balanceamento', troca: 'Troca de pneu' };
const ROTULO_CONSERTO = { cordinha: 'Cordinha (emergência)', adesivo_frio: 'Adesivo a frio', remendo_quente: 'Remendo vulcanizado a quente' };
function formatarDataHora(v) {
    const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(v || '');
    return m ? `${m[3]}/${m[2]}/${m[1]} ${m[4]}:${m[5]}` : (v || '-');
}

const configuracoesVeiculos = {
    moto: {
        nome: 'Moto',
        largura: 520,
        altura: 420,
        eixos: [
            { id: 'eixo_dianteiro', y: 140, pneus: [ { id: 'dianteira', label: 'Dianteira', x: 260, y: 140 } ] },
            { id: 'eixo_traseiro', y: 320, pneus: [ { id: 'traseira', label: 'Traseira', x: 260, y: 320 } ] }
        ],
        chassis: { x1: 245, y1: 150, x2: 275, y2: 310 }
    },
    carro_passeio: {
        nome: 'Carro de Passeio (Baixo)',
        largura: 600,
        altura: 420,
        eixos: [
            { id: 'eixo_dianteiro', y: 140, pneus: [
                { id: 'FL', label: 'Dianteiro Esq.', x: 210, y: 140 },
                { id: 'FR', label: 'Dianteiro Dir.', x: 390, y: 140 }
            ]},
            { id: 'eixo_traseiro', y: 340, pneus: [
                { id: 'RL', label: 'Traseiro Esq.', x: 210, y: 340 },
                { id: 'RR', label: 'Traseiro Dir.', x: 390, y: 340 }
            ]}
        ],
        chassis: { x1: 285, y1: 150, x2: 315, y2: 330 }
    },
    caminhao_2_eixos: {
        nome: 'Caminhão 2 Eixos',
        largura: 640,
        altura: 460,
        eixos: [
            { id: 'eixo_dianteiro', y: 140, pneus: [
                { id: 'FL', label: 'Dianteiro Esq.', x: 200, y: 140 },
                { id: 'FR', label: 'Dianteiro Dir.', x: 440, y: 140 }
            ]},
            { id: 'eixo_traseiro', y: 360, pneus: [
                { id: 'RL1', label: 'Traseiro E1 Esq. 1', x: 220, y: 360 },
                { id: 'RR1', label: 'Traseiro E1 Dir. 1', x: 420, y: 360 },
                { id: 'RL2', label: 'Traseiro E1 Esq. 2', x: 260, y: 360 },
                { id: 'RR2', label: 'Traseiro E1 Dir. 2', x: 380, y: 360 }
            ]}
        ],
        chassis: { x1: 305, y1: 150, x2: 335, y2: 350 }
    },
    caminhao_3_eixos: {
        nome: 'Caminhão 3 Eixos',
        largura: 680,
        altura: 540,
        eixos: [
            { id: 'eixo_dianteiro', y: 120, pneus: [
                { id: 'FL', label: 'Dianteiro Esq.', x: 200, y: 120 },
                { id: 'FR', label: 'Dianteiro Dir.', x: 480, y: 120 }
            ]},
            { id: 'eixo_meio', y: 290, pneus: [
                { id: 'MLE', label: 'Meio Esq. Ext.', x: 220, y: 290 },
                { id: 'MLI', label: 'Meio Esq. Int.', x: 260, y: 290 },
                { id: 'MRI', label: 'Meio Dir. Int.', x: 420, y: 290 },
                { id: 'MRE', label: 'Meio Dir. Ext.', x: 460, y: 290 }
            ]},
            { id: 'eixo_traseiro', y: 460, pneus: [
                { id: 'TLE', label: 'Traseiro Esq. Ext.', x: 200, y: 460 },
                { id: 'TLI', label: 'Traseiro Esq. Int.', x: 240, y: 460 },
                { id: 'TRI', label: 'Traseiro Dir. Int.', x: 440, y: 460 },
                { id: 'TRE', label: 'Traseiro Dir. Ext.', x: 480, y: 460 }
            ]}
        ],
        chassis: { x1: 325, y1: 130, x2: 355, y2: 450 }
    },
    carreta: {
        nome: 'Carreta (Implemento para Carga)',
        largura: 740,
        altura: 580,
        eixos: [
            { id: 'eixo_1', y: 140, pneus: [
                { id: 'E1LE', label: 'E1 Esq. Ext.', x: 150, y: 140 },
                { id: 'E1LI', label: 'E1 Esq. Int.', x: 190, y: 140 },
                { id: 'E1RI', label: 'E1 Dir. Int.', x: 550, y: 140 },
                { id: 'E1RE', label: 'E1 Dir. Ext.', x: 590, y: 140 }
            ]},
            { id: 'eixo_2', y: 310, pneus: [
                { id: 'E2LE', label: 'E2 Esq. Ext.', x: 150, y: 310 },
                { id: 'E2LI', label: 'E2 Esq. Int.', x: 190, y: 310 },
                { id: 'E2RI', label: 'E2 Dir. Int.', x: 550, y: 310 },
                { id: 'E2RE', label: 'E2 Dir. Ext.', x: 590, y: 310 }
            ]},
            { id: 'eixo_3', y: 480, pneus: [
                { id: 'E3LE', label: 'E3 Esq. Ext.', x: 150, y: 480 },
                { id: 'E3LI', label: 'E3 Esq. Int.', x: 190, y: 480 },
                { id: 'E3RI', label: 'E3 Dir. Int.', x: 550, y: 480 },
                { id: 'E3RE', label: 'E3 Dir. Ext.', x: 590, y: 480 }
            ]}
        ],
        chassis: { x1: 355, y1: 150, x2: 385, y2: 470 }
    },
    carreta_2_eixos: {
        nome: 'Carreta 2 Eixos (Implemento para Carga)',
        largura: 740,
        altura: 420,
        eixos: [
            { id: 'eixo_1', y: 140, pneus: [
                { id: 'C2E1LE', label: 'E1 Esq. Ext.', x: 150, y: 140 },
                { id: 'C2E1LI', label: 'E1 Esq. Int.', x: 190, y: 140 },
                { id: 'C2E1RI', label: 'E1 Dir. Int.', x: 550, y: 140 },
                { id: 'C2E1RE', label: 'E1 Dir. Ext.', x: 590, y: 140 }
            ]},
            { id: 'eixo_2', y: 340, pneus: [
                { id: 'C2E2LE', label: 'E2 Esq. Ext.', x: 150, y: 340 },
                { id: 'C2E2LI', label: 'E2 Esq. Int.', x: 190, y: 340 },
                { id: 'C2E2RI', label: 'E2 Dir. Int.', x: 550, y: 340 },
                { id: 'C2E2RE', label: 'E2 Dir. Ext.', x: 590, y: 340 }
            ]}
        ],
        chassis: { x1: 355, y1: 150, x2: 385, y2: 330 }
    },
    dolly: {
        nome: 'Dolly (2 Eixos - Implemento)',
        largura: 600,
        altura: 460,
        eixos: [
            { id: 'eixo_dianteiro', y: 160, pneus: [
                { id: 'DLE', label: 'Dianteiro Esq. Ext.', x: 180, y: 160 },
                { id: 'DLI', label: 'Dianteiro Esq. Int.', x: 220, y: 160 },
                { id: 'DRI', label: 'Dianteiro Dir. Int.', x: 380, y: 160 },
                { id: 'DRE', label: 'Dianteiro Dir. Ext.', x: 420, y: 160 }
            ]},
            { id: 'eixo_traseiro', y: 340, pneus: [
                { id: 'TLE', label: 'Traseiro Esq. Ext.', x: 180, y: 340 },
                { id: 'TLI', label: 'Traseiro Esq. Int.', x: 220, y: 340 },
                { id: 'TRI', label: 'Traseiro Dir. Int.', x: 380, y: 340 },
                { id: 'TRE', label: 'Traseiro Dir. Ext.', x: 420, y: 340 }
            ]}
        ],
        chassis: { x1: 285, y1: 170, x2: 315, y2: 330 }
    },
    trator: {
        nome: 'Trator',
        largura: 660,
        altura: 480,
        eixos: [
            { id: 'eixo_dianteiro', y: 130, pneus: [
                { id: 'DI', label: 'Dianteiro Esq.', x: 200, y: 130 },
                { id: 'DD', label: 'Dianteiro Dir.', x: 460, y: 130 }
            ]},
            { id: 'eixo_traseiro', y: 380, pneus: [
                { id: 'TI', label: 'Traseiro Esq.', x: 160, y: 380 },
                { id: 'TD', label: 'Traseiro Dir.', x: 500, y: 380 }
            ]}
        ],
        chassis: { x1: 315, y1: 140, x2: 345, y2: 370 }
    }
};

document.addEventListener('DOMContentLoaded', function() {
    const agora = new Date();
    const ajusteFuso = agora.getTimezoneOffset() * 60000;
    const localTime = new Date(agora.getTime() - ajusteFuso).toISOString().slice(0, 16);
    document.getElementById('dataHora').value = localTime;
    
    trocarVeiculo();
    carregarHistorico();
});

function trocarVeiculo() {
    const select = document.getElementById('tipoVeiculo');
    tipoVeiculoAtual = select.value;
    
    const config = configuracoesVeiculos[tipoVeiculoAtual];
    document.getElementById('tituloDiagrama').textContent = `Esqueleto Vista Superior - ${config.nome}`;
    
    const area = document.getElementById('areaDiagrama');
    area.innerHTML = '';
    area.style.width = config.largura + 'px';
    area.style.height = config.altura + 'px';
    area.className = 'area-diagrama';
    
    const chassis = document.createElement('div');
    chassis.className = 'chassis-linha';
    chassis.style.left = config.chassis.x1 + 'px';
    chassis.style.top = config.chassis.y1 + 'px';
    chassis.style.width = (config.chassis.x2 - config.chassis.x1) + 'px';
    chassis.style.height = (config.chassis.y2 - config.chassis.y1) + 'px';
    area.appendChild(chassis);
    
    config.eixos.forEach(eixo => {
        const pneus = eixo.pneus;
        if (pneus.length < 2) return;
        
        const primeiro = pneus[0];
        const ultimo = pneus[pneus.length - 1];
        
        const linhaEixo = document.createElement('div');
        linhaEixo.className = 'eixo-linha-top';
        linhaEixo.style.left = (primeiro.x - 28) + 'px';
        linhaEixo.style.top = (eixo.y - 1) + 'px';
        linhaEixo.style.width = (ultimo.x - primeiro.x + 56) + 'px';
        area.appendChild(linhaEixo);
    });
    
    config.eixos.forEach(eixo => {
        eixo.pneus.forEach(pneu => {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'pneu-btn-top';
            btn.id = 'pneu_' + pneu.id;
            btn.style.left = (pneu.x - 28) + 'px';
            btn.style.top = (pneu.y - 28) + 'px';
            btn.title = pneu.label;
            btn.onclick = () => selecionarPneu(pneu.id, pneu.label);
            
            const label = document.createElement('span');
            label.className = 'pneu-label-top';
            label.textContent = pneu.label;
            
            btn.appendChild(label);
            area.appendChild(btn);
        });
    });
    
    servicosSelecionados = {};
    atualizarResumo();
    document.getElementById('resumoSelecao').style.display = 'none';
}

function selecionarPneu(id, label) {
    posicaoSelecionada = id;
    
    document.querySelectorAll('.pneu-btn-top').forEach(btn => {
        btn.classList.remove('selecionado');
    });
    document.getElementById('pneu_' + id).classList.add('selecionado');
    
    const existente = servicosSelecionados[id];
    if (existente) {
        document.getElementById('servTipoServico').value = existente.tipoServico || 'calibragem';
        document.getElementById('servTipoConcerto').value = existente.tipoConcerto || '';
        document.getElementById('servNumeracao').value = existente.numeracao || '';
        document.getElementById('servObservacao').value = existente.observacao || '';
        toggleGrupoConcerto(existente.tipoServico);
    } else {
        document.getElementById('servTipoServico').value = 'calibragem';
        document.getElementById('servTipoConcerto').value = '';
        document.getElementById('servNumeracao').value = '';
        document.getElementById('servObservacao').value = '';
        toggleGrupoConcerto('calibragem');
    }
    
    document.getElementById('modalPosicao').textContent = id;
    document.getElementById('modalServico').style.display = 'block';
}

function toggleGrupoConcerto(tipo) {
    const grupo = document.getElementById('grupoConcerto');
    if (tipo === 'conserto') {
        grupo.style.display = 'block';
    } else {
        grupo.style.display = 'none';
    }
}

function fecharModal() {
    document.getElementById('modalServico').style.display = 'none';
    posicaoSelecionada = null;
}

function salvarServicoPneu() {
    if (!posicaoSelecionada) return;
    
    const tipoServico = document.getElementById('servTipoServico').value;
    const tipoConcerto = document.getElementById('servTipoConcerto').value;
    const numeracao = document.getElementById('servNumeracao').value;
    const observacao = document.getElementById('servObservacao').value;
    
    if (!numeracao) {
        alert('Por favor, informe a numeração/medida do pneu.');
        return;
    }
    
    servicosSelecionados[posicaoSelecionada] = {
        posicao: posicaoSelecionada,
        tipoServico: tipoServico,
        tipoConcerto: tipoConcerto,
        numeracao: numeracao,
        observacao: observacao
    };
    
    atualizarResumo();
    fecharModal();
}

function atualizarResumo() {
    const lista = document.getElementById('listaPneusSelecionados');
    const resumo = document.getElementById('resumoSelecao');
    
    const chaves = Object.keys(servicosSelecionados);
    
    if (chaves.length === 0) {
        resumo.style.display = 'none';
        return;
    }
    
    resumo.style.display = 'block';
    lista.innerHTML = '';
    
    chaves.forEach(pos => {
        const s = servicosSelecionados[pos];
        const item = document.createElement('div');
        item.className = 'item-resumo';
        item.innerHTML = `
            <div>
                <strong>${pos}</strong> - ${s.tipoServico} ${s.tipoConcerto ? '(' + s.tipoConcerto + ')' : ''}<br>
                <small>Numeração: ${s.numeracao}</small> ${s.observacao ? '| Obs: ' + s.observacao : ''}
            </div>
            <button type="button" class="btn-remover" onclick="removerPneuSelecao('${pos}')">✕</button>
        `;
        lista.appendChild(item);
    });
}

function removerPneuSelecao(pos) {
    delete servicosSelecionados[pos];
    document.getElementById('pneu_' + pos).classList.remove('selecionado');
    atualizarResumo();
    if (Object.keys(servicosSelecionados).length === 0) {
        document.getElementById('resumoSelecao').style.display = 'none';
    }
}

async function salvarPrestacao() {
    const placa = document.getElementById('placa').value.trim();
    const cidade = document.getElementById('cidade').value.trim();
    const estado = document.getElementById('estado').value;
    const dataHora = document.getElementById('dataHora').value;
    const borracheiro = document.getElementById('borracheiro').value.trim();
    const tipoVeiculo = document.getElementById('tipoVeiculo').value;
    
    if (!placa || !cidade || !estado || !dataHora || !borracheiro) {
        alert('Preencha todos os campos do cabeçalho: Placa, Cidade, Estado, Data/Hora e Borracheiro.');
        return;
    }
    
    if (Object.keys(servicosSelecionados).length === 0) {
        alert('Selecione ao menos um pneu no diagrama e informe o serviço.');
        return;
    }
    
    const dados = {
        placa: placa.toUpperCase(),
        cidade: cidade,
        estado: estado,
        dataHora: dataHora,
        borracheiro: borracheiro,
        tipoVeiculo: tipoVeiculo,
        servicos: Object.values(servicosSelecionados)
    };
    
    try {
        const id = salvarLocal(dados);
        alert('Prestação de contas salva com sucesso! ID: ' + id);
        document.getElementById('btnGerarPDF').disabled = false;
        document.getElementById('btnGerarPDF').onclick = () => gerarPDF(id);
        limparFormulario();
        carregarHistorico();
    } catch (e) {
        alert('Não foi possível salvar neste navegador: ' + e.message);
    }
}

function limparFormulario() {
    document.getElementById('placa').value = '';
    document.getElementById('cidade').value = '';
    document.getElementById('estado').value = '';
    document.getElementById('borracheiro').value = '';
    
    document.querySelectorAll('.pneu-btn-top').forEach(btn => btn.classList.remove('selecionado'));
    servicosSelecionados = {};
    document.getElementById('resumoSelecao').style.display = 'none';
}

async function carregarHistorico() {
    try {
        const atendimentos = lerAtendimentos().slice().sort((a, b) => b.id - a.id);
        
        const container = document.getElementById('listaHistorico');
        const secao = document.getElementById('areaHistorico');
        
        if (atendimentos.length === 0) {
            secao.style.display = 'none';
            return;
        }
        
        secao.style.display = 'block';
        container.innerHTML = '';
        
        atendimentos.forEach(att => {
            const card = document.createElement('div');
            card.className = 'card-historico';
            card.innerHTML = `
                <div class="card-header">
                    <strong>ID ${att.id}</strong> - ${att.placa} - ${att.tipo_veiculo}
                    <span class="data">${att.data_hora}</span>
                </div>
                <div class="card-body">
                    <span><strong>Borracheiro:</strong> ${att.borracheiro}</span><br>
                    <span><strong>Local:</strong> ${att.cidade} - ${att.estado}</span><br>
                    <button type="button" class="btn-ver-detalhes" onclick="verDetalhes(${att.id})">Ver Detalhes dos Pneus</button>
                    <button type="button" class="btn-ver-detalhes" onclick="gerarPDF(${att.id})">Gerar PDF</button>
                </div>
            `;
            container.appendChild(card);
        });
    } catch (e) {
        console.error('Erro ao carregar histórico:', e);
    }
}

async function verDetalhes(id) {
    try {
        const att0 = lerAtendimentos().find(a => a.id === id);
        const dados = att0 ? { sucesso: true, atendimento: att0, servicos: att0.servicos } : { sucesso: false };
        
        if (!dados.sucesso) return;
        
        const att = dados.atendimento;
        let html = `
            <div style="background:#fff;padding:15px;border-radius:8px;margin-bottom:15px;box-shadow:0 2px 5px rgba(0,0,0,0.1);">
                <strong>Placa:</strong> ${att.placa} | <strong>Tipo:</strong> ${att.tipo_veiculo}<br>
                <strong>Borracheiro:</strong> ${att.borracheiro} | <strong>Local:</strong> ${att.cidade} - ${att.estado}<br>
                <strong>Data/Hora:</strong> ${att.data_hora}
            </div>
            <h4>Serviços por Pneu:</h4>
            <div style="display:flex;flex-wrap:wrap;gap:10px;">
        `;
        
        dados.servicos.forEach(s => {
            html += `
                <div style="background:#f8fafc;padding:10px;border:1px solid #e2e8f0;border-radius:6px;min-width:140px;">
                    <strong>${s.posicao_pneu}</strong><br>
                    ${s.tipo_servico} ${s.tipo_concerto ? '(' + s.tipo_concerto + ')' : ''}<br>
                    <small>Numeração: ${s.numeracao}</small><br>
                    ${s.observacao ? '<small>Obs: ' + s.observacao + '</small>' : ''}
                </div>
            `;
        });
        
        html += `</div>`;
        
        const modalExistente = document.getElementById('modalDetalhes');
        if (modalExistente) modalExistente.remove();
        
        const modal = document.createElement('div');
        modal.id = 'modalDetalhes';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-conteudo" style="max-width:600px;">
                <div class="modal-header">
                    <h3>Detalhes - ID ${att.id}</h3>
                    <span class="fechar" onclick="this.closest('.modal').remove()">&times;</span>
                </div>
                <div class="modal-body">
                    ${html}
                </div>
                <div class="modal-actions" style="justify-content:center;">
                    <button type="button" class="btn-cancelar" onclick="this.closest('.modal').remove()">Fechar</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        modal.style.display = 'block';
        
    } catch (e) {
        alert('Erro ao carregar detalhes.');
    }
}

function gerarPDF(atendimentoId) {
    const lista = lerAtendimentos();
    const att = lista.find(a => a.id === atendimentoId) || lista[lista.length - 1];
    if (!att) { alert('Nenhum atendimento salvo para gerar PDF.'); return; }
    if (!window.jspdf) { alert('A biblioteca de PDF não carregou. Verifique a conexão com a internet e recarregue a página.'); return; }

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF({ unit: 'mm', format: 'a4' });
    const AZ = [30, 58, 138], AZM = [59, 130, 246], AZC = [219, 234, 254], TXT = [51, 65, 85], BORDA = [203, 213, 225], ZEBRA = [241, 245, 249];
    const veic = (configuracoesVeiculos[att.tipo_veiculo] || {}).nome || att.tipo_veiculo || '-';

    doc.setFont('helvetica', 'bold'); doc.setFontSize(20); doc.setTextColor(...AZ);
    doc.text('Borracharia Driwosk', 105, 20, { align: 'center' });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(12); doc.setTextColor(...TXT);
    doc.text('Prestação de Contas - Serviços de Pneus', 105, 28, { align: 'center' });
    doc.setFillColor(...AZM); doc.rect(18, 32, 174, 1.5, 'F');

    let y = 42;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(...AZ);
    doc.text('Dados do Atendimento', 18, y); y += 5;

    const linhas = [
        ['Placa do veículo', att.placa, 'Tipo de veículo', veic],
        ['Cidade / Estado', att.cidade + ' - ' + att.estado, 'Data / Hora', formatarDataHora(att.data_hora)],
        ['Borracheiro', att.borracheiro, 'ID do atendimento', String(att.id)]
    ];
    const lw = [38, 49, 38, 49];
    doc.setFontSize(9); doc.setDrawColor(...BORDA);
    linhas.forEach(l => {
        let x = 18;
        l.forEach((t, i) => {
            const rotulo = i % 2 === 0;
            if (rotulo) { doc.setFillColor(...AZC); doc.rect(x, y, lw[i], 9, 'FD'); } else { doc.rect(x, y, lw[i], 9); }
            doc.setFont('helvetica', rotulo ? 'bold' : 'normal'); doc.setTextColor(...(rotulo ? AZ : TXT));
            doc.text(doc.splitTextToSize(String(t || '-'), lw[i] - 4)[0], x + 2, y + 6);
            x += lw[i];
        });
        y += 9;
    });

    y += 10;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(13); doc.setTextColor(...AZ);
    doc.text('Serviços Executados por Pneu', 18, y); y += 5;

    const cw = [28, 34, 34, 34, 44];
    const cab = ['Posição do pneu', 'Tipo de serviço', 'Tipo de conserto', 'Numeração / medida', 'Observação'];
    const desenharCab = () => {
        let x = 18;
        doc.setFontSize(9);
        cab.forEach((t, i) => {
            doc.setFillColor(...AZ); doc.rect(x, y, cw[i], 8, 'F');
            doc.setFont('helvetica', 'bold'); doc.setTextColor(255, 255, 255);
            doc.text(t, x + 2, y + 5.4);
            x += cw[i];
        });
        y += 8;
    };
    desenharCab();

    const servicos = att.servicos || [];
    servicos.forEach((s, idx) => {
        const cel = [
            s.posicao_pneu || '-',
            ROTULO_SERVICO[s.tipo_servico] || s.tipo_servico || '-',
            s.tipo_servico === 'conserto' ? (ROTULO_CONSERTO[s.tipo_conserto] || s.tipo_conserto || '-') : '-',
            s.numeracao || '-',
            s.observacao || '-'
        ];
        doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
        const quebras = cel.map((t, i) => doc.splitTextToSize(String(t), cw[i] - 4));
        const h = Math.max(...quebras.map(q => q.length)) * 4.2 + 4;
        if (y + h > 275) { doc.addPage(); y = 20; desenharCab(); }
        let x = 18;
        quebras.forEach((q, i) => {
            if (idx % 2 === 1) { doc.setFillColor(...ZEBRA); doc.rect(x, y, cw[i], h, 'FD'); } else { doc.rect(x, y, cw[i], h); }
            doc.setTextColor(...TXT);
            doc.text(q, x + 2, y + 5);
            x += cw[i];
        });
        y += h;
    });

    if (y > 240) { doc.addPage(); y = 20; }
    y += 10;
    const contagem = {};
    servicos.forEach(s => { const k = ROTULO_SERVICO[s.tipo_servico] || s.tipo_servico || 'Não informado'; contagem[k] = (contagem[k] || 0) + 1; });
    doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(...TXT);
    doc.text('Total de pneus atendidos: ' + servicos.length, 18, y); y += 6;
    doc.setFont('helvetica', 'normal');
    const resumo = 'Serviços realizados: ' + (Object.keys(contagem).length ? Object.entries(contagem).map(([k, v]) => k + ' (' + v + ')').join(', ') : 'Nenhum');
    doc.splitTextToSize(resumo, 174).forEach(l => { doc.text(l, 18, y); y += 5; });

    y += 18;
    if (y > 270) { doc.addPage(); y = 40; }
    doc.setDrawColor(...TXT); doc.line(18, y, 100, y);
    doc.setFontSize(9); doc.text('Assinatura do Borracheiro', 18, y + 5);

    const total = doc.getNumberOfPages();
    for (let p = 1; p <= total; p++) {
        doc.setPage(p); doc.setFontSize(8); doc.setTextColor(100, 116, 139);
        doc.text('Documento gerado em ' + new Date().toLocaleString('pt-BR') + ' | Borracharia Driwosk', 18, 290);
        doc.text('Página ' + p + ' de ' + total, 192, 290, { align: 'right' });
    }
    salvarPDF(doc, 'prestacao_contas_' + String(att.placa).replace(/[^A-Za-z0-9]/g, '') + '_' + att.id + '.pdf');
}

window.onclick = function(event) {
    const modal = document.getElementById('modalServico');
    if (event.target === modal) {
        fecharModal();
    }
};

// No app Android, o WebView não baixa arquivos: grava o PDF e abre o menu de compartilhar/salvar.
async function salvarPDF(doc, nome) {
    const cap = window.Capacitor;
    if (cap && cap.isNativePlatform && cap.isNativePlatform() && cap.Plugins && cap.Plugins.Filesystem && cap.Plugins.Share) {
        try {
            const base64 = doc.output('datauristring').split(',')[1];
            const r = await cap.Plugins.Filesystem.writeFile({ path: nome, data: base64, directory: 'CACHE' });
            await cap.Plugins.Share.share({ title: nome, dialogTitle: 'Enviar ou salvar o PDF', url: r.uri });
        } catch (e) {
            alert('Não foi possível compartilhar o PDF: ' + (e && e.message ? e.message : e));
        }
        return;
    }
    doc.save(nome);
}
