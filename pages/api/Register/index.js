import nextConnect from "next-connect";
import multer from "multer";
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const apiRoute = nextConnect({
  onError: (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).end("Something broke!");
  },
  onNoMatch: (req, res) => {
    res.status(404).end("Page is not found");
  },
});

const upload = multer({
  storage: multer.diskStorage({
    destination: "./public/Users/",
    filename: (req, file, cb) => {
      if (
        file.mimetype == "image/png" ||
        file.mimetype == "image/svg+xml" ||
        file.mimetype == "image/jpeg"
      ) {
        const d = new Date();
        const fileName =
          file.originalname
            .split(".")
            .filter((data) => {
              return (
                data !=
                file.originalname.split(".")[
                  file.originalname.split(".").length - 1
                ]
              );
            })
            .join("_userImg_") +
          `${d.getDate()}${d.getMonth()}${d.getFullYear()}` +
          "_" +
          Math.round(Math.random() * Math.floor(1000)) +
          "." +
          file.originalname.split(".")[file.originalname.split(".").length - 1];
        cb(null, fileName);
      }
    },
  }),
});
const beginUpload = apiRoute.use(
  apiRoute.post("/api/Register", upload.single("userPIP"), async (req, res) => {
    await prisma.users.create({
      data: {
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        phone: parseInt(req.body.phone),
        email: req.body.email,
        profilePicture: req.file.filename,
        homeAddress: req.body.homeaddress,
      },
    });
    res.json({
      // body: req.body,
      // file: req.file,
      pesan: "userRegistered",
    });
  })
);
export default beginUpload;

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};
