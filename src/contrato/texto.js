import {
  PRAZO_PAGAMENTO_DIAS,
  PRAZO_REAGENDAMENTO_DIAS,
  PRAZO_RESCISAO_DIAS,
} from '../lib/constantes.js';
import { dataCurta, dataLonga, dataPorExtenso, valorPorExtenso } from '../lib/extenso.js';
import { brl } from '../lib/formato.js';
import { subtotal, totais } from '../lib/calculos.js';

// Trechos entre ** ** saem em negrito no PDF.
const b = (t) => `**${t}**`;
const cl = (n, texto) => ({ rotulo: `Cláusula ${n}ª.`, texto });

// Cláusula 10: descreve só o que foi contratado (entrega, montagem ou os dois).
function clausulaServicos({ entrega, montagem }) {
  const valor = (c) => `${b(brl(c))} (${valorPorExtenso(c)})`;
  if (entrega != null && montagem != null) {
    return `Tendo sido acordadas a entrega dos doces e a montagem da mesa no local do evento, serão cobradas a taxa de entrega no valor de ${valor(entrega)} e a taxa de montagem da mesa no valor de ${valor(montagem)}, já incluídas no valor total.`;
  }
  if (entrega != null) {
    return `Tendo sido acordada a entrega dos doces no local do evento, será cobrada taxa de entrega no valor de ${valor(entrega)}, já incluída no valor total.`;
  }
  return `Tendo sido acordada a montagem da mesa de doces no local do evento, será cobrada taxa de montagem no valor de ${valor(montagem)}, já incluída no valor total.`;
}

// Junta os dados do formulário e da Contratada no conteúdo do contrato,
// já com texto, valores e datas formatados. O PDF só desenha o resultado.
export function montarContrato(dados, contratada, emissaoISO) {
  const { contratante: c, itens, servicos, forma, evento } = dados;
  const entrega = servicos.entrega != null;
  const montagem = servicos.montagem != null;
  const t = totais(itens, servicos);
  const entregaOuRetirada = entrega ? 'entrega' : 'retirada';

  const contratanteTexto =
    `${b(c.nome)}, portador(a) do CPF nº ${b(c.cpf)}` +
    (c.rg ? ` e da cédula de identidade RG nº ${c.rg}` : '') +
    `, residente em ${c.endereco.replace(/[.\s]+$/, '')}. ` +
    `Telefone: ${c.telefone}` +
    (c.email ? `; e-mail: ${c.email}` : '') +
    '.';

  const contratadaTexto =
    `${b(contratada.nome)}, portadora da cédula de identidade RG nº ${contratada.rg} e CPF nº ${contratada.cpf}, ` +
    `inscrita no CNPJ nº ${contratada.cnpj}, residente e domiciliada em ${contratada.endereco}. ` +
    `Telefone: ${contratada.telefone}; e-mail: ${contratada.email}.`;

  const linhas = itens.map((i) => ({
    doce: i.sabor ? `${i.tipo} ${i.sabor}` : i.tipo,
    qtd: `${i.qtd} un.`,
    unitario: brl(i.precoCents),
    subtotal: brl(subtotal(i)),
  }));

  const clausula2 = entrega
    ? 'O produto deverá estar pronto e embalado na data e hora combinadas e será entregue no local do evento, conforme a Cláusula 10ª.'
    : 'O produto deverá estar pronto e embalado na data e hora combinadas para a retirada pela contratante. A entrega somente será realizada caso seja contratado o frete.';

  const secoes = [
    {
      titulo: 'Do objeto do contrato',
      clausulas: [
        cl(1, 'Constitui objeto do presente contrato a fabricação de doces gourmet, dentro dos padrões de higiene e qualidade.'),
        cl(2, clausula2),
      ],
    },
    {
      titulo: 'Obrigações da contratante',
      clausulas: [
        cl(3, 'A contratante deverá fornecer à contratada todas as informações referentes ao pedido do produto.'),
        cl(4, 'A contratante deverá efetuar o pagamento na forma e condições estabelecidas na Cláusula 6ª.'),
      ],
    },
    {
      titulo: 'Obrigações da contratada',
      clausulas: [
        cl(5, 'É dever da contratada oferecer os produtos com a qualidade e nas quantidades especificadas pela contratante, dentro dos padrões de higiene.'),
      ],
    },
  ];

  const secoesPosProduto = [
    {
      titulo: 'Do preço e condições de pagamento',
      clausulas: [
        cl(
          6,
          `O serviço contratado no presente termo será remunerado pela quantia de ${b(brl(t.final))} ` +
            `(${valorPorExtenso(t.final)}), devendo ser paga até ${PRAZO_PAGAMENTO_DIAS} dias antes da data da ${entregaOuRetirada}. ` +
            `Forma de pagamento acordada: ${forma}.`,
        ),
        cl(7, 'Em caso de inadimplemento por parte da contratante quanto ao pagamento do serviço a ser prestado, esta perderá o valor da reserva e o contrato será cancelado.'),
      ],
    },
    {
      titulo: 'Da rescisão',
      clausulas: [
        cl(
          8,
          `O contrato poderá ser rescindido pela contratante mediante comunicação formal. Caso a rescisão ocorra em prazo inferior a ${PRAZO_RESCISAO_DIAS} dias da data acordada, o valor já pago será retido, não sendo devolvido em nenhuma hipótese.`,
        ),
        cl(9, 'Caso o cancelamento seja por parte da contratada, esta deverá devolver 100% do valor já pago.'),
        {
          rotulo: 'Parágrafo único.',
          texto: `A data poderá ser alterada pela contratante sem cobrança, desde que a alteração seja comunicada com ${PRAZO_REAGENDAMENTO_DIAS} dias de antecedência da data acordada para a ${entregaOuRetirada}.`,
        },
      ],
    },
  ];

  if (entrega || montagem) {
    secoesPosProduto.push({
      titulo: 'Condições gerais',
      clausulas: [cl(10, clausulaServicos(servicos))],
    });
  }

  const eventoTexto =
    `O evento será realizado no dia ${b(`${dataPorExtenso(evento.data)} (${dataCurta(evento.data)})`)} ` +
    `às ${b(`${evento.hora}h`)} (${entrega ? 'entrega' : 'retirada'} dos doces às ${evento.horaEntrega}h` +
    `${entrega ? ' aproximadamente' : ''}), no local: ${b(evento.local)}.`;

  return {
    titulo: 'Contrato de prestação de serviços',
    contratante: { rotulo: 'Contratante', texto: contratanteTexto },
    contratada: { rotulo: 'Contratada', texto: contratadaTexto },
    preambulo:
      'As partes acima identificadas têm entre si, justo e acertado, o presente contrato de prestação de serviço para entrega de doces gourmet, que se regerá pelas cláusulas seguintes e pelas condições de preço, forma e termo de pagamento descritos no presente.',
    secoes,
    produto: {
      titulo: 'Do produto',
      paragrafo: {
        rotulo: 'Parágrafo único.',
        texto: 'A contratada se compromete a entregar os seguintes itens, na quantidade especificada, em forminhas simples:',
      },
      linhas,
      totais: {
        doces: brl(t.doces),
        entrega: entrega ? brl(t.entrega) : null,
        montagem: montagem ? brl(t.montagem) : null,
        final: brl(t.final),
      },
    },
    secoesPosProduto,
    evento: { titulo: 'Sobre o evento', texto: eventoTexto },
    fecho: `${contratada.cidade}, ${dataLonga(emissaoISO)}`,
    assinaturas: [
      { papel: 'Contratada', nome: contratada.nome, cpf: contratada.cpf },
      { papel: 'Contratante', nome: c.nome, cpf: c.cpf },
    ],
    rodape: `Contrato de prestação de serviços · ${c.nome}`,
  };
}
