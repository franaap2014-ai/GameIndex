import "dotenv/config";
import { seedDatabase } from "../src/database/seed.mjs";
import { gameCount } from "../src/database/repositories/game-repository.mjs";
import { knowledgeCount, claimCount } from "../src/database/repositories/knowledge-repository.mjs";
import { sourceCount } from "../src/database/repositories/source-repository.mjs";

seedDatabase();
console.log(`GameVault Beta seed pronto: ${gameCount()} jogos, ${knowledgeCount()} conhecimentos, ${claimCount()} claims, ${sourceCount()} fontes.`);
