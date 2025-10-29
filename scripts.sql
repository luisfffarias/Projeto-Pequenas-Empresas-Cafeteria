--=============================================================================
-- SCRIPT DE CRIAÇÃO DE TABELAS PARA O BANCO DE DADOS
-- Dialeto: T-SQL (SQL Server)
--=============================================================================

-- Substitua [NomeDoSeuBancoDeDados] pelo nome do seu banco de dados.
-- USE [NomeDoSeuBancoDeDados];
-- GO

--=============================================================================
-- Tabela de Usuários
--=============================================================================
CREATE TABLE Usuarios (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Email NVARCHAR(255) NOT NULL UNIQUE,
    -- IMPORTANTE: Armazene SEMPRE o HASH da senha, nunca a senha em texto puro.
    -- O tamanho pode variar dependendo do algoritmo de hash (ex: bcrypt).
    SenhaHash NVARCHAR(255) NOT NULL,
    Nome NVARCHAR(150) NOT NULL,
    IsAdmin BIT NOT NULL DEFAULT 0,       -- 0 para Falso (Padrão), 1 para Verdadeiro
    IsAssinante BIT NOT NULL DEFAULT 0   -- 0 para Falso (Padrão), 1 para Verdadeiro
);
GO

--=============================================================================
-- Tabela de Produtos
--=============================================================================
CREATE TABLE Produtos (
    IdProduto INT IDENTITY(1,1) PRIMARY KEY,
    Nome NVARCHAR(200) NOT NULL,
    Quantidade INT NOT NULL DEFAULT 0,
    Origem NVARCHAR(100),
    Intensidade NVARCHAR(100), -- Assumindo uma escala, ex: '7/10'
    Preco DECIMAL(10, 2) NOT NULL,
    Peso DECIMAL(10, 3), -- Em KG (ex: 0.250 para 250g)
    Descricao NVARCHAR(MAX),
    DataDeValidade DATE,
    Tipo NVARCHAR(100), -- Ex: 'Grão', 'Moído', 'Cápsula'
    Imagem NVARCHAR(500),
    
    -- Restrições para garantir a integridade dos dados
    CONSTRAINT CHK_Produtos_Quantidade CHECK (Quantidade >= 0),
    CONSTRAINT CHK_Produtos_Preco CHECK (Preco > 0)
);

INSERT INTO Produtos (Nome, Quantidade, Origem, Intensidade, Preco, Peso, Descricao, DataDeValidade, Tipo, Imagem) VALUES

-- ========= TIPO: GRÃO =========
('Café Caramelo-Chocolate - Mogiana Paulista', 80, 'Mogiana Paulista, SP', '6/10', 52.00, 0.250, 'Grãos 100% Arábica com torra média. Apresenta notas sensoriais de chocolate ao leite, caramelo e uma acidez equilibrada. Ideal para espresso e métodos coados.', '2026-10-15', 'Grão', 'https://i.imgur.com/VU22NqQ.png'),
('Flor de Laranjeira - Sul de Minas (Microlote)', 45, 'Sul de Minas, MG', '5/10', 65.00, 0.250, 'Um café raro de um microlote premiado. Processamento natural que resulta em notas claras de flor de laranjeira, mel e rapadura. Complexo e elegante.', '2026-09-20', 'Grão', 'https://i.imgur.com/TtnPJrc.png'),
('Frutas Vermelhas - Chapada Diamantina', 60, 'Chapada Diamantina, BA', '7/10', 58.00, 0.250, 'Café exótico com perfil frutado e acidez brilhante. Notas intensas de morango, framboesa e melaço. Perfeito para métodos filtrados que realçam sua complexidade.', '2026-11-01', 'Grão','https://i.imgur.com/vNUhCkQ.png'),
('Blend da Casa - Espresso Perfeito (1kg)', 30, 'Blend - Sul de Minas e Mogiana', '8/10', 145.00, 1.000, 'Nosso blend exclusivo em pacote de 1kg, desenvolvido para um espresso balanceado e cremoso. Combina grãos de duas regiões para um sabor encorpado e doce.', '2026-08-30', 'Grão', 'https://i.imgur.com/w2F4gQA.png'),
('Geisha Raro - Matas de Minas', 15, 'Matas de Minas, MG', '4/10', 95.00, 0.250, 'Uma joia rara. Variedade Geisha, conhecida por sua extrema complexidade aromática. Notas florais de jasmim, bergamota e pêssego. Uma experiência única.', '2026-07-10', 'Grão','https://i.imgur.com/5OcKXOu.png'),
('Doce de Leite - Cerrado Mineiro', 90, 'Cerrado Mineiro, MG', '7/10', 54.00, 0.250, 'Um clássico do Cerrado Mineiro, com notas marcantes de doce de leite, chocolate e amêndoas. Corpo aveludado e finalização longa.', '2026-11-12', 'Grão','https://i.imgur.com/4dcWnJ4.png'),
('Canela e Especiarias (Fermentado)', 25, 'Serra da Canastra, MG', '8/10', 75.00, 0.250, 'Café com fermentação anaeróbica controlada com adição de canela em pau. Resulta em notas exóticas de especiarias, frutas secas e vinho do porto.', '2026-08-05', 'Grão','https://i.imgur.com/pSp7n4s.png'),
('Café Caramelo-Chocolate - Pacote Econômico', 50, 'Mogiana Paulista, SP', '6/10', 95.00, 0.500, 'O seu café favorito em um pacote maior de 500g, com um ótimo custo-benefício para quem não fica sem.', '2026-10-15', 'Grão','https://i.imgur.com/jc6pdv1.png'),


-- ========= TIPO: MOÍDO =========
('Café Caramelo-Chocolate (Moagem Média)', 120, 'Mogiana Paulista, SP', '6/10', 53.00, 0.250, 'A conveniência do nosso clássico da Mogiana já moído. Moagem média, ideal para a maioria dos métodos coados (V60, Chemex, cafeteira elétrica).', '2026-09-15', 'Moído','https://i.imgur.com/vpDaiqT.png'),
('Blend da Casa - Moagem para Espresso', 95, 'Blend - Sul de Minas e Mogiana', '8/10', 49.00, 0.250, 'Seu espresso perfeito em casa. Nosso blend exclusivo com moagem fina, calibrada para máquinas de espresso domésticas.', '2026-08-15', 'Moído','https://i.imgur.com/6J3a2UQ.png'),
('Decaf Suave - Café Descafeinado (Moído)', 40, 'Colômbia (Origem Única)', '5/10', 56.00, 0.250, 'Café especial descafeinado através de um processo natural. Sabor suave com notas de nozes e chocolate. Moagem média para métodos coados.', '2026-07-25', 'Moído','https://i.imgur.com/w8aVNAC.png'),
('Doce de Leite - Cerrado Mineiro (Moído)', 85, 'Cerrado Mineiro, MG', '7/10', 55.00, 0.250, 'A praticidade do nosso café do Cerrado Mineiro, já moído para métodos de preparo coados.', '2026-11-01', 'Moído','https://i.imgur.com/JQ1LW8z.png'),
('Blend da Casa para Coados (1kg)', 40, 'Blend - Sul de Minas e Mogiana', '8/10', 148.00, 1.000, 'Pacote de 1kg do nosso blend exclusivo, com moagem média ideal para grandes volumes em cafeteiras elétricas ou V60.', '2026-08-20', 'Moído','https://i.imgur.com/6Yj0gzd.png'),

-- ========= TIPO: CÁPSULA =========
('Cápsula Intenso - Blend da Casa', 200, 'Blend - Sul de Minas e Mogiana', '9/10', 28.00, 0.052, 'A força e o sabor do nosso Blend da Casa. Perfeito para um espresso rápido e encorpado. Caixa com 10 cápsulas. Compatíveis com sistema Nespresso®.', '2026-11-30', 'Cápsula','https://i.imgur.com/kIGB8uj.png'),
('Cápsula Suave - Origem Única Brasil', 180, 'Cerrado Mineiro, MG', '6/10', 29.00, 0.052, 'Um café equilibrado e doce, com notas de chocolate e caramelo. Ideal para quem prefere um espresso mais suave. Caixa com 10 cápsulas. Compatíveis com sistema Nespresso®.', '2026-11-30', 'Cápsula','https://i.imgur.com/tThAjT5.png'),
('Cápsula Frutado - Edição Especial', 100, 'Etiópia (Origem Única)', '7/10', 35.00, 0.052, 'Uma edição especial com grãos da Etiópia, o berço do café. Notas marcantes de frutas amarelas e florais. Caixa com 10 cápsulas. Compatíveis com sistema Nespresso®.', '2026-10-10', 'Cápsula','https://i.imgur.com/hNj9mFa.png'),
('Cápsula Ristretto - Extra Forte', 150, 'Blend - Brasil e Colômbia', '10/10', 30.00, 0.052, 'Para os amantes de café forte. Um ristretto de torra escura, com baixa acidez e finalização persistente. Caixa com 10 cápsulas. Compatíveis com sistema Nespresso®.', '2026-12-01', 'Cápsula','https://i.imgur.com/YNsP9st.png'),
('Cápsula Descafeinado Intenso', 110, 'Blend - América do Sul', '8/10', 32.00, 0.052, 'Todo o sabor de um espresso intenso, sem a cafeína. Processo de descafeinização natural. Caixa com 10 cápsulas. Compatíveis com sistema Nespresso®.', '2026-09-01', 'Cápsula','https://i.imgur.com/6JQvA9p.png'),
('Cápsula Caramelo-Chocolate', 190, 'Mogiana Paulista, SP', '6/10', 30.00, 0.052, 'As notas doces e achocolatadas do nosso clássico da Mogiana, agora na praticidade da cápsula. Caixa com 10 unidades. Compatíveis com sistema Nespresso®.', '2026-11-25', 'Cápsula','https://i.imgur.com/hDgfnfl.png'),
('Cápsula Lungo - Dose Dupla', 160, 'Blend - Brasil', '7/10', 29.00, 0.052, 'Um blend especialmente desenvolvido para ser extraído como um café longo (110ml), mantendo o sabor e a crema. Caixa com 10 cápsulas. Compatíveis com sistema Nespresso®.', '2026-12-10', 'Cápsula','https://i.imgur.com/a512jHf.png'),
('Kit Degustação de Cápsulas (50 un.)', 50, 'Múltiplas Origens', 'Variada', 140.00, 0.260, 'A experiência completa! Um kit com 50 cápsulas, contendo 10 de cada um dos nossos 5 principais sabores (Intenso, Suave, Frutado, Ristretto, Decaf).', '2026-11-15', 'Cápsula','https://i.imgur.com/tq3iZYO.png'),

-- ========= TIPO: ACESSÓRIOS =========
('Kit Hario V60 (Tamanho 02)', 40, 'Japão', 'N/A', 180.00, 0.500, 'Kit completo para começar a preparar cafés incríveis. Inclui porta-filtro V60 de acrílico, jarra de vidro de 600ml, 40 filtros de papel e uma colher de medida.', '2100-01-01', 'Acessórios','https://i.imgur.com/SyMqw4O.png'),
('Prensa Francesa 350ml', 35, 'França (Design)', 'N/A', 120.00, 0.400, 'Clássica e elegante, esta Prensa Francesa é ideal para preparar um café encorpado e rico em óleos essenciais. Estrutura em aço inox e copo de vidro borossilicato.', '2100-01-01', 'Acessórios','https://i.imgur.com/xYain8B.png'),
('Filtro de Papel Hario V60 (100 un.)', 250, 'Japão', 'N/A', 45.00, 0.150, 'Pacote com 100 unidades do filtro de papel original Hario V60 (tamanho 02), essencial para uma extração limpa e sem resíduos.', '2100-01-01', 'Acessórios','https://i.imgur.com/iseVuc4.png'),
('Caneca Esmaltada - Coffee Fan Club', 100, 'Brasil', 'N/A', 35.00, 0.200, 'Leve um pedaço da nossa cafeteria para casa. Caneca esmaltada personalizada com o logo do Coffee Fan Club, perfeita para seu café coado.', '2100-01-01', 'Acessórios','https://i.imgur.com/0aistOv.png');


--=============================================================================
-- Tabela de Histórico de Compra
--=============================================================================
CREATE TABLE HistoricoDeCompra (
    IdCompra INT IDENTITY(1,1) PRIMARY KEY,
    IdProduto INT NOT NULL,
    EmailUsuario NVARCHAR(255) NOT NULL,
    PrecoUnitario DECIMAL(10, 2) NOT NULL,
    QuantidadeUnitaria INT NOT NULL,
    DataDaCompra DATETIME2 NOT NULL DEFAULT GETDATE(), -- Data e hora da compra
    PrecoFrete DECIMAL(10, 2) NOT NULL DEFAULT 0,
    Desconto DECIMAL(10, 2) NOT NULL DEFAULT 0,
    
    -- Coluna computada para calcular o preço total automaticamente
    PrecoTotal AS ( (PrecoUnitario * QuantidadeUnitaria) + PrecoFrete - Desconto ),

    -- Definição das Chaves Estrangeiras
    CONSTRAINT FK_Historico_Produtos FOREIGN KEY (IdProduto) REFERENCES Produtos(IdProduto),
    CONSTRAINT FK_Historico_Usuarios FOREIGN KEY (EmailUsuario) REFERENCES Usuarios(Email),

    -- Restrições para garantir a integridade dos dados
    CONSTRAINT CHK_Historico_Quantidade CHECK (QuantidadeUnitaria > 0)
);
GO

--=============================================================================
-- Tabela de Cursos
--=============================================================================
CREATE TABLE Cursos (
    IdCurso INT IDENTITY(1,1) PRIMARY KEY,
    Nome NVARCHAR(150) NOT NULL,
    DescricaoBasica NVARCHAR(255),
    DescricaoCompleta NVARCHAR(MAX),
    DuracaoHoras INT NULL,
    Tipo NVARCHAR(50),
    Preco DECIMAL(10, 2) NOT NULL,
    Modalidade NVARCHAR(50),
Imagem NVARCHAR(50),
    
    CONSTRAINT CHK_Cursos_Preco CHECK (Preco >= 0)
);

INSERT INTO Cursos (Nome, DescricaoBasica, DescricaoCompleta, DuracaoHoras, Tipo, Preco, Modalidade, Imagem) VALUES
(
    'Oficina de Barista Iniciante',
    'Dê seus primeiros passos no mundo do café! Aprenda na prática a operar uma máquina de espresso e a vaporizar o leite como um profissional.',
    'Neste workshop intensivo e **totalmente prático** de 8 horas, você vai mergulhar no universo do barista. Cobriremos os fundamentos essenciais: a diferença entre grãos arábica e robusta, a importância da moagem correta (e como regulá-la), e a anatomia da máquina de espresso. Você aprenderá a extrair o espresso perfeito, avaliando tempo, volume e crema. O foco principal será nas técnicas de vaporização de leite para criar cappuccinos cremosos e lattes, com uma **introdução ao latte art (coração)**. Ideal para entusiastas e futuros profissionais que querem uma base sólida. Todo material está incluso e você recebe um certificado de participação ao final.',
    8,
    'Workshop',
    350.00,
    'Presencial',
    'https://i.imgur.com/JW7AO4Q.png'
),
(
    'Curso Online: Métodos de Preparo em Casa',
    'Transforme o café que você faz em casa! Domine os métodos V60, Prensa Francesa e Aeropress com nosso curso online de acesso vitalício.',
    'Descubra os segredos por trás de uma xícara de café coado perfeita, **direto do conforto da sua casa**. Com mais de 12 horas de videoaulas detalhadas, este curso online ensina você a dominar as 5 variáveis-chave: moagem, temperatura da água, tempo de extração, proporção (ratio) e turbulência. Exploramos a fundo as nuances da Prensa Francesa (corpo e sedosidade), a limpeza e brilho do Hario V60, a versatilidade do Aeropress e a elegância da Chemex. **Inclui módulos bônus sobre qualidade da água e escolha de filtros.** Assista quando e onde quiser, com acesso vitalício e suporte em nossa comunidade de alunos.',
    12,
    'Curso Online',
    249.90,
    'Online',
    'https://i.imgur.com/ibQ0qNX.png'
),
(
    'Formação Completa: Barista Profissional',
    'A formação definitiva para quem sonha em trabalhar com café. Um curso completo de 120 horas que vai da semente à gestão do negócio.',
    'Esta é a nossa imersão definitiva na profissão de barista. Ao longo de 120 horas, divididas em **módulos teóricos e práticos**, você aprenderá toda a cadeia do café: da semente à xícara, e da xícara ao negócio. **Módulos Inclusos:** 1. Botânica e Processos (pós-colheita: natural, lavado, honey). 2. Análise Sensorial (cupping profissional e calibragem de paladar). 3. Fundamentos e Perfil de Torra. 4. Barista Master (extração avançada de espresso, diagnóstico de sub e super-extração, manutenção de moinho). 5. Latte Art Profissional (do coração ao cisne). 6. Métodos Filtrados Avançados (V60, Chemex, Siphon, Kalita). 7. Gestão de Cafeteria (atendimento ao cliente, gestão de estoque, CMV e noções de como montar seu próprio negócio).',
    120,
    'Curso Completo',
    1890.00,
    'Presencial',
    'https://i.imgur.com/OCtiiKE.png'
),
(
    'A Jornada do Grão à Xícara (Online)',
    'Para os verdadeiros curiosos: entenda todo o processo que leva o café da fazenda até a sua xícara. Um curso teórico e fascinante.',
    'Você já se perguntou por que cafés de origens diferentes têm sabores tão distintos? Neste curso **teórico e narrativo** de 40 horas, vamos desvendar todos os mistérios da cadeia produtiva. **Viaje conosco** desde o *terroir* e as variedades botânicas (Bourbon, Catuaí, Geisha), passando pelos métodos de processamento (natural, lavado, honey) e seu impacto direto na bebida. Mergulhe nos segredos da torra, entendendo a curva de torra, o "primeiro crack" (first crack) e como o mestre de torras "desenvolve" o sabor. Ideal para apreciadores que querem aprofundar seu conhecimento e **comprar café de forma mais consciente**.',
    40,
    'Curso Online',
    479.90,
    'Online',
    'https://i.imgur.com/xeYOnry.png'
),
(
    'Degustação Guiada: Sabores do Brasil',
    'Eduque seu paladar! Participe de uma degustação presencial e aprenda a identificar os incríveis sabores dos cafés brasileiros.',
    'Participe de uma sessão de *cupping* (degustação técnica) profissional, guiada por nosso Head Barista. Nesta experiência sensorial de 3 horas, você provará cafés especiais de 5 *terroirs* brasileiros icônicos, como Mogiana Paulista, Sul de Minas, Chapada Diamantina, Matas de Minas e Cerrado Mineiro. Utilizaremos o **protocolo oficial de cupping**, treinando seu paladar para identificar e verbalizar notas de acidez (cítrica, málica), corpo (amanteigado, sedoso), doçura e aromas complexos (florais, frutados, achocolatados). Uma viagem sensorial inesquecível pelo mapa do café no Brasil. **Não é necessário conhecimento prévio.**',
    3,
    'Degustação',
    120.00,
    'Presencial',
    'https://i.imgur.com/RR0kkQ8.png'
),
(
    'Workshop Avançado de Latte Art',
    'Leve sua arte no café para o próximo nível. Aprenda a criar desenhos complexos como a roseta, tulipa invertida e o elegante cisne.',
    'Leve sua arte no café para o próximo nível. Este workshop é **100% focado em prática** para quem já domina o coração básico e quer evoluir. Em 4 horas de prática intensa, focaremos em duas habilidades-chave: **controle de fluxo** (para criar a base perfeita) e **técnicas de desenho** (etching e free pour). Você treinará exaustivamente a criar desenhos complexos como a roseta, a tulipa (simples e invertida) e o elegante cisne. As turmas são reduzidas (máximo 4 alunos) para garantir atenção individual do instrutor. Pré-requisito: ter concluído a Oficina de Barista Iniciante ou demonstrar domínio na vaporização de leite.',
    4,
    'Workshop Avançado',
    420.00,
    'Presencial',
    'https://i.imgur.com/ILqbCyM.png'
),
(
    'Especialista em Cold Brew e Cafés Gelados',
    'Refresque seus dias! Aprenda a preparar Cold Brew concentrado e a criar deliciosos drinks de café gelado para surpreender a todos.',
    'Refresque seus dias e seu cardápio! Aprenda a preparar o verdadeiro Cold Brew concentrado e a criar deliciosos drinks de café gelado. Descubra a ciência por trás da extração a frio (imersão vs. gotejamento), que resulta em uma bebida suave, doce e com **até 70% menos acidez** que o café quente. Neste workshop prático de 3 horas, você aprenderá a receita e as proporções do nosso famoso Cold Brew, além de criar drinks autorais e clássicos como o Coffee Tônica, o Cold Brew Latte (com espuma de leite fria) e o **Espresso Tônica**. Perfeito para o verão! Leve para casa uma garrafa do concentrado que produzirmos em aula.',
    3,
    'Workshop',
    260.00,
    'Presencial',
    'https://i.imgur.com/3vLfE97.png'
),
(
    'Harmonização: Cafés Especiais e Confeitaria',
    'Uma experiência de sabores inesquecível. Descubra como combinar diferentes perfis de cafés com doces e sobremesas artesanais.',
    'Uma experiência de sabores inesquecível. Descubra como combinar diferentes perfis de cafés com doces e sobremesas artesanais. Nesta sessão guiada de 2 horas, exploraremos o fascinante mundo da harmonização por **similaridade e contraste**. Você provará 3 cafés especiais com perfis sensoriais distintos (um frutado/ácido, um achocolatado/encorpado e um exótico/fermentado) e aprenderá a combiná-los com 3 sobremesas criadas por nosso confeiteiro (ex: cheesecake de frutas vermelhas, brownie de chocolate intenso e um doce de limão siciliano). Uma oportunidade única de educar seu paladar e descobrir combinações surpreendentes.',
    2,
    'Experiência',
    190.00,
    'Presencial',
    'https://i.imgur.com/XHbrYlv.png'
),
(
    'Masterclass Online: Dominando o Hario V60',
    'Aprenda todos os segredos do método de extração mais amado pelos baristas e extraia cafés incríveis com seu V60 em casa.',
    'Aprenda todos os segredos do método de extração mais amado (e técnico) pelos baristas. Este curso online de 6 horas é um mergulho profundo no Hario V60. Vamos abordar tudo: a física da extração, a diferença entre filtros (japonês vs. holandês), tipos de moagem específicos para V60, a importância da chaleira *gooseneck* e o controle total do despejo (*pour*). Você aprenderá na prática **3 receitas famosas**: a clássica de 4 fases, a receita de Tetsu Kasuya (4:6) e a técnica de alta extração de Scott Rao. **Transforme seu café coado em casa.** Acesso vitalício para assistir e praticar.',
    6,
    'Curso Online',
    199.90,
    'Online',
    'https://i.imgur.com/p4Fucil.png'
),
(
    'Introdução à Arte da Torra de Café',
    'Para os mais apaixonados! Acompanhe de perto o processo de torra e entenda como o calor transforma o grão verde em uma joia cheia de sabor.',
    'Para os mais apaixonados! Acompanhe de perto o processo mágico que transforma o grão verde em uma joia cheia de sabor. Este é um workshop exclusivo (turmas de 2 alunos) e **extremamente prático**. Durante 5 horas, você acompanhará nosso mestre de torra em uma sessão real em nosso torrador profissional. Você aprenderá sobre perfis de torra (ascendentes vs. S-curve), como identificar o "primeiro crack", a importância do "tempo de desenvolvimento" (DTR) e como diferentes perfis ressaltam acidez ou doçura. **Você operará o torrador sob supervisão** e fará a análise sensorial do resultado. Ao final, você leva para casa 1kg do café que ajudou a torrar.',
    5,
    'Workshop Avançado',
    550.00,
    'Presencial',
    'https://i.imgur.com/CeW38GA.png'
);


--=============================================================================
-- Tabela de Planos de Assinatura
--=============================================================================
CREATE TABLE Planos (
    IdPlano INT IDENTITY(1,1) PRIMARY KEY,
    Nome NVARCHAR(150) NOT NULL,
    Descricao NVARCHAR(MAX),
    Tipo NVARCHAR(50),      
    Preco DECIMAL(10, 2) NOT NULL,
    Modalidade NVARCHAR(50), 
    Imagem NVARCHAR(500) NULL, -- <-- COLUNA ADICIONADA AQUI
    
    CONSTRAINT CHK_Planos_Preco CHECK (Preco >= 0)
);

INSERT INTO Planos (Nome, Descricao, Tipo, Preco, Modalidade, Imagem) VALUES -- <-- 'Imagem' ADICIONADA
(
    'Seleção do Mês | Coffee Fan Club',
    'O plano perfeito para quem ama descobrir novos sabores. Assine e receba em casa, todo mês, um pacote de 250g de um café especial diferente, selecionado a dedo por nosso mestre de torra. O valor da assinatura já inclui o café e a entrega. Sem custos adicionais!',
    'Mensal',
    75.90,
    'Online',
    'https://i.imgur.com/XREPiRA.png'
),
(
    'Plano Entusiasta | Coffee Fan Club',
    'O plano perfeito para nossos frequentadores! Ganhe 10% de desconto em todas as bebidas e um café coado especial por nossa conta toda semana. Ideal para quem ama nosso ambiente.',
    'Mensal',
    29.90,
    'Presencial',
    'https://i.imgur.com/M2sm5tQ.png'
),
(
    'Plano Mestre do Clube | Coffee Fan Club',
    'A experiência definitiva do Coffee Fan Club! Combine os benefícios de todos os planos: receba seu café especial em casa, ganhe 15% de desconto em TUDO na loja, um drink grátis por semana e acesso antecipado a eventos.',
    'Mensal',
    99.90,
    'Presencial',
    'https://i.imgur.com/i8HWLge.png'
),
(
    'Seleção Anual | Coffee Fan Club',
    'Garanta um ano inteiro de descobertas! Pague por 11 meses e receba 12 entregas do nosso café especial em casa. A melhor opção para quem não quer perder nenhuma seleção do nosso mestre de torra.',
    'Anual',
    834.90, 
    'Online',
    'https://i.imgur.com/5lGz1i3.png'
);
