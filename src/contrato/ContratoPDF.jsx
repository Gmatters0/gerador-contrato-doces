import { Document, Font, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

// Sem hifenização: evita quebras estranhas no meio de nomes e valores.
Font.registerHyphenationCallback((palavra) => [palavra]);

const COR = {
  texto: '#2E2624',
  cacau: '#4B2E2B',
  rosa: '#B4536F',
  rosaClaro: '#F7E6EA',
  creme: '#FBF5F1',
  linha: '#E6D3CB',
  zebra: '#FAF3EF',
  cinza: '#8A7C77',
};

const s = StyleSheet.create({
  pagina: {
    fontFamily: 'Helvetica',
    fontSize: 9.5,
    color: COR.texto,
    paddingTop: 44,
    paddingBottom: 50,
    paddingHorizontal: 54,
    lineHeight: 1.42,
  },
  faixa: { position: 'absolute', top: 0, left: 0, right: 0, height: 9, backgroundColor: COR.rosa },
  faixaFina: { position: 'absolute', top: 9, left: 0, right: 0, height: 2, backgroundColor: COR.cacau },

  titulo: {
    fontWeight: 700,
    fontSize: 19,
    color: COR.cacau,
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 1.6,
    lineHeight: 1.25,
  },
  ornamento: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8, marginBottom: 4 },
  ornLinha: { width: 70, height: 0.8, backgroundColor: COR.rosa },
  ornLosango: { width: 6, height: 6, backgroundColor: COR.rosa, marginHorizontal: 8, transform: 'rotate(45deg)' },

  secao: {
    fontWeight: 600,
    fontSize: 10,
    color: COR.rosa,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    marginTop: 12,
    marginBottom: 5,
    paddingBottom: 3,
    borderBottomWidth: 0.8,
    borderBottomColor: COR.linha,
  },
  paragrafo: { textAlign: 'justify', marginBottom: 4 },
  rotulo: { fontWeight: 700, color: COR.cacau },
  negrito: { fontWeight: 700 },

  parte: {
    backgroundColor: COR.creme,
    borderLeftWidth: 3,
    borderLeftColor: COR.rosa,
    paddingVertical: 6,
    paddingHorizontal: 11,
    marginBottom: 6,
  },
  parteRotulo: {
    fontWeight: 600,
    fontSize: 8,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    color: COR.rosa,
    marginBottom: 1,
  },

  tabela: { marginTop: 4, borderWidth: 0.8, borderColor: COR.linha },
  th: { flexDirection: 'row', backgroundColor: COR.cacau, paddingVertical: 5, paddingHorizontal: 8 },
  thTexto: { color: '#FFFFFF', fontWeight: 700, fontSize: 8.5, textTransform: 'uppercase', letterSpacing: 0.6 },
  tr: { flexDirection: 'row', paddingVertical: 4.5, paddingHorizontal: 8, borderTopWidth: 0.5, borderTopColor: COR.linha },
  cDoce: { width: '46%' },
  cQtd: { width: '14%', textAlign: 'right' },
  cUnit: { width: '20%', textAlign: 'right' },
  cSub: { width: '20%', textAlign: 'right' },

  totais: { marginVertical: 7, marginRight: 7, alignSelf: 'flex-end', width: 230 },
  totalLinha: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 2.5, paddingHorizontal: 8 },
  totalFinal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginTop: 3,
    backgroundColor: COR.rosa,
  },
  totalFinalTexto: { color: '#FFFFFF', fontWeight: 700, fontSize: 10.5 },

  evento: {
    backgroundColor: COR.rosaClaro,
    borderLeftWidth: 3,
    borderLeftColor: COR.cacau,
    paddingVertical: 8,
    paddingHorizontal: 12,
    textAlign: 'justify',
  },

  fecho: { marginTop: 16, textAlign: 'center', fontStyle: 'italic', color: COR.cacau },
  assinaturas: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 30 },
  assinatura: { width: '44%', alignItems: 'center' },
  assLinha: { width: '100%', borderTopWidth: 0.8, borderTopColor: COR.cacau, marginBottom: 4 },
  assNome: { fontWeight: 700, fontSize: 9, textAlign: 'center', color: COR.cacau },
  assPapel: { fontSize: 8.5, color: COR.cinza, textAlign: 'center' },

  rodape: {
    position: 'absolute',
    bottom: 22,
    left: 54,
    right: 54,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 0.5,
    borderTopColor: COR.linha,
    paddingTop: 5,
    fontSize: 7.5,
    color: COR.cinza,
  },
});

// Converte **negrito** em trechos <Text> aninhados.
function Rico({ texto }) {
  return texto.split(/\*\*(.+?)\*\*/g).map((parte, i) =>
    i % 2 ? (
      <Text key={i} style={s.negrito}>
        {parte}
      </Text>
    ) : (
      parte
    ),
  );
}

function Clausula({ rotulo, texto }) {
  return (
    <Text style={s.paragrafo} wrap={false}>
      <Text style={s.rotulo}>{rotulo} </Text>
      <Rico texto={texto} />
    </Text>
  );
}

// O título da seção só fica na página junto com a primeira cláusula.
function Secao({ titulo, children }) {
  return (
    <View>
      <Text style={s.secao} minPresenceAhead={60}>
        {titulo}
      </Text>
      {children}
    </View>
  );
}

function Parte({ rotulo, texto }) {
  return (
    <View style={s.parte} wrap={false}>
      <Text style={s.parteRotulo}>{rotulo}</Text>
      <Text style={{ textAlign: 'justify' }}>
        <Rico texto={texto} />
      </Text>
    </View>
  );
}

function Linha({ l, i }) {
  return (
    <View style={[s.tr, i % 2 ? { backgroundColor: COR.zebra } : {}]} wrap={false}>
      <Text style={s.cDoce}>{l.doce}</Text>
      <Text style={s.cQtd}>{l.qtd}</Text>
      <Text style={s.cUnit}>{l.unitario}</Text>
      <Text style={s.cSub}>{l.subtotal}</Text>
    </View>
  );
}

function ListaClausulas({ secao }) {
  return (
    <Secao titulo={secao.titulo}>
      {secao.clausulas.map((c) => (
        <Clausula key={c.rotulo} {...c} />
      ))}
    </Secao>
  );
}

export function ContratoPDF({ contrato: k }) {
  return (
    <Document title={k.rodape} author={k.assinaturas[0].nome} language="pt-BR">
      <Page size="A4" style={s.pagina}>
        <View fixed style={s.faixa} />
        <View fixed style={s.faixaFina} />

        <Text style={s.titulo}>{k.titulo}</Text>
        <View style={s.ornamento}>
          <View style={s.ornLinha} />
          <View style={s.ornLosango} />
          <View style={s.ornLinha} />
        </View>

        <Text style={[s.secao, { marginTop: 8 }]}>Identificação das partes</Text>
        <Parte {...k.contratante} />
        <Parte {...k.contratada} />
        <Text style={[s.paragrafo, { marginTop: 3 }]}>{k.preambulo}</Text>

        {k.secoes.map((sec) => (
          <ListaClausulas key={sec.titulo} secao={sec} />
        ))}

        <Secao titulo={k.produto.titulo}>
          <Clausula {...k.produto.paragrafo} />
          <View style={s.tabela}>
            <View style={s.th} fixed>
              <Text style={[s.thTexto, s.cDoce]}>Doce</Text>
              <Text style={[s.thTexto, s.cQtd]}>Qtd.</Text>
              <Text style={[s.thTexto, s.cUnit]}>Unitário</Text>
              <Text style={[s.thTexto, s.cSub]}>Subtotal</Text>
            </View>
            {k.produto.linhas.slice(0, -1).map((l, i) => (
              <Linha key={i} l={l} i={i} />
            ))}
            {/* Última linha e totais andam juntos: os totais nunca ficam sozinhos numa página. */}
            <View wrap={false}>
              <Linha l={k.produto.linhas.at(-1)} i={k.produto.linhas.length - 1} />
              <View style={s.totais}>
                <View style={s.totalLinha}>
                  <Text>Total dos doces</Text>
                  <Text style={s.negrito}>{k.produto.totais.doces}</Text>
                </View>
                {k.produto.totais.taxa && (
                  <View style={s.totalLinha}>
                    <Text>Entrega e montagem</Text>
                    <Text style={s.negrito}>{k.produto.totais.taxa}</Text>
                  </View>
                )}
                <View style={s.totalFinal}>
                  <Text style={s.totalFinalTexto}>Valor final</Text>
                  <Text style={s.totalFinalTexto}>{k.produto.totais.final}</Text>
                </View>
              </View>
            </View>
          </View>
        </Secao>

        {k.secoesPosProduto.map((sec) => (
          <ListaClausulas key={sec.titulo} secao={sec} />
        ))}

        {/* Evento e assinaturas ficam sempre juntos, para a assinatura não cair sozinha numa página. */}
        <View wrap={false}>
          <Secao titulo={k.evento.titulo}>
            <View style={s.evento}>
              <Text>
                <Rico texto={k.evento.texto} />
              </Text>
            </View>
          </Secao>

          <Text style={s.fecho}>{k.fecho}</Text>
          <View style={s.assinaturas}>
            {k.assinaturas.map((a) => (
              <View key={a.papel} style={s.assinatura}>
                <View style={s.assLinha} />
                <Text style={s.assNome}>{a.nome}</Text>
                <Text style={s.assPapel}>
                  {a.papel} · CPF {a.cpf}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View fixed style={s.rodape}>
          <Text>{k.rodape}</Text>
          <Text render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}
