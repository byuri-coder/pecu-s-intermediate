export function getContractTemplate(assetType: string) {
    // In a real app, this could fetch different templates from a DB
    // based on the assetType. For now, we use a single generic template.
    
    return `
INSTRUMENTO PARTICULAR DE CONTRATO DE CESSÃO DE DIREITOS

Pelo presente instrumento particular, de um lado:

CEDENTE: {{seller.name}}, doravante denominado simplesmente "CEDENTE".

CESSIONÁRIO: {{buyer.name}}, doravante denominado simplesmente "CESSIONÁRIO".

As partes acima identificadas têm, entre si, justo e acertado o presente Contrato de Cessão de Direitos, que se regerá pelas cláusulas seguintes e pelas condições descritas no presente.

Cláusula 1ª. DO OBJETO DO CONTRATO
O presente contrato tem como OBJETO a cessão e transferência, de forma onerosa, da totalidade dos direitos creditórios relativos a {{amount}} unidades do ativo do tipo {{asset.type}}.

Cláusula 2ª. DO PREÇO E DAS CONDIÇÕES DE PAGAMENTO
Pela cessão dos direitos objeto deste contrato, o CESSIONÁRIO pagará ao CEDENTE o valor total acordado.
O pagamento será realizado da seguinte forma: {{paymentMethod}}.
{{#if (eq paymentMethod "parcelado")}}
O pagamento será em {{installments}} parcelas.
{{/if}}

Cláusula 3ª. DAS OBRIGAÇÕES
Compete ao CEDENTE garantir a existência, validade e livre disposição dos ativos, livres de quaisquer ônus ou gravames.
Compete ao CESSIONÁRIO realizar o pagamento nos termos e prazos acordados.

Cláusula 4ª. DO FORO
Fica eleito o foro da comarca de São Paulo/SP para dirimir quaisquer controvérsias oriundas do presente contrato.

E, por estarem assim justos e contratados, firmam o presente instrumento.

[Local], [Data].

_________________________
CEDENTE: {{seller.name}}

_________________________
CESSIONÁRIO: {{buyer.name}}
    `;
}
