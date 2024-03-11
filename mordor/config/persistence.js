import { FlatFile } from "../persistence/strategies/FlatFile";
import { InMemory } from "../persistence/strategies/InMemory";

export const persistenceStrategy = new FlatFile('./data', true);
export const testingPersistenceStrategy = new InMemory;
