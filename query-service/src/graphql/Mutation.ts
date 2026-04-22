import { createSchema } from 'nexus';

export const Mutation = createSchema({
  mutations: (t) => ({
    seedMenu: t.field({
      type: 'Boolean',
      resolve: async (_, __, { menuRepo }) => {
        const items = [
          // Pratos Principais - Italiana
          { name: 'Risoto de Funghi Porcini', description: 'Arroz arbório italiano com funghi porcini, parmesão aged e trufa negra', category: 'Pratos Principais', price: 89.90 },
          { name: 'Rigatoni al Ragú de Cordeiro', description: 'Massa fresca com ragú de cordeiro assado por 8 horas, tomato confit e pecorino romano', category: 'Pratos Principais', price: 78.90 },
          { name: 'Fettuccine ao Trufa Negra', description: 'Massa fresca handmade com奶油 trufada, parmesão 24 meses e azeite de trufa', category: 'Pratos Principais', price: 95.90 },
          { name: 'Gnocchi de Batata Baroa', description: 'Gnocchi artesanal com molho de quatro queijos e nozes caramelizadas', category: 'Pratos Principais', price: 72.90 },
          { name: 'Penne alla Vodka', description: 'Penne italiano com molho de vodka, tomate italiano e cream cheese', category: 'Pratos Principais', price: 65.90 },

          // Pratos Principais - Internacional
          { name: 'Filé Mignon ao Propriedade', description: '240g de filé mignon com manteiga garrapiçada, batatas rusticas e asparagus', category: 'Pratos Principais', price: 118.90 },
          { name: 'Salmão Grelhado', description: 'Salmão atlântico fresco com crosta de ervas, legumes grelhados e azeite de laranja', category: 'Pratos Principais', price: 98.90 },
          { name: 'Pato Confitado', description: 'Pato confitado por 12 horas com purê de mandioquinha e laranja caramelizada', category: 'Pratos Principais', price: 125.90 },
          { name: 'Costela Angus', description: 'Costela de Angus por 10 horas, acompanhamento rural e chimichurri', category: 'Pratos Principais', price: 145.90 },
          { name: 'Frango Orgânico Assado', description: 'Frango criado em fazenda orgânica, farofa de bacon e legumes da estação', category: 'Pratos Principais', price: 76.90 },

          // Entradas
          { name: 'Carpaccio de Filé', description: 'Finas fatias de filé mignon com alcaparras, parmesão e óleo de trufa', category: 'Entradas', price: 58.90 },
          { name: 'Burrata Artesanal', description: 'Burrata de bufala com tomate cherry, manjericão e redução de balsâmico', category: 'Entradas', price: 52.90 },
          { name: 'Ceviche de Corvina', description: 'Corvina fresca marinado em leche de tigre, cebola roxa e coentro', category: 'Entradas', price: 48.90 },
          { name: 'Foie Gras Terrine', description: 'Foie gras caramelizado com brioche torrado e geleia de frutas vermelhas', category: 'Entradas', price: 85.90 },
          { name: 'Arancini de Risoto', description: 'Bolinhos de risoto com mozzarella di bufala, serviço com aíoli de alho', category: 'Entradas', price: 38.90 },
          { name: 'Bruschetta Italiana', description: 'Pão italiano com tomate confit, alho assado, manjericão e azeiteEVOO', category: 'Entradas', price: 32.90 },

          // Saladas
          { name: 'Salada Waldorf', description: 'Alface americana, maçã verde, aipo, nozes e blue cheese com mel', category: 'Saladas', price: 42.90 },
          { name: 'Salada de Quinoa', description: 'Quinoa orgânica com avocado, tomate seco, feta e limão siciliano', category: 'Saladas', price: 45.90 },
          { name: 'Salada Niçoise', description: 'Atum selado, azeitonas niçoise, ovos, batata e alface romana', category: 'Saladas', price: 55.90 },

          // Acompanhamentos
          { name: 'Batatas Rústicas', description: 'Batatas星的 com alecrim, alho e azeiteEVOO', category: 'Acompanhamentos', price: 28.90 },
          { name: 'Aspargos Grelhados', description: 'Aspargos verdes com manteiga de ervas e parmesão', category: 'Acompanhamentos', price: 35.90 },
          { name: 'Espinafre ao Alho', description: 'Espinafre fresco refogado com alho, azeite e pinoli', category: 'Acompanhamentos', price: 26.90 },
          { name: 'Creme de Milho', description: 'Creme de milho fresco com bacon crocante', category: 'Acompanhamentos', price: 24.90 },
          { name: 'Arroz Biro Biro', description: 'Arroz brasileiro com lingüiça calabresa, ovos e temperos', category: 'Acompanhamentos', price: 32.90 },

          // Bebidas Não Alcoólicas
          { name: 'Coca-Cola Original 350ml', description: 'Coca-Cola gelada - Lata', category: 'Bebidas Não Alcoólicas', price: 8.90 },
          { name: 'Guaraná Antarctica 350ml', description: 'Guaraná Antarctica gelado - Lata', category: 'Bebidas Não Alcoólicas', price: 7.90 },
          { name: 'Água Mineral 500ml', description: 'Água mineral com gás ou sem gás', category: 'Bebidas Não Alcoólicas', price: 6.90 },
          { name: 'Suco de Laranja Fresh', description: 'Suco自然 de laranja espremido na hora (500ml)', category: 'Bebidas Não Alcoólicas', price: 14.90 },
          { name: 'Suco Detox', description: 'Suco verde com couve, maçã, gengibre e limão (400ml)', category: 'Bebidas Não Alcoólicas', price: 16.90 },
          { name: 'Limão Siciliano', description: 'Limonada siciliana com hortelã e gelo (500ml)', category: 'Bebidas Não Alcoólicas', price: 12.90 },
          { name: 'Chá Gelado', description: 'Chá preto ou verde com limão (500ml)', category: 'Bebidas Não Alcoólicas', price: 10.90 },
          { name: 'Água de Coco', description: 'Água de coco verde natural (400ml)', category: 'Bebidas Não Alcoólicas', price: 11.90 },

          // Cervejas
          { name: 'Heineken 600ml', description: 'Cerveja lager premium holandesa - Long Neck', category: 'Cervejas', price: 15.90 },
          { name: 'Stella Artois 600ml', description: 'Cerveja pilsen premium belga - Long Neck', category: 'Cervejas', price: 16.90 },
          { name: 'Budweiser 600ml', description: 'Cerveja lager americana - Long Neck', category: 'Cervejas', price: 12.90 },
          { name: 'Brahma 600ml', description: 'Cerveja lager brasileira - Long Neck', category: 'Cervejas', price: 8.90 },
          { name: 'Skol 600ml', description: 'Cerveja lager brasileira - Long Neck', category: 'Cervejas', price: 7.90 },
          { name: 'Original 600ml', description: 'Cerveja pilsen premium brasileira - Long Neck', category: 'Cervejas', price: 9.90 },
          { name: 'Corona Extra 355ml', description: 'Cerveja lager mexicana com limão - Long Neck', category: 'Cervejas', price: 18.90 },
          { name: 'Devassa 600ml', description: 'Cerveja pilsen brasileira artesanal - Long Neck', category: 'Cervejas', price: 10.90 },

          // Vinhos
          { name: 'Vinho Tinto - Cabernet Sauvignon', description: 'Copo de vinho chileno encorpado, notas de ameixa e cacau', category: 'Vinhos', price: 45.90 },
          { name: 'Vinho Tinto - Merlot', description: 'Copo de vinho argentino suave, notas de cereja e especiarias', category: 'Vinhos', price: 42.90 },
          { name: 'Vinho Branco - Chardonnay', description: 'Copo de vinho branco brasileiro, notas de maçã e baunilha', category: 'Vinhos', price: 38.90 },
          { name: 'Vinho Branco - Sauvignon Blanc', description: 'Copo de vinho branco chileno fresco, notas cítricas', category: 'Vinhos', price: 36.90 },
          { name: 'Vinho Rosé', description: 'Copo de vinho rosé brasileiro, notas de morango e pêssego', category: 'Vinhos', price: 34.90 },
          { name: 'Espumante Brut', description: 'Copo de espumante brut nacional, bolhas finas e persisted', category: 'Vinhos', price: 32.90 },
          { name: 'Garrafa Vino Rosso - Malbec', description: 'Garrafa de vinho tinto argentino Malbec, maturação em carvalho', category: 'Vinhos', price: 189.90 },
          { name: 'Garrafa Espumante Prosecco', description: 'Garrafa de espumante italiano Prosecco DOC', category: 'Vinhos', price: 145.90 },

          // Drinks
          { name: 'Caipirinha', description: 'Drink clássico brasileiro com cachaça, limão e açúcar', category: 'Drinks', price: 28.90 },
          { name: 'Caipivodka', description: 'Drink com vodka, limão e frutas vermelhas', category: 'Drinks', price: 32.90 },
          { name: 'Mojito', description: 'Drink cubano com rum branco, hortelã, limão e soda', category: 'Drinks', price: 35.90 },
          { name: 'Margherita', description: 'Drink mexicano com tequila, triple sec e limão', category: 'Drinks', price: 32.90 },
          { name: 'Whiskey Sour', description: 'Drink com whiskey, limão, clara de ovo e açúcar', category: 'Drinks', price: 38.90 },
          { name: 'Negroni', description: 'Drink italiano com gim, vermute e campari', category: 'Drinks', price: 36.90 },
          { name: 'Aperol Spritz', description: 'Drink italiano com Aperol, prosecco e soda', category: 'Drinks', price: 34.90 },
          { name: 'Moscow Mule', description: 'Drink com vodka, ginger beer e limão', category: 'Drinks', price: 33.90 },
          { name: 'Martini', description: 'Drink clássico com gim e vermute seco', category: 'Drinks', price: 38.90 },
          { name: 'Old Fashioned', description: 'Drink americano com bourbon, açúcar e angostura', category: 'Drinks', price: 42.90 },

          // Sobremesas
          { name: 'Tiramisù', description: 'Sobremesa italiana clássica com café, mascarpone e cacau', category: 'Sobremesas', price: 32.90 },
          { name: 'Pudim de Leite Condensado', description: 'Pudim tradicional brasileiro com calda de caramelo', category: 'Sobremesas', price: 24.90 },
          { name: 'Brownie com Sorvete', description: 'Brownie de chocolate quente com sorvete de baunilha', category: 'Sobremesas', price: 28.90 },
          { name: 'Cheesecake', description: 'Cheesecake americano com calda de frutas vermelhas', category: 'Sobremesas', price: 29.90 },
          { name: 'Crème Brûlée', description: 'Sobremesa francesa com creme de baunilha e açúcar caramelizado', category: 'Sobremesas', price: 31.90 },
          { name: 'Parfait de Fruits', description: 'Iogurte grego com frutas frescas e granola', category: 'Sobremesas', price: 26.90 },
          { name: 'Petit Gâteau', description: 'Bolo de chocolate brasileiro com coração de chocolate melt', category: 'Sobremesas', price: 34.90 },
          { name: 'Mousse de Maracujá', description: 'Mousse leve de maracujá com calda de chocolate', category: 'Sobremesas', price: 22.90 }
        ];

        for (const item of items) {
          await menuRepo.createMenuItem(item);
        }
        return true;
      }
    })
  })
});