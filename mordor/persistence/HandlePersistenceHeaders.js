import { persistenceStrategy, testingPersistenceStrategy } from "../config/persistence";

export async function handlePersistenceHeaders({ req, res }) {
    if(req.headers['clear-persistence']?.toLowerCase() == 'true') {
        await testingPersistenceStrategy._reset();
    }
    return {
        persistence: req.headers['mock-persistence']?.toLowerCase() == 'true' ? testingPersistenceStrategy : persistenceStrategy,
    };
}
