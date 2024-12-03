const asyncHandler = (func) => {
    (req, res, next) => {
        Promise.resolve(func(req, res, next))
        .catch(err => {
          next(err)  // would pass the error to the next middleware in the chain that is going to be a errorhandling middleware.
        })
  }}

  export {asyncHandler}





// const asyncHandler = (func) => async (req,res,next) => {
//     try{
//         await func(req,res,next)
//     }catch(err){
//        res.status(err.code || 500).json({
//         success: false,
//         message: err.message
//        })
//     }
// }

