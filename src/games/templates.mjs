const TAB_LIBRARY = {
  overview: { label: "Visão geral", icon: "◫", description: "Informações essenciais sobre o jogo.", sections: [["summary","Resumo"],["details","Informações"],["platforms","Plataformas"]] },
  gameplay: { label: "Gameplay", icon: "⌁", description: "Mecânicas, progressão, combate e estratégias.", sections: [["mechanics","Mecânicas"],["progression","Progressão"],["combat","Combate"],["strategy","Estratégias"]] },
  items: { label: "Itens", icon: "◇", description: "Itens organizados por função e tipo.", sections: [["weapons","Armas"],["tools","Ferramentas"],["armor","Armaduras"],["food","Comida"],["potions","Poções"],["materials","Materiais"],["other","Outros"]] },
  weapons: { label: "Armas", icon: "⌖", description: "Armas, usos, atributos e formas de obtenção.", sections: [["primary","Principais"],["secondary","Secundárias"],["melee","Corpo a corpo"],["special","Especiais"]] },
  mobs: { label: "Mobs", icon: "◉", description: "Criaturas, inimigos, NPCs e chefes.", sections: [["passive","Passivos"],["neutral","Neutros"],["hostile","Hostis"],["bosses","Bosses"],["npcs","NPCs"]] },
  maps: { label: "Mapa", icon: "⌗", description: "Regiões, locais, rotas e pontos de referência.", sections: [["locations","Locais"],["regions","Regiões"],["routes","Rotas"],["landmarks","Referências"]] },
  lore: { label: "Lore", icon: "◈", description: "Informação oficial, interpretações da comunidade e teorias claramente separadas.", sections: [["official","Oficial"],["community","Comunidade"],["theories","Teorias"],["rumors","Rumores"]] },
  guides: { label: "Guias", icon: "↗", description: "Tutoriais e caminhos práticos para avançar.", sections: [["beginner","Iniciante"],["progression","Progressão"],["locations","Localizações"],["farms","Farms / Rotinas"],["advanced","Avançado"]] },
  skins: { label: "Skins", icon: "✦", description: "Cosméticos, coleções, raridades e variações.", sections: [["featured","Destaques"],["collections","Coleções"],["rarity","Raridade"],["variants","Variações"]] },
  ranks: { label: "Ranks", icon: "△", description: "Patentes, progressão competitiva e sistemas ranqueados.", sections: [["system","Sistema"],["tiers","Patentes"],["progression","Progressão"]] },
  seasons: { label: "Temporadas", icon: "◷", description: "Temporadas, capítulos, mudanças e eventos.", sections: [["current","Atual"],["history","Histórico"],["events","Eventos"]] },
  codes: { label: "Códigos", icon: "#", description: "Códigos ativos, expirados e recompensas.", sections: [["active","Ativos"],["expired","Expirados"],["rewards","Recompensas"]] },
  experiences: { label: "Experiências", icon: "▦", description: "Jogos e experiências dentro da plataforma.", sections: [["featured","Destaques"],["genres","Gêneros"],["discovery","Descoberta"]] },
  characters: { label: "Personagens", icon: "◎", description: "Personagens, habilidades, relações e papéis.", sections: [["main","Principais"],["allies","Aliados"],["villains","Vilões"],["other","Outros"]] },
  stages: { label: "Fases", icon: "▥", description: "Fases, atos, zonas e desafios.", sections: [["zones","Zonas"],["acts","Atos"],["bosses","Bosses"],["secrets","Segredos"]] },
  story: { label: "História", icon: "◈", description: "Enredo, acontecimentos e cronologia.", sections: [["main","História principal"],["timeline","Cronologia"],["events","Eventos"],["ending","Desfechos"]] },
  vehicles: { label: "Veículos", icon: "▰", description: "Veículos, classes, usos e formas de obtenção.", sections: [["cars","Carros"],["motorcycles","Motos"],["air","Aéreos"],["special","Especiais"]] },
  missions: { label: "Missões", icon: "✓", description: "Missões, objetivos, requisitos e recompensas.", sections: [["main","Principais"],["side","Secundárias"],["requirements","Requisitos"],["rewards","Recompensas"]] },
  abilities: { label: "Habilidades", icon: "✧", description: "Poderes, habilidades, upgrades e combinações.", sections: [["core","Principais"],["upgrades","Upgrades"],["combos","Combos"],["builds","Builds"]] }
};

const TEMPLATE_MAP = {
  sandbox: ["overview","gameplay","items","mobs","maps","lore","guides"],
  fps: ["overview","gameplay","weapons","maps","skins","ranks","guides"],
  "battle-royale": ["overview","gameplay","weapons","maps","skins","seasons","lore","guides"],
  "open-world": ["overview","story","characters","weapons","vehicles","maps","missions","guides"],
  platformer: ["overview","gameplay","characters","stages","items","lore","guides"],
  rpg: ["overview","story","gameplay","characters","items","abilities","maps","lore","guides"],
  racing: ["overview","gameplay","vehicles","maps","ranks","guides"],
  sports: ["overview","gameplay","ranks","guides"],
  generic: ["overview","gameplay","items","lore","guides"]
};

export function tabDefinition(id) {
  const source = TAB_LIBRARY[id] || { label: id, icon: "•", description: "Conteúdo do jogo.", sections: [["all","Tudo"]] };
  return {
    id,
    label: source.label,
    icon: source.icon,
    description: source.description,
    sections: source.sections.map(([sectionId, label]) => ({ id: sectionId, label }))
  };
}

export function buildMenu({ tabs = [], template = "generic" } = {}) {
  const ids = tabs.length ? tabs : (TEMPLATE_MAP[template] || TEMPLATE_MAP.generic);
  return ids.map(tabDefinition);
}

export function templateTabs(template = "generic") {
  return (TEMPLATE_MAP[template] || TEMPLATE_MAP.generic).map(tabDefinition);
}

export const availableTemplates = Object.keys(TEMPLATE_MAP);
