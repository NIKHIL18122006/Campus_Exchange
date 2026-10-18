import { verifyToken } from "../services/token.js";

export function  requireAuth(req, res, next) {
    const authHeader = req.headers.authorization || '';
    const [scheme, token] = authHeader.split(' ');

    if(scheme !== 'Bearer' || !token) {
        return res.status(401).json({ error: 'Authentication required' });
    }

    try{
        const payload = verifyToken(token);
        req.user = { id: payload.sub };
        next();
    }catch(err){
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
}