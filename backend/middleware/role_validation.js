export const IsAdmin = async(req,res, next)=>{
    const userRole = req.user.role
    if(userRole == 'admin'){
        next()
    }else{
        res.status(403).json({
            success: false,
            auth: false,
            message: 'You are not admin'
        })
    }
}
export const IsMember = async(req,res, next)=>{
    const userRole = req.user.role
    if(userRole == 'member'){
        next()
    }else{
        res.status(403).json({
            success: false,
            auth: false,
            message: 'You are not member'
        })
    }
}