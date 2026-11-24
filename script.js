async function baixarPdf() {

    let conteudo = document.querySelector("#curriculo");

    document.querySelectorAll("#imprimir button, .input-checkbox")
        .forEach(elemento => elemento.style.display = "none");

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'pt', 'a4');

    const larguraPagina = doc.internal.pageSize.width;

    const margem = [20, 20, 20, 20];

    const larguraUtilizavel = larguraPagina - margem[3] - margem[1];

    let alturaAtual = margem[0];

    const secoes = conteudo.querySelectorAll('section');

    for (let i = 1; i < secoes.length; i++) {

        const secao = secoes[i];
        const escala = 595 / conteudo.scrollWidth;
        const alturaSecao = secao.scrollHeight * escala;

        await new Promise(resolver => {
            doc.html(secao, {
                x: margem[3],
                y: alturaAtual,
                margin: margem,
                autoPaging: 'text',
                width: larguraUtilizavel,
                windowWidth: secao.scrollWidth,
                html2canvas: {
                    scale: escala,
                    useCORS: true
                },
                callback: () => {
                    alturaAtual += alturaSecao + 10;
                    resolver();
                }
            });
        });
    }

    doc.save('curriculo.pdf');

    document.querySelectorAll("#imprimir button, .input-checkbox")
        .forEach(elemento => elemento.style.display = "inline-block");
}

function salvarDados() {
    const dataField = document.querySelectorAll('[data-field]');
    const dados = {};

    dataField.forEach((campo) => {
        const nomeCampo = campo.getAttribute('data-field'); 
        
        if (!dados[nomeCampo]) {
            dados[nomeCampo] = [];
        }

        if (campo.hasAttribute('contenteditable')) {
            dados[nomeCampo].push(campo.innerText.trim());
        } else {
            let camposEditaveis = campo.querySelectorAll('[contenteditable="true"]');
            camposEditaveis.forEach((campoEditavel) => {
                dados[nomeCampo].push(campoEditavel.innerText.trim());
            });
        }          
    });
    localStorage.setItem('dados', JSON.stringify(dados));
    alert('Dados salvos no navegador!');

    if (confirm("Você deseja baixar um backup.txt? Sim (OK) e Não (Cancel).")) {
        let dados = localStorage.getItem("dados") || "[]";
        let blob = new Blob([dados], { type: "text/plain" });

        let link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = "backupGeradorCurriculo.txt";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } 
}

function importarDados() {
    const entradaArquivo = document.querySelector("#arquivoInput");
    entradaArquivo.click(); 

    entradaArquivo.onchange = function (evento) {
        if (!evento.target.files || evento.target.files.length === 0) {
            console.error("Nenhum arquivo selecionado.");
            return;
        }

        const arquivo = evento.target.files[0];
        const leitor = new FileReader();

        leitor.onload = function (e) {
            try {
                localStorage.setItem("dados", e.target.result);
                alert("Dados salvos!");
                location.reload();
            } catch (erro) {
                console.error("Erro ao processar o JSON:", erro);
            }
        };
        leitor.readAsText(arquivo);
    };
}


function consultarValorDatafieldHTML(nomeDataField){
    let dataFieldHTML = document.querySelectorAll(`[data-field="${nomeDataField}"]`);
    let valorDataFieldHTML = [];

    dataFieldHTML.forEach((campo) => {
        if (campo.hasAttribute('contenteditable')) {
            valorDataFieldHTML.push(campo.innerText.trim());
        } else {
            let camposEditaveis = campo.querySelectorAll('[contenteditable="true"]');
            camposEditaveis.forEach((campoEditavel) => {
                valorDataFieldHTML.push(campoEditavel.innerText.trim());
            });
        }
    });
    return valorDataFieldHTML;
}

function carregarDados() {
    const dadosLocalStorage = JSON.parse(localStorage.getItem('dados'));

    if (dadosLocalStorage) {
        let arrayNomesDatafieldsLS = Object.keys(dadosLocalStorage);

        arrayNomesDatafieldsLS.forEach((nomeDataFieldLS) => {
            let arrayValoresDataFieldLS = dadosLocalStorage[nomeDataFieldLS];
            let arrayValoresDataFieldHTML = consultarValorDatafieldHTML(nomeDataFieldLS);
            let elementosFaltando = arrayValoresDataFieldLS.length - arrayValoresDataFieldHTML.length;

            while (elementosFaltando > 0) {
                switch (nomeDataFieldLS) {
                    case "experiencia": 
                        adicionarExp(); 
                        break;
                    case "educacao": 
                        adicionarEdu(); 
                        break;
                    case "habilidade": 
                        adicionarHab(); 
                        break;
                    case "idioma": 
                        adicionarIdi(); 
                        break;
                    case "qualificacaoProfissional": 
                        adicionarQua(); 
                        break;
                }
                arrayValoresDataFieldHTML = consultarValorDatafieldHTML(nomeDataFieldLS);
                elementosFaltando = arrayValoresDataFieldLS.length - arrayValoresDataFieldHTML.length;
            }

            let dataFieldHTML = document.querySelectorAll(`[data-field="${nomeDataFieldLS}"]`);

            arrayValoresDataFieldLS.forEach((valor, index) => {
                let dataField = dataFieldHTML[index];
                if (dataField) {
                    if (dataField.hasAttribute('contenteditable')) {
                        dataField.innerText = valor;
                    } else {
                        let camposEditaveis = dataField.querySelectorAll('[contenteditable="true"]');
                        camposEditaveis.forEach((campoEditavel, i) => {
                            if (arrayValoresDataFieldLS[i]) {
                                campoEditavel.innerText = arrayValoresDataFieldLS[i];
                            }
                        });
                    }
                }
            });
        });
    }
}

function apagarDados(){
    localStorage.removeItem('dados');
    alert('Dados apagados!');
}

function removerItem(event) {
    let valor = 0;
    const todasCaixasSelecao = event.target.parentElement.querySelectorAll(".input-checkbox");
    const array = Array.from(todasCaixasSelecao);
    
    if (array.length === 0) {
        alert("Não há nada para deletar!");
    } else {
        array.forEach(caixa => {
            if (caixa.checked === true) {
                valor = 1;
                caixa.parentElement.parentElement.remove();
            }
        });

        if (valor === 0) {
            alert("Por favor, marque as caixas de seleção para excluir o campo obrigatório!");
        }
    }
}

function adicionarExp() {
    let novoExp = document.createElement("div");
    novoExp.classList.add("bloco-item");
    novoExp.innerHTML = `
        <button type="button" class="drag-handle" draggable="true" title="Arraste para reordenar" aria-label="Arraste para reordenar"><i class="fas fa-arrows-alt"></i></button>
        <span><input type="checkbox" class="input-checkbox"></span>
        <span class="cab-experiencia" contenteditable="true">Cargo</span>
        <div><span contenteditable="true">Nome da Empresa</span><span>&nbsp-&nbsp</span><span contenteditable="true">Ano</span></div>   
        <div contenteditable="true">
            Resultados e responsabilidades.
        </div> 
    `;
    document.querySelector("#experiencia").appendChild(novoExp);
}

function adicionarEdu() {
    let novoEdu = document.createElement("div");
    novoEdu.classList.add("bloco-item");
    novoEdu.innerHTML = `
        <button type="button" class="drag-handle" draggable="true" title="Arraste para reordenar" aria-label="Arraste para reordenar"><i class="fas fa-arrows-alt"></i></button>
        <span><input type="checkbox" class="input-checkbox"></span>
        <span class="cab-educacao" contenteditable="true">Diploma</span>
        <div><span contenteditable="true">Nome da Instituição</span><span>&nbsp-&nbsp</span><span contenteditable="true">Ano</span></div>
    `;
    document.querySelector("#educacao").appendChild(novoEdu);   
}

function adicionarHab() {
    let novoHab = document.createElement("div");
    novoHab.classList.add("bloco-item");
    novoHab.innerHTML = `
        <button type="button" class="drag-handle" draggable="true" title="Arraste para reordenar" aria-label="Arraste para reordenar"><i class="fas fa-arrows-alt"></i></button>
        <span><input type="checkbox" class="input-checkbox"></span>
        <span contenteditable="true">Habilidade / Skill</span><span>&nbsp-&nbsp</span><span contenteditable="true">Nível</span>
    `;
    document.querySelector("#habilidade").appendChild(novoHab);    
}

function adicionarIdi() {
    let novoIdi = document.createElement("div");
    novoIdi.classList.add("bloco-item");
    novoIdi.innerHTML = `
        <button type="button" class="drag-handle" draggable="true" title="Arraste para reordenar" aria-label="Arraste para reordenar"><i class="fas fa-arrows-alt"></i></button>
        <span><input type="checkbox" class="input-checkbox"></span>
        <span contenteditable="true">Idioma</span><span>&nbsp-&nbsp</span><span contenteditable="true">Nível</span>
    `;
    document.querySelector("#idioma").appendChild(novoIdi);
}

function adicionarQua() {
    let novoQua = document.createElement('div');
    novoQua.classList.add("bloco-item");
    novoQua.innerHTML = (`
        <button type="button" class="drag-handle" draggable="true" title="Arraste para reordenar" aria-label="Arraste para reordenar"><i class="fas fa-arrows-alt"></i></button>
        <span><input type="checkbox" class="input-checkbox"></span>
        <span class="cab-qualificacao" contenteditable="true">Qualificação Profissional</span>
        <br>
        <div><span contenteditable="true">Nome da Instituição</span><span>&nbsp-&nbsp</span><span contenteditable="true">Ano</span></div>    
    `);  
    document.querySelector("#qualificacao").appendChild(novoQua); 
}

let itemArrastado = null;

document.addEventListener("dragstart", (evento) => {
    const alca = evento.target.closest(".drag-handle");
    if (!alca) return;

    const item = alca.closest(".bloco-item");
    if (!item || !item.parentElement.classList.contains("lista-itens")) {
        evento.preventDefault();
        return;
    }

    itemArrastado = item;
    item.classList.add("arrastando");
    evento.dataTransfer.effectAllowed = "move";
    evento.dataTransfer.setData("text/plain", "");
});

document.addEventListener("dragover", (evento) => {
    if (!itemArrastado) return;

    const destino = evento.target.closest(".bloco-item");
    if (!destino || destino === itemArrastado || destino.parentElement !== itemArrastado.parentElement) return;

    evento.preventDefault();
    const antes = evento.clientY < destino.getBoundingClientRect().top + destino.offsetHeight / 2;
    destino.parentElement.insertBefore(itemArrastado, antes ? destino : destino.nextSibling);
});

document.addEventListener("dragend", () => {
    if (itemArrastado) itemArrastado.classList.remove("arrastando");
    itemArrastado = null;
});

let guardarTexto = '';
function limitarTexto(elemento, limite) {
    if(elemento.innerText.length <= limite){
        guardarTexto = elemento.innerText;
    }else{
        elemento.innerText = guardarTexto;
    }
};

document.addEventListener("paste", (evento) => {
    evento.preventDefault();
    const texto = evento.clipboardData.getData("text/plain"); 

    const selecao = window.getSelection();
    if (!selecao.rangeCount) return;

    selecao.deleteFromDocument(); 
    selecao.getRangeAt(0).insertNode(document.createTextNode(texto));
});

window.onload = function() {
    carregarDados();
};