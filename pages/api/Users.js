// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// prisma using API routes
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
export default async function handle(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ pesan: "method tidak di izinkan" });
  } else if (req.method == "POST") {
    if (req.body.action === "singleDelete") {
      await prisma.users.delete({
        where: {
          id: parseInt(req.body.userID),
        },
      });
      return res.status(200).json({ pesan: "user deleted" });
    } else if (req.body.action === "insertUser") {
      await prisma.users.create({
        data: {
          firstname: req.body.firstname,
          lastname: req.body.lastName,
          // check this:
          phone: parseInt(req.body.phone),
          email: req.body.email,
          profilePicture: req.body.userPIP,
          homeAddress: req.body.homeAddress,
        },
      });
      return res.status(200).json({ Pesan: "okay" });
    } else if (req.body.action === "refetchUsers") {
      const users = await prisma.users.findMany();
      return res.status(200).json({ users: users });
    } else if (req.body.action === "updateUser") {
      const updateUser = await prisma.users.update({
        where: {
          id: parseInt(req.body.userID),
        },
        data: {
          firstname: req.body.userData.firstname,
          lastname: req.body.userData.lastName,
          // check this:
          phone: parseInt(req.body.userData.phone),
          email: req.body.userData.email,
          // profilePicture: req.body.userData.userPIP,
          homeAddress: req.body.userData.homeAddress,
        },
      });
      return res.status(200).json({ resp: "userUpdated" });
    } else if (req.body.action === "fetchUniqeUser") {
      const user = await prisma.users.findUnique({
        where: {
          id: parseInt(req.body.userID),
        },
      });
      return res.status(200).json({ user: user });
    } else if (req.body.action === "bulkDelete") {
      const deleteUsers = await prisma.users.deleteMany({
        where: {
          id: {
            in: req.body.userID,
          },
        },
      });
      return res.status(200).json({pesan: "deleteSucced"});
    }
  }
}
