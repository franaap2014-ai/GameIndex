import "dotenv/config";
import { seedDatabase } from "../src/database/seed.mjs";
import { listGames } from "../src/database/repositories/game-repository.mjs";
import { resolveGameVisual } from "../src/images/image-service.mjs";
import { consultGameVault } from "../src/brain/brain.mjs";

seedDatabase();
const deep=process.argv.includes("--deep");
const games=listGames({includeDrafts:false});
console.log(`Enriquecendo ${games.length} jogos. Pesquisa profunda: ${deep?"SIM":"NÃO"}`);
for(const game of games){
  process.stdout.write(`- ${game.nome}: `);
  try{
    const visual=await resolveGameVisual(game,{language:"pt-BR"});
    process.stdout.write(visual.cover?"capa OK":"sem capa");
    if(deep){
      const result=await consultGameVault({question:`O que é ${game.nome}?`,currentGame:game.slug,conversationId:`seed-${game.slug}`,language:"pt-BR",forceResearch:true});
      process.stdout.write(result.answer?.researched?" + pesquisa OK":" + pesquisa limitada");
    }
  }catch(error){process.stdout.write(`falha: ${error.message}`);}finally{process.stdout.write("\n");}
}
console.log("Enriquecimento concluído.");
