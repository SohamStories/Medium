import { Hono } from 'hono'
import { PrismaClient } from '@prisma/client/edge'
import { withAccelerate } from '@prisma/extension-accelerate'
import { sign,verify,decode } from 'hono/jwt'
// import { jwt } from 'jsonwebtoken'
// import jwt from 'jsonwebtoken'; 
const userRouter = new Hono<{
	Bindings: {
		DATABASE_URL: string,
    JWT_SECRET: string,
    userId: string
	}
}>();

userRouter.use('/api/v1/blog/*', async (c, next) => {
	const jwt = c.req.header('Authorization');
	if (!jwt) {
		c.status(401);
		return c.json({ error: "unauthorized" });
	}
	const token = jwt.split(' ')[1];
	const payload = await verify(token, c.env.JWT_SECRET);
	if (!payload) {
		c.status(401);
		return c.json({ error: "unauthorized" });
	}
//@ts-ignore
	c.set('userId', payload.id);
	await next()
})

userRouter.post('/api/v1/user/signup', async  (c) => {
  const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate())

    const body = await c.req.json();

    try {
      const user = await prisma.user.create({

        data: {
          email: body.email,
          password: body.password
        }

      });
      console.log("user created",user)
      const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
      console.log('JWT Secret:',jwt);

        return c.json({" jwt ":jwt});
      
    } catch(e){
      c.status(403);
      return c.json ({error: "error while signing up "});
    }
})


userRouter.post('/api/v1/user/signin', async (c) => {

  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
}).$extends(withAccelerate());

const body = await c.req.json();
const user = await prisma.user.findUnique({

  where: {
    email: body.email
  }
});

if (!user){
  c.status(403);
  return c.json({error: "user not found "});
}
const jwt = await sign({ id: user.id },c.env.JWT_SECRET);
return c.json ({ jwt });
})


userRouter.post('/api/v1/blog', (c) => {
  //@ts-ignore
  console.log(c.get('userId'));
	return c.text('signin route')
  // return c.text('POST BLOG MAN ')
})


userRouter.put('/api/v1/blog', (c) => {

 //@ts-ignore
  console.log(c.get('userId'));
	return c.text('signin route')
})


userRouter.get('/api/v1/blog/:id', (c) => {

  const id = c.req.param('id')
  console.log(id);
  //@ts-ignore
  console.log(c.get('userId'));
	return c.text('signin route')
})


userRouter.get('/api/v1/blog/bulk', (c) => {
  return c.text('GIVE ALL BLOG ')
})



export default userRouter
