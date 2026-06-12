# Railway 部署步骤

目标：电脑关掉也能用；顾客扫码能填表；老板在外面能登录 Admin。

## 1. 上传到 GitHub

1. 打开 GitHub。
2. New repository。
3. Repository name 可以放：

   ```text
   champion-feedback-mvp
   ```

4. 不要勾 Add README。
5. 创建 repo。
6. 把这个项目 zip 解压后的内容上传到 GitHub。

要上传的是项目里面这些文件夹和文件：

```text
app
components
lib
prisma
public
package.json
package-lock.json
next.config.mjs
railway.json
tailwind.config.ts
tsconfig.json
postcss.config.js
README.md
DEPLOY_RAILWAY.md
.node-version
.env.example
.gitignore
```

不要上传：

```text
node_modules
.next
.env
prisma/dev.db
```

如果 Railway build log 出现：

```text
You are using Node.js 18.x. For Next.js, Node.js version >=20.9.0 is required.
```

代表 GitHub 还没有上传新的 `package.json` / `.node-version`。重新上传这两个文件后 Redeploy。

## 2. 创建 Railway 项目

1. 打开 Railway。
2. New Project。
3. 选择 Deploy from GitHub repo。
4. 连接 GitHub。
5. 选择 `champion-feedback-mvp` repo。
6. 点击 Deploy。

第一次部署可能会因为还没有数据库变量而失败，这是正常的，下一步加数据库。

## 3. 添加 PostgreSQL 数据库

1. 在 Railway 项目页面点击 `+ New`。
2. 选择 `Database`。
3. 选择 `PostgreSQL`。
4. 等 Railway 创建完成。

## 4. 连接数据库变量

1. 点击你的 Next.js App 服务。
2. 打开 Variables。
3. 添加 / 引用 PostgreSQL 的：

   ```text
   DATABASE_URL
   ```

Railway 官方建议从 Postgres service 加 reference variable，这样数据库密码以后改变也会同步。

## 5. 设置其他环境变量

在 Next.js App 服务的 Variables 里添加：

```env
AUTH_SECRET=请放一串很长的随机英文数字
NEXT_PUBLIC_APP_URL=https://你的railway网址
COMPANY_WHATSAPP_URL=https://wa.me/60123456789
```

`NEXT_PUBLIC_APP_URL` 一开始还没有也没关系，先放临时：

```text
https://temp.up.railway.app
```

等生成 Railway domain 后再回来改。

## 6. 生成公开网址

1. 点击你的 Next.js App 服务。
2. 打开 Settings。
3. 找到 Networking。
4. 点击 Generate Domain。
5. 你会得到类似：

   ```text
   https://champion-feedback-production.up.railway.app
   ```

6. 回到 Variables，把 `NEXT_PUBLIC_APP_URL` 改成这个网址。
7. Redeploy。

## 7. 测试网址

顾客填写：

```text
https://你的railway网址/feedback
```

老板后台：

```text
https://你的railway网址/admin/login
```

Admin 登录：

```text
admin@championmotor.test
Admin123!
```

## 8. QR Code

部署完成并设置好 `NEXT_PUBLIC_APP_URL` 后：

1. 登录 Admin。
2. 打开 QR Codes。
3. 下载员工 QR 或分店 QR。
4. 用手机扫码测试。

QR 会指向云端网址，不再依赖你的电脑。
