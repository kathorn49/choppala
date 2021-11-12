import dbConnect from "src/lib/dbConnect"
import User from "src/models/User"
import { getSession } from "next-auth/react"

export default async function handler(req, res) {
  console.log("here in API")
  const userSession = await getSession({ req })
  const { user } = userSession
  await dbConnect()

  console.log(req.body)
  const data = [req.body]
  const filter = { name: user.name, email: user.email }
  const update = { wishlist: data }
  await User.findOneAndUpdate(filter, update)
  res.status(200).json({ success: true })
}
