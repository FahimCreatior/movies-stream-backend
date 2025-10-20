import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();
// Hardcoded JWT secret for development (since you're the only user)
const HARDCODED_JWT_SECRET = '7be008ba988e288381b0b1048521641285d7c8be80f0f501b64543e06f93f516';
console.log('🔐 JWT Utils loaded');
console.log('🔐 Using hardcoded JWT secret');
// Get JWT secret with better error handling
function getJwtSecret() {
    // Use hardcoded secret for simplicity
    const secret = HARDCODED_JWT_SECRET;
    console.log('✅ JWT Secret configured:', {
        length: secret.length,
        preview: secret.substring(0, 10) + '...'
    });
    return secret;
}
const signJWT = (object, options) => {
    try {
        const secret = getJwtSecret();
        console.log('🔐 Signing JWT:', {
            objectKeys: Object.keys(object),
            options,
            secretLength: secret.length
        });
        // Use the appropriate algorithm based on secret type
        const algorithm = 'HS256'; // Use HS256 for hardcoded secret
        const token = jwt.sign(object, secret, {
            ...(options && options),
            algorithm,
            issuer: 'movies-stream-backend',
            audience: 'movies-stream-frontend'
        });
        console.log('✅ JWT signed successfully:', {
            tokenLength: token.length,
            algorithm
        });
        return token;
    }
    catch (error) {
        console.error('❌ JWT Sign Error:', error.message);
        console.error('Error stack:', error.stack);
        throw new Error(`Token generation failed: ${error.message}`);
    }
};
const verifyJWT = (token) => {
    try {
        const secret = getJwtSecret();
        console.log('🔍 Verifying JWT:', {
            tokenLength: token.length,
            secretLength: secret.length
        });
        const decoded = jwt.verify(token, secret, {
            issuer: 'movies-stream-backend',
            audience: 'movies-stream-frontend'
        });
        console.log('✅ JWT verified successfully');
        return {
            valid: true,
            expired: false,
            decoded
        };
    }
    catch (e) {
        console.error('❌ JWT Verify Error:', e.message);
        const isExpired = e.message === 'jwt expired' ||
            e.message.includes('expired') ||
            e.name === 'TokenExpiredError';
        return {
            valid: false,
            expired: isExpired,
            decoded: null
        };
    }
};
export { signJWT, verifyJWT };
//# sourceMappingURL=jwt.utils.js.map