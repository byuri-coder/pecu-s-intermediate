'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { ShieldCheck } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';


export default function PrivacyPolicyPage() {
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
                        <ShieldCheck className="h-8 w-8" />
                    </div>
                    <CardTitle className="text-3xl font-bold font-headline">Política de Privacidade e Proteção de Dados</CardTitle>
                    <CardDescription>
                        Última atualização: {lastUpdated}
                    </CardDescription>
                </CardHeader>
                <CardContent className="prose prose-sm sm:prose-base max-w-none text-justify">
                    <p>A PECU'S INTERMEDIATE valoriza sua privacidade e a proteção de seus Dados Pessoais. Esta Política de Privacidade ("Política") descreve como tratamos, armazenamos e utilizamos as informações coletadas, em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018 - LGPD) e demais legislações aplicáveis.</p>
                    <p className="font-bold">Ao utilizar a Plataforma, você concorda com o tratamento de seus Dados Pessoais nos termos desta Política.</p>
                    
                    <h4>1. Controlador dos Dados Pessoais</h4>
                    <p>PECU'S INTERMEDIATE atua como Controladora dos Dados Pessoais tratados no âmbito da prestação de seus Serviços.</p>
                    <p><strong>Contato do Encarregado de Dados (DPO):</strong> Para qualquer dúvida ou solicitação relacionada aos seus Dados Pessoais, o contato deve ser feito através do canal oficial (e-mail ou formulário) que será disponibilizado no site da Plataforma.</p>

                    <h4>2. Dados Coletados, Finalidades e Bases Legais</h4>
                    <p>Coletamos os Dados Pessoais necessários para oferecer os serviços do Marketplace, das Calculadoras/Simuladores e dos Contratos/Petições, conforme as seguintes categorias:</p>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Categoria de Dados</TableHead>
                                <TableHead>Tipo de Dados Coletados</TableHead>
                                <TableHead>Finalidade do Tratamento</TableHead>
                                <TableHead>Base Legal (LGPD)</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>Cadastro (Obrigatório)</TableCell>
                                <TableCell>Nome completo, CPF/CNPJ, e-mail, telefone, endereço, login e senha.</TableCell>
                                <TableCell>Identificação do Usuário, gestão da conta, comunicação essencial e emissão de notas fiscais/cobranças.</TableCell>
                                <TableCell>Execução de Contrato e Cumprimento de Obrigação Legal/Regulatória.</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell>Marketplace (Transacional)</TableCell>
                                <TableCell>Dados bancários/de pagamento (via processador de pagamento), histórico de compras e vendas, dados do produto/serviço.</TableCell>
                                <TableCell>Intermediação de transações entre Compradores e Vendedores, processamento de pagamento e cumprimento de obrigações fiscais.</TableCell>
                                <TableCell>Execução de Contrato e Cumprimento de Obrigação Legal/Regulatória.</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell>Serviços Específicos</TableCell>
                                <TableCell>Dados inseridos em Calculadoras/Simuladores (ex: valores, taxas, prazos, dados financeiros simulados).</TableCell>
                                <TableCell>Fornecimento dos resultados dos cálculos e simulações, personalização e melhoria das ferramentas.</TableCell>
                                <TableCell>Legítimo Interesse ou Consentimento (a depender do dado).</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell>Navegação (Automático)</TableCell>
                                <TableCell>Endereço IP, localização, tipo de navegador, páginas visitadas, dados de cookies.</TableCell>
                                <TableCell>Melhoria da experiência do usuário, análise de desempenho, segurança da informação e prevenção a fraudes.</TableCell>
                                <TableCell>Legítimo Interesse e/ou Consentimento (para cookies não essenciais).</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell>Comunicação</TableCell>
                                <TableCell>Registros de atendimento ao cliente, dúvidas, reclamações e suporte.</TableCell>
                                <TableCell>Suporte ao Usuário, resolução de conflitos e aprimoramento do atendimento.</TableCell>
                                <TableCell>Execução de Contrato e Legítimo Interesse.</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>

                    <h4>3. Compartilhamento de Dados Pessoais</h4>
                    <p>A PECU'S INTERMEDIATE não comercializa Dados Pessoais. O compartilhamento ocorre estritamente para a execução dos Serviços ou conforme exigido por lei:</p>
                    <ul>
                        <li><strong>Vendedores e Compradores do Marketplace:</strong> Dados essenciais (nome, endereço de entrega, contato) são compartilhados para viabilizar a conclusão da transação e a logística.</li>
                        <li><strong>Prestadores de Serviços Terceirizados:</strong> Compartilhamos dados com fornecedores que nos auxiliam na prestação dos serviços (ex: empresas de processamento de pagamentos, hospedagem de dados, análise de fraude). Estes terceiros são obrigados contratualmente a proteger os dados conforme a LGPD.</li>
                        <li><strong>Autoridades Legais e Governamentais:</strong> Podemos ser obrigados a compartilhar Dados Pessoais em cumprimento a determinações judiciais ou regulatórias.</li>
                        <li><strong>Anonimização:</strong> Podemos usar dados anonimizados (sem identificação pessoal) para fins estatísticos e de melhoria dos serviços, sem restrição de compartilhamento.</li>
                    </ul>

                    <h4>4. Direitos do Titular dos Dados (LGPD)</h4>
                     <p>Você possui diversos direitos garantidos pela LGPD em relação aos seus Dados Pessoais. Você pode exercê-los a qualquer momento, mediante requisição aos canais de contato da Plataforma:</p>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Direito</TableHead>
                                <TableHead>Descrição</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>Confirmação e Acesso</TableCell>
                                <TableCell>Solicitar a confirmação da existência do tratamento de seus dados e o acesso a eles.</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell>Correção</TableCell>
                                <TableCell>Solicitar a correção de dados incompletos, inexatos ou desatualizados.</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell>Anonimização, Bloqueio ou Eliminação</TableCell>
                                <TableCell>Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários, excessivos ou tratados em desconformidade com a LGPD.</TableCell>
                            </TableRow>
                            <TableRow>
                                <TableCell>Portabilidade</TableCell>
                                <TableCell>Solicitar a transferência dos seus dados a outro fornecedor de serviço ou produto, mediante requisição expressa.</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell>Revogação do Consentimento</TableCell>
                                <TableCell>Revogar, a qualquer tempo, o consentimento fornecido para o tratamento de dados.</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell>Informação sobre Compartilhamento</TableCell>
                                <TableCell>Obter informações sobre as entidades públicas e privadas com as quais a Plataforma compartilhou seus dados.</TableCell>
                            </TableRow>
                             <TableRow>
                                <TableCell>Oposição</TableCell>
                                <TableCell>Opor-se ao tratamento realizado com base em outras bases legais que não o consentimento, em caso de descumprimento à LGPD.</TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>

                    <h4>5. Armazenamento e Segurança dos Dados</h4>
                    <ul>
                        <li><strong>Prazo de Armazenamento:</strong> Os Dados Pessoais serão armazenados somente pelo tempo necessário para cumprir as finalidades para as quais foram coletados, para cumprir obrigações legais (como as fiscais e o Marco Civil da Internet) ou para o exercício regular de direitos em processos judiciais, administrativos ou arbitrais.</li>
                        <li><strong>Medidas de Segurança:</strong> Adotamos medidas técnicas e organizacionais de segurança para proteger os Dados Pessoais contra acessos não autorizados, situações acidentais ou ilícitas de destruição, perda, alteração, comunicação ou qualquer forma de tratamento inadequado. Isso inclui o uso de criptografia, controle de acesso e políticas internas rigorosas.</li>
                    </ul>

                    <h4>6. Cookies e Tecnologias de Rastreamento</h4>
                    <p>Utilizamos cookies e outras tecnologias de rastreamento para melhorar sua experiência de navegação, personalizar conteúdo, analisar o desempenho da Plataforma e medir a eficácia de publicidade. Você pode gerenciar suas preferências de cookies a qualquer momento através das configurações do seu navegador ou do banner de cookies em nosso site.</p>

                    <h4>7. Disposições Finais</h4>
                    <ul>
                        <li><strong>Alterações:</strong> Esta Política poderá ser atualizada a qualquer momento. Quaisquer alterações significativas serão comunicadas aos Usuários por meio de notificação na Plataforma ou via e-mail.</li>
                        <li><strong>Vigência:</strong> Esta Política foi atualizada em {lastUpdated}.</li>
                    </ul>

                </CardContent>
            </Card>
        </div>
    );
}
