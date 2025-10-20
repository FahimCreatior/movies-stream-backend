const requireUser = (req, res, next) => {
    const user = res.locals?.user;
    console.log('🔒 RequireUser Debug:', {
        url: req.url,
        method: req.method,
        hasUser: !!user,
        userEmail: user?.email,
        userId: user?._id
    });
    if (!user) {
        console.log('❌ Access denied - no user found');
        return res.status(403).send('Not authorized.');
    }
    console.log('✅ Access granted for user:', user?.email);
    return next();
};
export { requireUser };
//# sourceMappingURL=requireUser.js.map