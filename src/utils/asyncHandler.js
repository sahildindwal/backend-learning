const asyncHandler = (reqHandler) => {
    return (req,res,next) => {
        Promise.resolve(reqHandler(req,res,next))
        .catch((err) => next(err))
    }
}


export {asyncHandler};

// //method 2 using async await 
// const asyncHandler = (fn) => async (req,res,next) => {
//     try {
//         await fn(req,res,next)
//     } catch (error) {
//         res.status(err.code || 500).json({
//             success: false,
//             message: err.message
//         })
//     }
// }




// // () => () => {}  this is higher order function it is same as () => {() => {}} just removed the curly braces for first