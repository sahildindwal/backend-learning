import multer from "multer"

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp")    //cb is call back
  },
  filename: function (req, file, cb) {
        cb(null, file.originalname);
    }
})

export const upload = multer({
    storage    
})


// since we are using es6 no to return like this as they are same duplicate
// export const upload = multer({
//     storage: storage     
// })