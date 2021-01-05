module.exports=function (req,res,next){
    // 401 Unauthorized
    // 400 Bad Request
    // 403 Forbidden
    if(!req.user.isAdmin) return res.status(403).send('Access Denied.');
    next();
}