'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FileText } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function TermsOfServicePage() {
    const [lastUpdated, setLastUpdated] = useState('');

    useEffect(() => {
        setLastUpdated(new Date().toLocaleString('pt-BR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }));
    }, []);

    return (
        <div className="container mx-auto py-12 px-4 sm:px-6 lg:px-8 max-w-4xl">
            <Card className="border-primary/20">
                <CardHeader className="text-center">
                    <div className="mx-auto bg-primary/10 text-primary p-3 rounded-full w-fit mb-4">
                        <FileText className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-3xl font-bold font-headline">Termos de Uso e Serviços</CardTitle>
                    <CardDescription>
                        Última atualização: {lastUpdated}
                    </CardDescription>
                </CardHeader>
                <CardContent className="prose prose-sm sm:prose-base max-w-none text-justify">
                    <p>Bem-vindo(a) à PECU'S INTERMEDIATE.</p>
                    <p>Este documento ("Termos de Uso e Serviços") estabelece as regras para a utilização da nossa plataforma, que engloba um Marketplace, Calculadoras e Simuladores Econômicos, e a oferta de Petições e Contratos.</p>
                    <p className="font-bold">AO ACESSAR, CADASTRAR-SE OU UTILIZAR QUAISQUER DOS SERVIÇOS DA PECU'S INTERMEDIATE, VOCÊ DECLARA TER LIDO, COMPREENDIDO E ACEITO INTEGRALMENTE ESTES TERMOS.</p>

                    <h4>1. Definições</h4>
                    <ul>
                        <li><strong>PECU'S INTERMEDIATE:</strong> A empresa que detém e opera a plataforma digital, fornecendo a infraestrutura para a oferta dos Serviços.</li>
                        <li><strong>Usuário:</strong> Qualquer pessoa física ou jurídica, devidamente cadastrada, que acesse ou utilize os Serviços da Plataforma, seja como Comprador ou Vendedor.</li>
                        <li><strong>Comprador:</strong> O Usuário que adquire Produtos e/ou Serviços oferecidos por Vendedores no Marketplace.</li>
                        <li><strong>Vendedor:</strong> O Usuário, pessoa física ou jurídica, que se cadastra para ofertar e comercializar seus Produtos e/ou Serviços no Marketplace.</li>
                        <li><strong>Marketplace:</strong> Ambiente virtual onde Vendedores podem oferecer seus Produtos e/ou Serviços (físicos, digitais ou serviços) e Compradores podem adquiri-los, sendo a PECU'S INTERMEDIATE mera intermediadora e não fornecedora final.</li>
                        <li><strong>Serviços Específicos:</strong> Os serviços oferecidos pela própria PECU'S INTERMEDIATE, como as Calculadoras, Simuladores Econômicos, e os modelos de Petições e Contratos.</li>
                    </ul>

                    <h4>2. Objeto</h4>
                    <p>O presente Termo regula o acesso e o uso da plataforma PECU'S INTERMEDIATE, cujo objeto principal é:</p>
                    <ul>
                        <li><strong>Marketplace:</strong> Intermediação e facilitação de transações de compra e venda entre Vendedores e Compradores.</li>
                        <li><strong>Serviços Específicos:</strong> Disponibilização de ferramentas de cálculo, simulação e modelos de documentos jurídicos (petições e contratos).</li>
                    </ul>

                    <h4>3. Do Marketplace (Intermediação)</h4>
                    <h5>3.1. Natureza do Serviço</h5>
                    <p>A PECU'S INTERMEDIATE atua exclusivamente como intermediadora, fornecendo a plataforma tecnológica para que Vendedores e Compradores se conectem e realizem transações. A PECU'S INTERMEDIATE NÃO É FORNECEDORA, FABRICANTE, PRESTADORA DE SERVIÇO, OU PROPRIETÁRIA dos produtos e serviços ofertados pelos Vendedores no Marketplace.</p>
                    <h5>3.2. Responsabilidade do Vendedor</h5>
                    <p>O Vendedor é o único e exclusivo responsável por:</p>
                    <ul>
                        <li>A qualidade, origem, legalidade, segurança, veracidade e adequação dos Produtos e/ou Serviços anunciados.</li>
                        <li>O cumprimento das ofertas, prazos de entrega, políticas de troca, devolução e garantia, conforme a legislação vigente, especialmente o Código de Defesa do Consumidor (CDC).</li>
                        <li>O pagamento de impostos, taxas ou contribuições incidentes sobre suas vendas e operações.</li>
                        <li>A correta e completa descrição dos produtos/serviços, preços, condições e informações cadastrais.</li>
                    </ul>
                    <h5>3.3. Responsabilidade do Comprador</h5>
                    <p>O Comprador é o único responsável por:</p>
                    <ul>
                        <li>Verificar a veracidade das informações e as condições de compra e venda oferecidas pelo Vendedor.</li>
                        <li>Zelar pela guarda de seus dados de acesso e pelo pagamento dos valores devidos.</li>
                    </ul>
                    <h5>3.4. Relação de Consumo</h5>
                    <p>A relação de consumo é estabelecida diretamente entre o Comprador e o Vendedor. A PECU'S INTERMEDIATE se exime de qualquer responsabilidade por perdas e danos de qualquer natureza decorrentes das transações realizadas entre Usuários no Marketplace.</p>
                    
                    <h4>4. Dos Serviços Específicos (Calculadoras, Simuladores, Petições e Contratos)</h4>
                    <h5>4.1. Natureza Informativa e Educacional</h5>
                    <p>Os resultados fornecidos pelas Calculadoras e Simuladores Econômicos e os modelos de Petições e Contratos possuem natureza meramente informativa, educacional e de apoio.</p>
                    <h5>4.2. Exclusão de Responsabilidade</h5>
                    <ul>
                        <li><strong>Não são Aconselhamento Profissional:</strong> As ferramentas e modelos de documentos NÃO constituem e não substituem aconselhamento, consultoria ou diagnóstico jurídico, financeiro, contábil ou de qualquer outra natureza profissional.</li>
                        <li><strong>Recomendação:</strong> O Usuário deve sempre consultar um profissional habilitado (advogado, contador, economista, etc.) antes de tomar qualquer decisão ou utilizar os documentos em situações reais, pois as informações não consideram as particularidades de cada caso.</li>
                        <li><strong>Limitação de Erros:</strong> A PECU'S INTERMEDIATE se esforça para manter as ferramentas e modelos atualizados e corretos, mas não garante a precisão, adequação ou integridade de quaisquer informações ou cálculos, eximindo-se de responsabilidade por perdas ou danos decorrentes de erros ou omissões.</li>
                    </ul>

                    <h4>5. Cadastro e Conta de Usuário</h4>
                    <ul>
                        <li><strong>Capacidade Legal:</strong> O Usuário declara ser maior de 18 (dezoito) anos ou emancipado, e possuir capacidade civil para celebrar contratos.</li>
                        <li><strong>Veracidade dos Dados:</strong> O Usuário se compromete a fornecer dados cadastrais completos, verdadeiros, válidos e atualizados. A PECU'S INTERMEDIATE não se responsabiliza por dados incorretos ou falsos.</li>
                        <li><strong>Segurança:</strong> O Usuário é o único responsável pela segurança e sigilo de seu login e senha, devendo notificar imediatamente a PECU'S INTERMEDIATE em caso de uso não autorizado.</li>
                    </ul>

                    <h4>6. Propriedade Intelectual</h4>
                    <ul>
                        <li><strong>Conteúdo da Plataforma:</strong> Todo o conteúdo da Plataforma (incluindo software, design, marcas, logotipos, textos, layout, códigos, exceto os conteúdos de terceiros Vendedores) é de propriedade exclusiva da PECU'S INTERMEDIATE ou de seus licenciadores. O uso da Plataforma não confere ao Usuário qualquer direito sobre a Propriedade Intelectual da PECU'S INTERMEDIATE.</li>
                        <li><strong>Conteúdo do Vendedor:</strong> O Vendedor concede à PECU'S INTERMEDIATE uma licença não exclusiva para utilizar, reproduzir e exibir publicamente as imagens, textos e descrições de seus produtos/serviços com o objetivo de promover a venda no Marketplace. O Vendedor garante ser o titular dos direitos ou ter autorização para o uso do conteúdo.</li>
                    </ul>

                    <h4>7. Privacidade e Proteção de Dados (LGPD)</h4>
                    <p>A PECU'S INTERMEDIATE se compromete com a proteção e o tratamento dos dados pessoais dos Usuários em conformidade com a legislação brasileira, em especial a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD). O Usuário deve consultar a Política de Privacidade da Plataforma, que é parte integrante destes Termos, para entender como seus dados são coletados, usados, armazenados e protegidos.</p>

                    <h4>8. Penalidades</h4>
                    <p>O descumprimento de qualquer condição destes Termos poderá gerar penalidades ao Usuário, a critério da PECU'S INTERMEDIATE, incluindo, mas não se limitando a: suspensão ou cancelamento do cadastro, remoção de anúncios/conteúdo e, se necessário, o acionamento das medidas legais cabíveis.</p>

                    <h4>9. Modificações dos Termos</h4>
                    <p>A PECU'S INTERMEDIATE poderá, a qualquer momento, alterar estes Termos de Uso e Serviços para adaptá-los a novos serviços, práticas ou exigências legais. As alterações entrarão em vigor após sua publicação na Plataforma. O uso continuado da Plataforma após a publicação das alterações constitui a aceitação dos novos Termos.</p>

                    <h4>10. Legislação e Foro</h4>
                    <p>Estes Termos de Uso e Serviços são regidos pelas leis da República Federativa do Brasil. Para dirimir quaisquer questões decorrentes deste Termo, fica eleito o Foro da Comarca da sede da PECU'S INTERMEDIATE, renunciando-se a qualquer outro, por mais privilegiado que seja.</p>

                    <p className="font-bold text-center mt-6">PECU'S INTERMEDIATE</p>
                    <p className="text-center text-sm text-muted-foreground">{lastUpdated}</p>
                </CardContent>
            </Card>
        </div>
    );
}
