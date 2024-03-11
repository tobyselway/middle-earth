import jwt from "jsonwebtoken";

export async function handleAuthHeaders({ req, res }) {
    if(!req.headers['authorization']) {
        return {
            authUser: null,
        };
    }
    // TODO: actually verify token
    const authUser = jwt.decode(req.headers['authorization'].replace('Bearer ', ''));
    return {
        authUser,
    };
}
